import { Controller, Get, Post, Body, Query, UseInterceptors, Param, Req } from '@nestjs/common';
import { TranslationService } from './translation.service';
import {
  LanguageDto,
  LanguagesResponseDto,
  TranslatableEntitiesResponseDto,
  TranslationDto,
  TranslationFilterDto,
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
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from '@/decorators/public.decorator';
import { LocalizationInterceptor } from '../../interceptors/localization.interceptor';
import { TranslationQueryDto } from '@/dto';

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
  @ApiQuery({ name: 'filter', required: false, type: TranslationFilterDto })
  @ApiOkResponse({
    description: 'All translations',
    type: TranslationsResponseDto,
  })
  @Public()
  async getTranslations(
    @Query() filter?: TranslationFilterDto,
  ): Promise<TranslationDto[]> {
    return this.translationService.getAllTranslations(filter);
  }

  @Get('entities')
  @ApiOperation({ summary: 'Get translatable entities' })
  @ApiOkResponse({
    description: 'Translatable entities',
    type: TranslatableEntitiesResponseDto,
  })
  @UseInterceptors(LocalizationInterceptor)
  async getTranslatableEntities(
    @Query() query: TranslationQueryDto,
    @Req() req,
  ): Promise<string[]> {
    return this.translationService.getTranslatableEntities();
  }
}
