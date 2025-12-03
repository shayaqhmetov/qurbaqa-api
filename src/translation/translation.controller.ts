import { Controller, Get, Post, Body } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { UpsertTranslationDto } from './dtos/create-translation.dto';

@Controller('translation')
export default class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('lang')
  async getLanguages() {
    return this.translationService.getLanguages();
  }

  @Post()
  async addTranslation(@Body() dto: UpsertTranslationDto) {
    return this.translationService.upsertTranslation(dto);
  }
}
