import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import AccountService from './account.service';
import { CreateAccountDto } from './dtos/account.dto';
import { CurrentUser } from '@/auth/user/user.decorator';
import { RequireModule } from '@/modules/guards/module-access.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('finance')
@Controller('finance')
@RequireModule('FINANCE')
export class FinanceController {
  constructor(protected readonly accountService: AccountService) { }

  @Get('account/:id')
  @ApiOperation({ summary: 'Get account info by ID' })
  async getAccountInfo(@Param() params: { id: string }) {
    const account = await this.accountService.getAccountById(params.id);
    return account;
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get all accounts' })
  async getAccounts() {
    const accounts = await this.accountService.getAllAccounts();
    return accounts;
  }

  @Post('account')
  @ApiOperation({ summary: 'Create new account' })
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
