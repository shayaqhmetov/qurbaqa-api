import { Body, Controller, Inject, Post } from '@nestjs/common';
import CurrencyService from './currency.service';
import { CreateCurrencyDto } from './currency.dto';

@Controller('currency')
export default class CurrencyController {
  constructor(
    @Inject(CurrencyService) private currencyService: CurrencyService,
  ) { }

  @Post('')
  async createCurrency(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currencyService.createCurrency(createCurrencyDto);
  }
}
