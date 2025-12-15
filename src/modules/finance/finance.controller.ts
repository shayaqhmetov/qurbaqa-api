import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import AccountService from './account.service';
import {
  AccountDto,
  CreateAccountDto,
  AccountResponseDto,
  AccountsResponseDto,
  AccountTypesResponseDto,
} from './dtos/account.dto';
import { CurrentUser } from '@/modules/auth/user/user.decorator';
import { RequireModule } from '@/modules/modules/module-access.guard';
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { $Enums } from 'generated/prisma';
import {
  CurrencyDto,
  CreateCurrencyDto,
  CurrencyResponseDto,
  CurrenciesResponseDto,
} from './currency/currency.dto';
import CurrencyService from './currency/currency.service';
import {
  EntityTypeField,
  TranslatableFields,
} from '@/interceptors/response.interceptor';
import { TranslationEntityType } from '../translation/translation.dto';

@ApiTags('finance')
@Controller('finance')
@RequireModule('FINANCE')
@ApiBearerAuth('access_token')
export class FinanceController {
  constructor(
    protected readonly accountService: AccountService,
    protected readonly currencyService: CurrencyService,
  ) { }

  @Get('account/:id')
  @ApiOperation({ summary: 'Get account info by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiOkResponse({ description: 'Account info', type: AccountResponseDto })
  async getAccountInfo(@Param() params: { id: string }): Promise<AccountDto> {
    const account = await this.accountService.getAccountById(params.id);
    return account;
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiOkResponse({
    description: 'List of accounts',
    type: AccountsResponseDto,
  })
  async getAccounts(): Promise<AccountDto[]> {
    const accounts = await this.accountService.getAllAccounts();
    return accounts;
  }

  @Post('account')
  @ApiOperation({ summary: 'Create new account' })
  @ApiBody({ type: CreateAccountDto })
  @ApiOkResponse({ description: 'Created account', type: AccountResponseDto })
  async createAccount(
    @CurrentUser() user: any,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<AccountDto> {
    console.log('Current User:', user);
    const account = await this.accountService.createAccount(
      createAccountDto,
      user.sub,
    );
    return account;
  }

  @Get('types')
  @ApiOperation({ summary: 'Get account types' })
  @ApiOkResponse({
    description: 'List of account types',
    type: AccountTypesResponseDto,
  })
  async getAccountTypes(): Promise<string[]> {
    const types = Object.values($Enums.AccountType);
    return types;
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Get all currencies' })
  @ApiOkResponse({
    description: 'List of currencies',
    type: CurrenciesResponseDto,
  })
  @TranslatableFields('name')
  @EntityTypeField(TranslationEntityType.Currency)
  async getCurrencies(): Promise<CurrencyDto[]> {
    const currencies = await this.currencyService.getAllCurrencies();
    return currencies;
  }

  @Post('currencies')
  @ApiOperation({ summary: 'Create new currency' })
  @ApiBody({ type: CreateCurrencyDto })
  @ApiOkResponse({ description: 'Created currency', type: CurrencyResponseDto })
  async createCurrency(
    @Body() createCurrencyDto: CreateCurrencyDto,
  ): Promise<CurrencyDto> {
    return this.currencyService.createCurrency(createCurrencyDto);
  }
}
