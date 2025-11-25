import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common/exceptions';

import { PrismaClientService } from '@/clients/prisma.client';
import { CreateAccountDto } from './dtos/account.dto';
import { UserService } from '@/auth/user/user.service';
import * as ErrorMessages from '@/messages/error.messages';

@Injectable()
export default class AccountService {
  private readonly logger = new Logger(AccountService.name);
  constructor(
    @Inject(PrismaClientService)
    protected readonly prismaClientService: PrismaClientService,
    @Inject(UserService)
    protected readonly userService: UserService,
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

  async createAccount(createAccountDto: CreateAccountDto, userId: string) {
    console.log('Creating account for user ID:', userId);
    const user = await this.userService.getUserByKeycloakId(userId);
    if (!user) {
      this.logger.error(`User with Keycloak ID: ${userId} not found`);
      throw new InternalServerErrorException(ErrorMessages.serverError);
    }
    const currency = await this.prismaClientService.currency.findUnique({
      where: { code: createAccountDto.currencyCode },
    });
    if (!currency) {
      this.logger.error(
        `Currency with code: "${createAccountDto.currencyCode}" not found`,
      );
      throw new InternalServerErrorException(ErrorMessages.serverError);
    }
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
          connect: { id: user.id },
        },
        currency: {
          connect: { id: currency.id },
        },
      },
    });
    this.logger.log(`Created new account with ID: ${account.id}`, account);
    return account;
  }

  public async getAllAccounts() {
    const accounts = await this.prismaClientService.account.findMany({
      include: {
        currency: true,
      },
    });
    this.logger.log(`Fetched all accounts, count: ${accounts.length}`);
    return accounts;
  }
}
