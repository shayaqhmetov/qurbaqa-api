/* eslint-disable prettier/prettier */
import Redis from 'ioredis';
import { Logger, Inject } from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { PrismaClientService } from '@/clients/prisma.client';
import { REDIS_CLIENT } from '@/redis/redis.module';
import {
  TranslationEntityType,
  TranslationFilterDto,
  UpsertTranslationDto,
} from './translation.dto';
import { MESSAGES } from './translation.constants';
@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(PrismaClientService) private readonly prisma: PrismaClientService,
  ) { }

  private cacheKey(entityType: string, entityId: string, locale: string) {
    return `trans:${entityType}:${entityId}:${locale}`;
  }

  /**
   * Replaces placeholders in a template string with corresponding values from the provided parameters object.
   *
   * Placeholders in the template should be in the format `{key}`. If a key from the template is not found in the
   * `params` object, the placeholder is left unchanged.
   *
   * @param template - The string containing placeholders to be replaced.
   * @param params - An optional object mapping placeholder keys to their replacement values.
   * @returns The template string with placeholders replaced by their corresponding values from `params`.
   */
  private interpolate(template: string, params?: Record<string, any>) {
    if (!params) return template;
    return template.replace(/\{([^}]+)\}/g, (_, k) => {
      const v = params[k.trim()];
      return v === undefined ? `{${k}}` : String(v);
    });
  }

  // simple i18n key lookup (UI strings). Optional: use a dedicated entityType 'ui'
  async t(
    locale: string,
    key: string,
    field: string,
    entityType: TranslationEntityType,
    params?: Record<string, any>,
    fallback = 'en',
  ) {
    const cacheKey = `i18n:${locale}:${key}`;
    const cached = await this.redis.get(cacheKey);
    console.log('TranslationService.t cacheKey:', cacheKey, 'cached:', cached);
    if (cached) return this.interpolate(JSON.parse(cached), params);

    console.log(entityType, key, locale, 'TranslationService.t invoked');
    // try find translation row for ui
    const tr = await this.prisma.translation.findFirst({
      where: {
        entityType,
        entityId: key,
        field,
        locale,
      },
    });
    console.log('TranslationService.t invoked', tr);

    let value = tr?.value;
    if (!value && fallback) {
      const fb = await this.prisma.translation.findFirst({
        where: {
          entityType,
          entityId: key,
          field,
          locale: fallback,
        },
      });
      value = fb?.value ?? key;
    }

    await this.redis.set(cacheKey, JSON.stringify(value), 'EX', 60 * 60); // 1 hour
    return this.interpolate(value || key, params);
  }

  // batch fetch translations for many entityIds and fields + locales
  async batchFetchTranslations(
    opts: {
      entityType: TranslationEntityType;
      entityIds: string[];
      fields: string[];
      locales: string[];
    },
    inifinityCache = false,
  ) {
    const { entityType, entityIds, fields, locales } = opts;
    if (!entityIds.length || !fields.length || !locales.length) return {};

    // Build redis keys per entityId+locale
    const keys: { entityId: string; locale: string; key: string }[] = [];
    for (const id of entityIds) {
      for (const loc of locales) {
        keys.push({
          entityId: id,
          locale: loc,
          key: this.cacheKey(entityType, id, loc),
        });
      }
    }

    // Try Redis first (pipeline)
    const pipe = this.redis.pipeline();
    for (const k of keys) pipe.get(k.key);
    const redisResults = await pipe.exec();

    const map: Record<string, Record<string, Record<string, string>>> = {};
    const missing: { entityId: string; locale: string }[] = [];

    keys.forEach((k, i) => {
      const [, val] = redisResults[i] ?? [];
      if (val) {
        try {
          const parsed = JSON.parse(val as string) as Record<string, string>;
          map[k.entityId] ??= {};
          map[k.entityId][k.locale] = parsed;
        } catch {
          missing.push({ entityId: k.entityId, locale: k.locale });
        }
      } else {
        missing.push({ entityId: k.entityId, locale: k.locale });
      }
    });

    // Fetch missing from DB in a single query
    if (missing.length) {
      const missingIds = Array.from(new Set(missing.map((m) => m.entityId)));
      const missingLocales = Array.from(new Set(missing.map((m) => m.locale)));

      const rows = await this.prisma.translation.findMany({
        where: {
          entityType,
          entityId: { in: missingIds },
          field: { in: fields },
          locale: { in: missingLocales },
        },
      });

      // Group rows and write back to Redis
      const grouped: Record<
        string,
        Record<string, Record<string, string>>
      > = {};
      for (const r of rows) {
        grouped[r.entityId] ??= {};
        grouped[r.entityId][r.locale] ??= {};
        grouped[r.entityId][r.locale][r.field] = r.value;
      }

      const writePipe = this.redis.pipeline();
      for (const id of missingIds) {
        for (const loc of missingLocales) {
          const payload = grouped[id]?.[loc] ?? {};
          if (Object.keys(payload).length) {
            if (inifinityCache) {
              writePipe.set(
                this.cacheKey(entityType, id, loc),
                JSON.stringify(payload)
              );
            } else {
              writePipe.set(
                this.cacheKey(entityType, id, loc),
                JSON.stringify(payload),
                'EX',
                300
              );
            }
            map[id] ??= {};
            map[id][loc] = payload;
          }
        }
      }
      await writePipe.exec();
    }

    return map;
  }

  // apply translations with locale priority to array of entities
  applyTranslationsToEntities<T extends { id: any }>(
    entities: T[],
    translationsMap: Record<string, Record<string, Record<string, string>>>,
    fields: string[],
    locales: string[],
  ): T[] {
    return entities.map((ent) => {
      const key = String(ent.id);
      const langs = translationsMap[key] ?? {};
      for (const field of fields) {
        for (const loc of locales) {
          const v = langs[loc]?.[field];
          if (v !== undefined) {
            (ent as any)[field] = v;
            break;
          }
        }
      }
      return ent;
    });
  }

  // upsert and invalidate cache
  async upsertTranslation(payload: UpsertTranslationDto) {
    const idString = String(payload.entityId);
    const data = {
      entityType: payload.entityType,
      entityId: idString,
      field: payload.field,
      locale: payload.locale,
      value: payload.value,
      source: payload.source ?? 'manual',
      isProofread: payload.isProofread ?? false,
    };

    const upserted = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.translation.findFirst({
        where: {
          entityType: data.entityType,
          entityId: data.entityId,
          field: data.field,
          locale: data.locale,
        },
      });

      if (existing) {
        return tx.translation.update({ where: { id: existing.id }, data });
      }
      return tx.translation.create({ data });
    });

    await this.redis.del(
      this.cacheKey(data.entityType, data.entityId, data.locale),
    );
    return upserted;
  }

  async getLanguages() {
    return this.prisma.language.findMany({
      select: { code: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async getAllTranslations(filter: TranslationFilterDto) {
    const where: any = {};
    if (filter.entityId) {
      where.entityId = filter.entityId;
    }
    return this.prisma.translation.findMany({ where });
  }

  async getTranslatableEntities() {
    // currently hardcoded, could be dynamic in future
    return [TranslationEntityType.Module];
  }

  async deleteTranslation(id: string): Promise<void> {
    const translation = await this.prisma.translation.findUnique({
      where: { id },
    });

    // soft delete
    if (translation) {
      await this.prisma.$transaction(async (tx) => {
        await tx.translation.delete({ where: { id } });
        await this.redis.del(
          this.cacheKey(
            translation.entityType,
            translation.entityId,
            translation.locale,
          ),
        );
      });
    }
  }

  async partialUpdateTranslation(id: string, dto: Partial<UpsertTranslationDto>) {
    const existing = await this.prisma.translation.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(MESSAGES.TRANSLATION_NOT_FOUND);
    }

    if(Object.keys(dto).length === 0) {
      return existing;
    }

    const updated = await this.prisma.translation.update({
      where: { id },
      data: {
        entityType: dto.entityType ?? existing.entityType,
        entityId: dto.entityId ? String(dto.entityId) : existing.entityId,
        field: dto.field ?? existing.field,
        locale: dto.locale ?? existing.locale,
        value: dto.value ?? existing.value,
        source: dto.source ?? existing.source,
        isProofread: dto.isProofread ?? existing.isProofread,
      },
    });

    await this.redis.del(
      this.cacheKey(
        updated.entityType,
        updated.entityId,
        updated.locale,
      ),
    );
    
    return updated;
  }
}
