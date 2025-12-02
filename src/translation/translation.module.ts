import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import TranslationController from './translation.controller';
import { PrismaClientService } from '@/clients/prisma.client';

@Module({
  controllers: [TranslationController],
  providers: [TranslationService, PrismaClientService],
  exports: [TranslationService],
})
export class TranslationModule {}
