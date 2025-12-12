import { Controller, Get, Post, Body } from '@nestjs/common';
import { TranslationService } from './translation.service';
import {
  LanguageDto,
  LanguagesResponseDto,
  TranslatableEntitiesResponseDto,
  TranslationDto,
  TranslationResponseDto,
  TranslationsResponseDto,
  UpsertTranslationDto,
} from './translation.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AccountDto } from '@/modules/finance/dtos/account.dto';
import { BaseApiResponse } from '@/dto';

@ApiTags('translation')
@Controller('translation')
@ApiBearerAuth('access_token')
export default class TranslationController {
  constructor(private readonly translationService: TranslationService) { }

  @Get('lang')
  @ApiOperation({ summary: 'Get available languages' })
  @ApiOkResponse({ description: 'Account info', type: LanguagesResponseDto })
  async getLanguages(): Promise<LanguageDto[]> {
    return this.translationService.getLanguages();
  }

  @Post()
  @ApiOperation({ summary: 'Add or update translation' })
  @ApiBody({ type: UpsertTranslationDto })
  @ApiOkResponse({ description: 'Account info', type: TranslationResponseDto })
  async addTranslation(
    @Body() dto: UpsertTranslationDto,
  ): Promise<TranslationDto> {
    return this.translationService.upsertTranslation(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all translations' })
  @ApiOkResponse({
    description: 'All translations',
    type: TranslationsResponseDto,
  })
  async getTranslations(): Promise<TranslationDto[]> {
    return this.translationService.getAllTranslations();
  }

  @Get('entities')
  @ApiOperation({ summary: 'Get translatable entities' })
  @ApiOkResponse({
    description: 'Translatable entities',
    type: TranslatableEntitiesResponseDto,
  })
  async getTranslatableEntities(): Promise<string[]> {
    return this.translationService.getTranslatableEntities();
  }
}
