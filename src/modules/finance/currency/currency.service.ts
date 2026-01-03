import { PrismaClientService } from '@/clients/prisma.client';
import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { CreateCurrencyDto } from './currency.dto';
import { CURRENCY_MESSAGE } from '@/messages/error.messages';
import { TRANSLATABLE_FIELDS } from '@/modules/translation/translation.constants';
import { TranslationService } from '@/modules/translation/translation.service';
import { TranslationEntityType } from '@/modules/translation/translation.dto';
import { DEFAULT_LOCALE } from '@/constants';

@Injectable()
export default class CurrencyService {
  constructor(
    @Inject(PrismaClientService)
    private readonly prismaClient: PrismaClientService,
    @Inject(TranslationService)
    private readonly translationService: TranslationService,
  ) { }

  async createCurrency(createCurrencyDto: CreateCurrencyDto) {
    const currency = await this.prismaClient.currency.create({
      data: {
        code: createCurrencyDto.code,
        name: createCurrencyDto.name,
        symbol: createCurrencyDto.symbol,
      },
    });
    return currency;
  }

  async getAllCurrencies() {
    const currencies = await this.prismaClient.currency.findMany();
    return currencies;
  }

  async getCurrencyById(id: string) {
    const currency = await this.prismaClient.currency.findUnique({
      where: { id },
    });
    return currency;
  }

  async patchCurrency(
    id: string,
    locale: string,
    patchData: Partial<CreateCurrencyDto>,
  ) {
    const currentCurrency = await this.prismaClient.currency.findUnique({
      where: { id },
    });
    if (!currentCurrency) {
      throw new NotFoundException(CURRENCY_MESSAGE.CURRENCY_NOT_FOUND(id));
    }
    const fieldsToUpdate = Object.keys(patchData);
    if (fieldsToUpdate.length === 0) {
      return currentCurrency;
    }
    const translationsToUpdate = fieldsToUpdate.filter((field) =>
      TRANSLATABLE_FIELDS.Currency.includes(field),
    );
    if (translationsToUpdate.length > 0) {
      for (const field of translationsToUpdate) {
        await this.translationService.upsertTranslation({
          entityType: TranslationEntityType.Currency,
          entityId: id,
          field,
          value: patchData[field],
          locale,
        });
      }
    }
    if (locale === DEFAULT_LOCALE) {
      await this.prismaClient.currency.update({
        where: { id },
        data: patchData,
      });
      const updatedCurrency = await this.prismaClient.currency.findUnique({
        where: { id },
      });
      return updatedCurrency;
    }
    const generalFieldsToUpdate = fieldsToUpdate.filter(
      (field) => !TRANSLATABLE_FIELDS.Currency.includes(field),
    );
    if (generalFieldsToUpdate.length > 0) {
      const generalData: Partial<CreateCurrencyDto> = {};
      generalFieldsToUpdate.forEach((field) => {
        generalData[field] = patchData[field];
      });
      await this.prismaClient.currency.update({
        where: { id },
        data: generalData,
      });
    }

    const updatedCurrency = await this.prismaClient.currency.findUnique({
      where: { id },
    });
    return updatedCurrency;
  }
}
