import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TranslationEntityType {
  Module = 'Module',
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
}
