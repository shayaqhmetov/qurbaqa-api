import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { TranslationService } from './translation.service';

@Controller('translation')
export default class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('lang')
  async getLanguages() {
    return this.translationService.getLanguages();
  }

  @Post('')
  async create(@Body() dto) {
    return this.translationService.create(dto);
  }

  @Get('')
  async findAll() {
    return this.translationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.translationService.findOne(Number(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto) {
    return this.translationService.update(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.translationService.remove(Number(id));
  }
}
