import { IsEnum, IsString, IsDecimal } from 'class-validator';
import { AccountType } from 'generated/prisma';

export class CreateAccountDto {
  @IsString()
  name: string;
  @IsEnum(AccountType)
  accountType: AccountType;
  @IsString()
  userId: string;
  @IsString()
  currencyCode: string;
  @IsDecimal()
  balance?: number;
  @IsString()
  accountNumber?: string;
  @IsString()
  institutionId?: string;
}
