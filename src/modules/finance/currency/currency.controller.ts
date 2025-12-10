import { Body, Controller, Inject, Post } from '@nestjs/common';
import CurrencyService from './currency.service';
import {
  CurrencyDto,
  CreateCurrencyDto,
  CurrencyResponseDto,
} from './currency.dto';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Controller('currency')
@ApiTags('finance')
@ApiBearerAuth('access_token')
export default class CurrencyController {
  constructor(
    @Inject(CurrencyService) private currencyService: CurrencyService,
  ) {}

  @Post('')
  @ApiOperation({ summary: 'Create new currency' })
  @ApiBody({ type: CreateCurrencyDto })
  @ApiOkResponse({ description: 'Created currency', type: CurrencyResponseDto })
  async createCurrency(
    @Body() createCurrencyDto: CreateCurrencyDto,
  ): Promise<CurrencyDto> {
    return this.currencyService.createCurrency(createCurrencyDto);
  }
}
