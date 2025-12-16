/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

import { TranslationService } from '../modules/translation/translation.service';
import { TranslationEntityType } from '@/modules/translation/translation.dto';
import { ENTITY_TYPE_KEY } from '@/constants';

@Injectable()
export class LocalizationInterceptor implements NestInterceptor {
  constructor(
    private translationService: TranslationService,
    private reflector: Reflector,
  ) {}

  async translate<T extends { id: string }>(entities: T[], locale: string, fields: string[]): Promise<T[]> {
    const translationMap = await this.translationService.batchFetchTranslations(
      {
        entityType: TranslationEntityType.Currency,
        entityIds: entities.map((c) => c.id.toString()),
        fields,
        locales: [locale],
      },
      true,
    );
    return this.translationService.applyTranslationsToEntities(
      entities,
      translationMap,
      fields,
      [locale],
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const locale = req.locale || 'en';
    const entityType = this.reflector.getAllAndOverride<TranslationEntityType>(
      ENTITY_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );
    req.entityType = entityType;
    // attach helper

    req.translate = (entities, fields) =>
      this.translate(entities, locale, fields);
    // pass through — heavy localization of response should be explicit in services/controllers
    return next.handle().pipe(map((x) => x));
  }
}
