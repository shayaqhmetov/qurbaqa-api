import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseApiResponse } from '@/dto';

export class CreateCurrencyDto {
  @ApiProperty({ type: String })
  @IsString()
  code: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  symbol: string;
}

export class UpdateCurrencyDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  symbol?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  code?: string;
}

export class CurrencyDto {
  @ApiProperty({ type: String })
  @IsString()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  code: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  symbol: string;
}

export class CurrencyResponseDto extends BaseApiResponse<CurrencyDto> {
  @ApiProperty({ type: CurrencyDto })
  data: CurrencyDto;
}

export class CurrenciesResponseDto extends BaseApiResponse<CurrencyDto[]> {
  @ApiProperty({ type: [CurrencyDto] })
  data: CurrencyDto[];
}
