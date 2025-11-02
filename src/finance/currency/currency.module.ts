import { Module } from '@nestjs/common';
import CurrencyController from './currency.controller';
import CurrencyService from './currency.service';
import { PrismaClientService } from '@/clients/prisma.client';

@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService, PrismaClientService],
})
export default class CurrencyModule { }
