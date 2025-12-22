import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseApiResponse } from '@/dto';

export enum TranslationEntityType {
  Module = 'Module',
  Currency = 'Currency',
}

export class UpsertTranslationDto {
  @ApiProperty({ enum: TranslationEntityType })
  @IsEnum(TranslationEntityType)
  @IsNotEmpty()
  entityType: TranslationEntityType;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  locale: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  field: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  value: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  source?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  isProofread?: boolean;
}

export class PartialUpsertTranslationDto {
  @ApiProperty({ enum: TranslationEntityType, required: false })
  @IsEnum(TranslationEntityType)
  @IsOptional()
  entityType?: TranslationEntityType;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  entityId?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  locale?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  field?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  value?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  source?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  isProofread?: boolean;
}

export class LanguageDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  name: string;
}

export class TranslationDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ enum: TranslationEntityType })
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  field: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  locale: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  value: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  source?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  isProofread?: boolean;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  updatedAt: Date;

  @ApiProperty({ type: Date })
  deletedAt: Date;
}

export class TranslationResponseDto extends BaseApiResponse<TranslationDto> {
  @ApiProperty({ type: TranslationDto })
  data: TranslationDto;
}

export class TranslationsResponseDto extends BaseApiResponse<TranslationDto[]> {
  @ApiProperty({ type: [TranslationDto] })
  data: TranslationDto[];
}

export class TranslatableEntitiesResponseDto extends BaseApiResponse<string[]> {
  @ApiProperty({ type: [String] })
  data: string[];
}

export class LanguagesResponseDto extends BaseApiResponse<LanguageDto[]> {
  @ApiProperty({ type: [LanguageDto] })
  data: LanguageDto[];
}

export class TranslationFilterDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  entityId?: string;
}
