import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { PrismaClientService } from '../../clients/prisma.client';
import AccountService from './account.service';
import { UserService } from '@/modules/auth/user/user.service';
import { KeycloakAdminService } from '@/keycloak/keycloak.service';
import CurrencyModule from './currency/currency.module';

@Module({
  imports: [CurrencyModule],
  controllers: [FinanceController],
  providers: [
    PrismaClientService,
    AccountService,
    UserService,
    KeycloakAdminService,
  ],
})
export class FinanceModule { }
