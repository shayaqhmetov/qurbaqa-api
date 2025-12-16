import { SetMetadata } from '@nestjs/common';
import { ENTITY_TYPE_KEY, TRANSLATABLE_FIELDS_KEY } from './constants';
import { TranslationEntityType } from './modules/translation/translation.dto';

export const TranslatableFields = (fields: string[]) =>
  SetMetadata(TRANSLATABLE_FIELDS_KEY, fields);

export const EntityTypeField = (entityType: TranslationEntityType) =>
  SetMetadata(ENTITY_TYPE_KEY, entityType);
