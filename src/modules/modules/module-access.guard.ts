import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleService } from './module.service';
import * as MESSAGES from '@/messages/error.messages';

export const REQUIRED_MODULE_KEY = 'requiredModule';
export const RequireModule = (moduleType: string) =>
  SetMetadata(REQUIRED_MODULE_KEY, moduleType);

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleService: ModuleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.getAllAndOverride<string>(
      REQUIRED_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredModule) {
      return true; // No module requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasAccess = await this.moduleService.hasModuleAccess(
      user.sub,
      requiredModule as any,
    );

    if (!hasAccess) {
      // Import error message
      throw new ForbiddenException(MESSAGES.moduleAccessDenied(requiredModule));
    }

    return true;
  }
}
