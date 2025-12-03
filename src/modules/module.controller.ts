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
  Query,
  Req,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CurrentUserId } from '@/decorators/current-user.decorator';
import { AttachModuleDto } from './dtos/module.dto';

@Controller('modules')
export class ModuleController {
  private readonly logger = new Logger(ModuleController.name);

  constructor(private readonly moduleService: ModuleService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllModules() {
    this.logger.log('Fetching all available modules');
    return this.moduleService.getAllModules();
  }

  @Get('my-modules')
  @HttpCode(HttpStatus.OK)
  async getMyModules(
    @Req() req,
    @CurrentUserId() userId: string,
    @Query('lang') lang?: string,
  ) {
    // prefer query param if present, otherwise middleware-provided req.locale
    const locale = (lang ? String(lang).split('-')[0] : req.locale) || 'en';

    this.logger.log(`Fetching modules for user: ${userId}`);
    return this.moduleService.getUserModules(userId, locale);
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
