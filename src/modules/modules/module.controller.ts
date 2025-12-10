import {
  Get,
  Req,
  Body,
  Post,
  Param,
  Query,
  Delete,
  Logger,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CurrentUserId } from '@/decorators/current-user.decorator';
import {
  ModuleDto,
  UserModuleDto,
  AttachModuleDto,
  CreateModuleDto,
  ModulesResponseDto,
  UserModuleResponseDto,
  ModuleResponseDto,
} from './module.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('modules')
@Controller('modules')
@ApiBearerAuth('access_token')
export class ModuleController {
  private readonly logger = new Logger(ModuleController.name);

  constructor(private readonly moduleService: ModuleService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all available modules' })
  @ApiOkResponse({ description: 'List of modules', type: ModulesResponseDto })
  async getAllModules(): Promise<ModuleDto[]> {
    this.logger.log('Fetching all available modules');
    return this.moduleService.getAllModules();
  }

  @Get('my-modules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get modules attached to current user' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Preferred language code',
  })
  @ApiOkResponse({
    description: 'List of modules',
    type: [UserModuleResponseDto],
  })
  async getMyModules(
    @Req() req,
    @CurrentUserId() userId: string,
    @Query('lang') lang?: string,
  ): Promise<UserModuleDto[]> {
    // prefer query param if present, otherwise middleware-provided req.locale
    const locale = (lang ? String(lang).split('-')[0] : req.locale) || 'en';

    this.logger.log(`Fetching modules for user: ${userId}`);
    return this.moduleService.getUserModules(userId, locale);
  }

  @Post('attach')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Attach a module to current user' })
  @ApiBody({ type: AttachModuleDto })
  @ApiOkResponse({
    description: 'Attached module',
    type: UserModuleResponseDto,
  })
  async attachModule(
    @CurrentUserId() userId: string,
    @Body() body: AttachModuleDto,
  ): Promise<UserModuleDto> {
    this.logger.log(`Attaching module ${body.moduleId} to user ${userId}`);
    return this.moduleService.attachModule(userId, body.moduleId);
  }

  @Delete('detach/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'Module ID to detach' })
  @ApiOperation({ summary: 'Detach a module from current user' })
  @ApiOkResponse({
    description: 'Detached module',
    type: UserModuleResponseDto,
  })
  async detachModule(
    @CurrentUserId() userId: string,
    @Param('id') moduleId: string,
  ): Promise<UserModuleDto> {
    this.logger.log(`Detaching module ${moduleId} from user ${userId}`);
    return this.moduleService.detachModule(userId, moduleId as any);
  }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new module' })
  @ApiBody({ type: CreateModuleDto })
  @ApiOkResponse({ description: 'Created module', type: ModuleResponseDto })
  async createModule(@Body() body: CreateModuleDto): Promise<ModuleDto> {
    this.logger.log(`Creating new module with data: ${JSON.stringify(body)}`);
    return this.moduleService.createModule(body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a module by ID' })
  @ApiParam({ name: 'id', description: 'Module ID to delete' })
  @ApiOkResponse({ description: 'Deleted module', type: ModuleResponseDto })
  async deleteModule(@Param('id') moduleId: string): Promise<ModuleDto> {
    this.logger.log(`Deleting module with ID: ${moduleId}`);
    return this.moduleService.deleteModule(moduleId);
  }
}
