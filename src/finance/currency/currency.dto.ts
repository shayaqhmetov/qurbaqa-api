import { IsString } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  code: string;
  @IsString()
  name: string;
  @IsString()
  symbol: string;
}
