import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { TranslationEntityType } from 'generated/prisma';

export class UpsertTranslationDto {
  @IsString()
  @IsNotEmpty()
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
