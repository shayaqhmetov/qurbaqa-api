import { Controller, Get, Post, Body } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { UpsertTranslationDto } from './dtos/create-translation.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('translation')
@Controller('translation')
export default class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('lang')
  @ApiOperation({ summary: 'Get available languages' })
  async getLanguages() {
    return this.translationService.getLanguages();
  }

  @Post()
  @ApiOperation({ summary: 'Add or update translation' })
  async addTranslation(@Body() dto: UpsertTranslationDto) {
    return this.translationService.upsertTranslation(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all translations' })
  async getTranslations() {
    return this.translationService.getAllTranslations();
  }

  @Get('entities')
  @ApiOperation({ summary: 'Get translatable entities' })
  async getTranslatableEntities() {
    return this.translationService.getTranslatableEntities();
  }
}
