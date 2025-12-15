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
    entityType: TranslationEntityType,
    params?: Record<string, any>,
    fallback = 'en',
  ) {
    const cacheKey = `i18n:${locale}:${key}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return this.interpolate(JSON.parse(cached), params);

    // try find translation row for ui
    const tr = await this.prisma.translation.findFirst({
      where: {
        entityType,
        entityId: key,
        field: 'value',
        locale,
      },
    });

    let value = tr?.value;
    if (!value && fallback) {
      const fb = await this.prisma.translation.findFirst({
        where: {
          entityType,
          entityId: key,
          field: 'value',
          locale: fallback,
        },
      });
      value = fb?.value ?? key;
    }

    await this.redis.set(cacheKey, JSON.stringify(value), 'EX', 60 * 60); // 1 hour
    return this.interpolate(value || key, params);
  }

  // batch fetch translations for many entityIds and fields + locales
  async batchFetchTranslations(opts: {
    entityType: TranslationEntityType;
    entityIds: string[]; // stringified ids
    fields: string[];
    locales: string[]; // ordered preferred locales
  }) {
    const { entityType, entityIds, fields, locales } = opts;
    if (!entityIds.length) return {};

    const rows = await this.prisma.translation.findMany({
      where: {
        entityType,
        entityId: { in: entityIds },
        field: { in: fields },
        locale: { in: locales },
      },
    });

    const map: Record<string, Record<string, Record<string, string>>> = {};
    for (const r of rows) {
      map[r.entityId] ??= {};
      map[r.entityId][r.locale] ??= {};
      map[r.entityId][r.locale][r.field] = r.value;
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
}
