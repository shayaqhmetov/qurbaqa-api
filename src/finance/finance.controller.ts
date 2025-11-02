import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import AccountService from './account.service';
import { CreateAccountDto } from './dtos/account.dto';
import { CurrentUser } from '@/auth/user/user.decorator';

@Controller('finance')
export class FinanceController {
  constructor(protected readonly accountService: AccountService) { }

  @Get('account/:id')
  async getAccountInfo(@Param() params: { id: string }) {
    const account = await this.accountService.getAccountById(params.id);
    return account;
  }

  @Get('accounts')
  async getAccounts() {
    const accounts = await this.accountService.getAllAccounts();
    return accounts;
  }

  @Post('account')
  async createAccount(
    @CurrentUser() user: any,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    console.log('Current User:', user);
    const account = await this.accountService.createAccount(
      createAccountDto,
      user.sub,
    );
    return account;
  }
}
