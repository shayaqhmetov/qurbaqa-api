import { Module } from '@nestjs/common';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { ModuleAccessGuard } from './module-access.guard';
import { PrismaClientService } from '@/clients/prisma.client';

@Module({
  controllers: [ModuleController],
  providers: [ModuleService, ModuleAccessGuard, PrismaClientService],
  exports: [ModuleService, ModuleAccessGuard],
})
export class ModuleManagementModule {}
