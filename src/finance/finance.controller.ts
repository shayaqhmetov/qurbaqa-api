import { Controller, Get } from '@nestjs/common';

@Controller('finance')
export class FinanceController {
    @Get('account')
    getAccountInfo() {
        return { accountId: '12345', balance: 1000 };
    }
}
