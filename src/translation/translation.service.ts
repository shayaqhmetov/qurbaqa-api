import { NotFoundException } from '@nestjs/common';
import { CreateTranslationDto } from './dtos/create-translation.dto';
import { UpdateTranslationDto } from './dtos/update-translation.dto';
import { Injectable } from '@nestjs/common';
import { PrismaClientService } from '@/clients/prisma.client';

@Injectable()
export class TranslationService {
  constructor(private readonly prisma: PrismaClientService) {}

  async getLanguages() {
    return this.prisma.language.findMany({
      select: { code: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateTranslationDto) {
    return this.prisma.translation.create({ data: dto });
  }

  async findAll() {
    return this.prisma.translation.findMany();
  }

  async findOne(id: number) {
    const translation = await this.prisma.translation.findUnique({ where: { id } });
    if (!translation) throw new NotFoundException('Translation not found');
    return translation;
  }

  async update(id: number, dto: UpdateTranslationDto) {
    return this.prisma.translation.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    return this.prisma.translation.delete({ where: { id } });
  }
}
