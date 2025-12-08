import { IsEnum, IsString, IsDecimal } from 'class-validator';
import { AccountType } from 'generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({ type: String })
  @IsString()
  userId: string;

  @ApiProperty({ type: String })
  @IsString()
  currencyCode: string;

  @ApiProperty({ type: Number, required: false })
  @IsDecimal()
  balance?: number;

  @ApiProperty({ type: String, required: false })
  @IsString()
  accountNumber?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  institutionId?: string;
}
