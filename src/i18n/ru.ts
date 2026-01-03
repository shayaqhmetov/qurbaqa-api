import { $Enums } from 'generated/prisma';

export const Translations: {
  accountType: { [key in keyof typeof $Enums.AccountType]: string };
} = {
  accountType: {
    CASH: 'Наличные',
    CHECKING: 'Расчетный',
    CREDIT: 'Кредитный',
    INVESTMENT: 'Инвестиционный',
    OTHER: 'Другой',
    SAVINGS: 'Сберегательный',
  },
};
