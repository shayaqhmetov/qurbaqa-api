import { Global, Module } from '@nestjs/common';
import { RedisModule } from '@/redis/redis.module';
import { TranslationService } from './translation.service';
import TranslationController from './translation.controller';
import { PrismaClientService } from '@/clients/prisma.client';
import { LocalizationInterceptor } from './localization.interceptor';

@Global()
@Module({
  imports: [RedisModule],
  controllers: [TranslationController],
  providers: [TranslationService, LocalizationInterceptor, PrismaClientService],
  exports: [TranslationService, LocalizationInterceptor],
})
export class TranslationModule {}
