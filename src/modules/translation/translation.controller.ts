import { Controller, Get, Post, Body } from '@nestjs/common';
import { TranslationService } from './translation.service';
import {
  LanguageDto,
  TranslationDto,
  UpsertTranslationDto,
} from './translation.dto';
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AccountDto } from '@/modules/finance/dtos/account.dto';

@ApiTags('translation')
@Controller('translation')
@ApiBearerAuth('access_token')
export default class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('lang')
  @ApiOperation({ summary: 'Get available languages' })
  @ApiOkResponse({ description: 'Account info', type: [LanguageDto] })
  async getLanguages(): Promise<LanguageDto[]> {
    return this.translationService.getLanguages();
  }

  @Post()
  @ApiOperation({ summary: 'Add or update translation' })
  @ApiBody({ type: UpsertTranslationDto })
  @ApiOkResponse({ description: 'Account info', type: AccountDto })
  async addTranslation(
    @Body() dto: UpsertTranslationDto,
  ): Promise<TranslationDto> {
    return this.translationService.upsertTranslation(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all translations' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiOkResponse({ description: 'Account info', type: AccountDto })
  async getTranslations() {
    return this.translationService.getAllTranslations();
  }

  @Get('entities')
  @ApiOperation({ summary: 'Get translatable entities' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiOkResponse({ description: 'Account info', type: AccountDto })
  async getTranslatableEntities() {
    return this.translationService.getTranslatableEntities();
  }
}
