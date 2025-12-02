import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateTranslationDto {
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsNumber()
  entityId: number;

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
}
