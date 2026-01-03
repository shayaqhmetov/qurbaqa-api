/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import AccountService from './account.service';
import {
  AccountDto,
  CreateAccountDto,
  AccountResponseDto,
  AccountTypeDataDto,
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
  ApiQuery,
} from '@nestjs/swagger';
import { $Enums } from 'generated/prisma';
import {
  CurrencyDto,
  CreateCurrencyDto,
  CurrencyResponseDto,
  CurrenciesResponseDto,
  UpdateCurrencyDto,
} from './currency/currency.dto';
import CurrencyService from './currency/currency.service';
import { TranslationEntityType } from '../translation/translation.dto';
import { LocalizationInterceptor } from '@/interceptors/localization.interceptor';
import { TranslationService } from '../translation/translation.service';
import { EntityTypeField, TranslatableFields } from '@/metadata';
import { TRANSLATABLE_FIELDS } from '../translation/translation.constants';
import { translations } from "@/i18n/";
import { QueryLangDto } from '@/dto';
import FinanceService from './finance.service';
import { DEFAULT_LOCALE } from '@/constants';

@ApiTags('finance')
@Controller('finance')
@RequireModule('FINANCE')
@ApiBearerAuth('access_token')
export class FinanceController {
  constructor(
    protected readonly accountService: AccountService,
    protected readonly currencyService: CurrencyService,
    protected readonly translationService: TranslationService,
    protected readonly financeService: FinanceService,
  ) { }

  @Get('accounts/:id')
  @ApiOperation({ summary: 'Get account info by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiOkResponse({ description: 'Account info', type: AccountResponseDto })
  @TranslatableFields(TRANSLATABLE_FIELDS.Account)
  @EntityTypeField(TranslationEntityType.Account)
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
  @TranslatableFields(TRANSLATABLE_FIELDS.Account)
  @EntityTypeField(TranslationEntityType.Account)
  @UseInterceptors(LocalizationInterceptor)
  @ApiQuery({ name: 'lang', required: false, description: 'Language code for localization' })
  async getAccounts(@Req() req: QueryLangDto): Promise<AccountDto[]> {
    const accounts = await this.accountService.getAllAccounts();
    return await this.financeService.translateEntities<AccountDto>(req, accounts, TRANSLATABLE_FIELDS.Account);
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Create new account' })
  @ApiBody({ type: CreateAccountDto })
  @ApiOkResponse({ description: 'Created account', type: AccountResponseDto })
  @TranslatableFields(TRANSLATABLE_FIELDS.Account)
  @EntityTypeField(TranslationEntityType.Account)
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
  @TranslatableFields(TRANSLATABLE_FIELDS.AccountType)
  @EntityTypeField(TranslationEntityType.AccountType)
  @UseInterceptors(LocalizationInterceptor)
  @ApiQuery({ name: 'lang', required: false, description: 'Language code for localization' })
  async getAccountTypes(@Req() req): Promise<AccountTypeDataDto[]> {
    const locale = req.locale;
    let types = Object.values($Enums.AccountType).map((type) => ({
      type: type,
      name: type,
    }));
    if (translations[locale] && translations[locale].accountType) {
      types = Object.keys(translations[locale].accountType).map((translationKEY: $Enums.AccountType) => {
        return {
          type: translationKEY,
          name: translations[locale].accountType[translationKEY],
        }
      });
    }
    return types;
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Get all currencies' })
  @ApiOkResponse({
    description: 'List of currencies',
    type: CurrenciesResponseDto,
  })
  @TranslatableFields(TRANSLATABLE_FIELDS.Currency)
  @EntityTypeField(TranslationEntityType.Currency)
  @UseInterceptors(LocalizationInterceptor)
  @ApiQuery({ name: 'lang', required: false, description: 'Language code for localization' })
  async getCurrencies(@Req() req: QueryLangDto): Promise<CurrencyDto[]> {
    const currencies = await this.currencyService.getAllCurrencies();
    return await this.financeService.translateEntities<CurrencyDto>(req, currencies, TRANSLATABLE_FIELDS.Currency);
  }

  @Post('currencies')
  @ApiOperation({ summary: 'Create new currency' })
  @ApiBody({ type: UpdateCurrencyDto })
  @ApiOkResponse({ description: 'Created currency', type: CurrencyResponseDto })
  @EntityTypeField(TranslationEntityType.Currency)
  @UseInterceptors(LocalizationInterceptor)
  async createCurrency(
    @Body() createCurrencyDto: CreateCurrencyDto,
  ): Promise<CurrencyDto> {
    return this.currencyService.createCurrency(createCurrencyDto);
  }


  @Patch('currencies/:id')
  @ApiOperation({ summary: 'Update currency by ID' })
  @ApiQuery({ name: 'lang', required: false, description: 'Language code for localization' })
  @ApiParam({ name: 'id', description: 'Currency ID' })
  @ApiBody({ type: UpdateCurrencyDto })
  @ApiOkResponse({ description: 'Updated currency', type: CurrencyResponseDto })
  @EntityTypeField(TranslationEntityType.Currency)
  @UseInterceptors(LocalizationInterceptor)
  async updateCurrency(
    @Req() req: QueryLangDto,
    @Param() params: { id: string },
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<CurrencyDto> {
    const updatedCurrency =  await this.currencyService.patchCurrency(
      params.id,
      req.locale || DEFAULT_LOCALE,
      updateCurrencyDto,
    );
    const result = await this.financeService.translateEntity<CurrencyDto>(
      req,
      updatedCurrency,
      TRANSLATABLE_FIELDS.Currency,
    );
    return result;
  }
}