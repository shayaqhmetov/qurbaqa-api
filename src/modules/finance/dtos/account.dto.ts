import { IsEnum, IsString, IsDecimal } from 'class-validator';
import { AccountType } from 'generated/prisma';
import { ApiProperty } from '@nestjs/swagger';
import { BaseApiResponse } from '@/dto';
import { Decimal } from 'generated/prisma/runtime/library';

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

export class AccountDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: Decimal })
  balance: Decimal;

  @ApiProperty({ type: String, required: false })
  accountNumber?: string;

  @ApiProperty({ type: String, required: false })
  institutionId?: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class AccountResponseDto extends BaseApiResponse<AccountDto> {
  @ApiProperty({ type: AccountDto, isArray: false })
  data: AccountDto;
}

export class AccountsResponseDto extends BaseApiResponse<AccountDto[]> {
  @ApiProperty({ type: AccountDto, isArray: true })
  data: AccountDto[];
}
