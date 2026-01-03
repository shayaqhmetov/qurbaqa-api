/* eslint-disable prettier/prettier */
import { $Enums } from "generated/prisma";

export const Translations: {
  accountType: { [key in keyof typeof $Enums.AccountType]: string };
} = {
  accountType: {
    CASH: 'Ақша',
    CHECKING: 'Тексеру',
    CREDIT: 'Несие',
    INVESTMENT: 'Инвестиция',
    OTHER: 'Басқа',
    SAVINGS: 'Жинақ',
  },
}
