import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';

import { PrismaClientService } from '@/clients/prisma.client';
import { CreateAccountDto } from './dtos/account.dto';

@Injectable()
export default class AccountService {
  private readonly logger = new Logger(AccountService.name);
  constructor(
    @Inject(PrismaClientService)
    protected readonly prismaClientService: PrismaClientService,
  ) { }

  async getAccountById(accountId: string) {
    const account = await this.prismaClientService.account.findUnique({
      where: { id: accountId },
    });
    this.logger.log(`Fetched account with ID: ${accountId}`, account);
    if (!account) {
      this.logger.warn(`Account with ID: ${accountId} not found`);
      throw new NotFoundException(`Account with ID: ${accountId} not found`);
    }
    return account;
  }

  async createAccount(createAccountDto: CreateAccountDto) {
    const account = await this.prismaClientService.account.create({
      data: {
        name: createAccountDto.name,
        type: createAccountDto.accountType,
        balance: createAccountDto.balance || 0,
        accountNumber: createAccountDto.accountNumber || null,
        institutionId: createAccountDto.institutionId || null,
        lastSyncAt: null,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          connect: { id: createAccountDto.userId },
        },
        currency: {
          connect: { code: createAccountDto.currencyCode },
        },
      },
    });
    this.logger.log(`Created new account with ID: ${account.id}`, account);
    return account;
  }
}
