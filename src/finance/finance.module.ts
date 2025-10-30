import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { PrismaClientService } from '../clients/prisma.client';
import AccountService from './account.service';

@Module({
  controllers: [FinanceController],
  providers: [PrismaClientService, AccountService],
})
export class FinanceModule { }
