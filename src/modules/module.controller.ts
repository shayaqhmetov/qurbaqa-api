import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CurrentUserId } from '@/decorators/current-user.decorator';
import { AttachModuleDto } from './dtos/module.dto';

@Controller('modules')
export class ModuleController {
  private readonly logger = new Logger(ModuleController.name);

  constructor(private readonly moduleService: ModuleService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllModules() {
    this.logger.log('Fetching all available modules');
    return this.moduleService.getAllModules();
  }

  @Get('my-modules')
  @HttpCode(HttpStatus.OK)
  async getMyModules(@CurrentUserId() userId: string) {
    this.logger.log(`Fetching modules for user: ${userId}`);
    return this.moduleService.getUserModules(userId);
  }

  @Post('attach')
  @HttpCode(HttpStatus.CREATED)
  async attachModule(
    @CurrentUserId() userId: string,
    @Body() body: AttachModuleDto,
  ) {
    this.logger.log(`Attaching module ${body.moduleId} to user ${userId}`);
    return this.moduleService.attachModule(userId, body.moduleId);
  }

  @Delete('detach/:id')
  @HttpCode(HttpStatus.OK)
  async detachModule(
    @CurrentUserId() userId: string,
    @Param('id') moduleId: string,
  ) {
    this.logger.log(`Detaching module ${moduleId} from user ${userId}`);
    return this.moduleService.detachModule(userId, moduleId as any);
  }
}
