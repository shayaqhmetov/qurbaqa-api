import { TranslationEntityType } from './translation.dto';

export const TRANSLATABLE_FIELDS: Record<TranslationEntityType, string[]> = {
  Currency: ['name'],
  Module: ['name', 'description'],
};

export const MESSAGES = {
  TRANSLATION_DELETED: 'Translation deleted successfully',
  TRANSLATION_NOT_FOUND: 'Translation not found',
};
