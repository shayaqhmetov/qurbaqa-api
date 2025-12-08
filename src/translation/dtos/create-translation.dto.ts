import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
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
