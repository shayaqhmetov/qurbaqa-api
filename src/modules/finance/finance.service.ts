import { QueryLangDto } from '@/dto';
import { Injectable } from '@nestjs/common';
import { TranslationService } from '../translation/translation.service';
import {
  TranslationDto,
  TranslationEntityType,
} from '../translation/translation.dto';

@Injectable()
export default class FinanceService {
  constructor(protected readonly translationService: TranslationService) { }

  async translateEntities<T extends { id: string }>(
    req: QueryLangDto,
    items: T[],
    fields: string[],
  ): Promise<T[]> {
    if (!req.translate) {
      return items;
    }
    return await req.translate(items, fields);
  }

  async translateEntity<T extends { id: string }>(
    req: QueryLangDto,
    item: T,
    fields: string[],
  ): Promise<T> {
    if (!req.translate) {
      return item;
    }
    const [translatedItem] = await req.translate([item], fields);
    return translatedItem;
  }

  async updateTranslation(
    req: QueryLangDto,
    entityType: TranslationEntityType,
    entityId: string,
    field: string,
    value: string,
  ): Promise<TranslationDto> {
    if (!req.translate) {
      return null;
    }
    const translation = await this.translationService.upsertTranslation({
      entityType,
      entityId,
      field,
      value,
      locale: req.locale,
    });
    return translation;
  }
}
