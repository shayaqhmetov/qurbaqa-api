import { TranslationEntityType } from './translation.dto';

export const TRANSLATABLE_FIELDS: Record<TranslationEntityType, string[]> = {
  Currency: ['name'],
  Module: ['name', 'description'],
};
