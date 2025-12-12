import { PrismaClientService } from '@/clients/prisma.client';
import { Inject, Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './currency.dto';

@Injectable()
export default class CurrencyService {
  constructor(
    @Inject(PrismaClientService)
    private readonly prismaClient: PrismaClientService,
  ) {}

  async createCurrency(createCurrencyDto: CreateCurrencyDto) {
    const currency = await this.prismaClient.currency.create({
      data: {
        code: createCurrencyDto.code,
        name: createCurrencyDto.name,
        symbol: createCurrencyDto.symbol,
      },
    });
    return currency;
  }

  async getAllCurrencies() {
    const currencies = await this.prismaClient.currency.findMany();
    return currencies;
  }
}
