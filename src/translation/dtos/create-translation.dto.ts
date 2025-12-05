import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum TranslationEntityType {
  Module = 'Module',
}

export class UpsertTranslationDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(TranslationEntityType)
  entityType: TranslationEntityType;
  @IsString()
  @IsNotEmpty()
  entityId: string | number;
  @IsString()
  @IsNotEmpty()
  field: string;
  @IsString()
  @IsNotEmpty()
  locale: string;
  @IsString()
  @IsNotEmpty()
  value: string;
  @IsString()
  @IsOptional()
  source?: string;
  @IsOptional()
  isProofread?: boolean;
}
