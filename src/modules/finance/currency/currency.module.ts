import { Module } from '@nestjs/common';
import CurrencyService from './currency.service';
import { PrismaClientService } from '@/clients/prisma.client';

@Module({
  providers: [CurrencyService, PrismaClientService],
  exports: [CurrencyService],
})
export default class CurrencyModule { }
