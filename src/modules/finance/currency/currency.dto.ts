import { IsString } from 'class-validator';
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
