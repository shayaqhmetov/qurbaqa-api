import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '@/clients/prisma.client';
import { ModuleType, ModuleStatus } from 'generated/prisma';
import { MODULES_MESSAGES } from '@/messages/error.messages';

@Injectable()
export class ModuleService {
  private readonly logger = new Logger(ModuleService.name);

  constructor(private readonly prisma: PrismaClientService) {}

  // Get all available modules
  async getAllModules() {
    return this.prisma.module.findMany({
      include: {
        _count: {
          select: { userModules: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  // Get user's active modules
  async getUserModules(keycloakUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { keycloakId: keycloakUserId },
    });
    if (!user) {
      throw new NotFoundException(
        MODULES_MESSAGES.USER_NOT_FOUND(keycloakUserId),
      );
    }
    return this.prisma.userModule.findMany({
      where: {
        userId: user.id,
        status: ModuleStatus.ACTIVE,
      },
      include: {
        module: true,
      },
      orderBy: { attachedAt: 'desc' },
    });
  }

  // Attach a module to user
  async attachModule(keycloakUserId: string, moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(MODULES_MESSAGES.MODULE_NOT_FOUND(moduleId));
    }

    // Ensure user exists to avoid foreign key constraint errors
    const user = await this.prisma.user.findUnique({
      where: { keycloakId: keycloakUserId },
    });
    if (!user) {
      throw new NotFoundException(
        MODULES_MESSAGES.USER_NOT_FOUND(keycloakUserId),
      );
    }

    // Check if already attached and active
    const existing = await this.prisma.userModule.findUnique({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: module.id,
        },
      },
    });

    if (existing?.status === ModuleStatus.ACTIVE) {
      this.logger.warn(`Module ${moduleId} already active for user ${user.id}`);
      return existing;
    }

    // Attach or reactivate
    const userModule = await this.prisma.userModule.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: module.id,
        },
      },
      update: {
        status: ModuleStatus.ACTIVE,
        detachedAt: null,
      },
      create: {
        userId: user.id,
        moduleId: module.id,
        status: ModuleStatus.ACTIVE,
      },
      include: {
        module: true,
      },
    });

    this.logger.log(`✅ Module ${moduleId} attached to user ${user.id}`);
    return userModule;
  }

  // Detach a module from user
  async detachModule(keycloakId: string, moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });
    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
    });

    if (!module) {
      throw new NotFoundException(MODULES_MESSAGES.MODULE_NOT_FOUND(moduleId));
    }
    this.logger.log(`Detaching module ${moduleId} from user ${user.id}`);
    this.logger.log(`Module found: ${module.name}`, module);
    const userModule = await this.prisma.userModule.findUnique({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: module.id,
        },
      },
    });

    if (!userModule) {
      throw new NotFoundException(
        MODULES_MESSAGES.MODULE_NOT_ATTACHED(moduleId),
      );
    }

    const updated = await this.prisma.userModule.update({
      where: { id: userModule.id },
      data: {
        status: ModuleStatus.INACTIVE,
        detachedAt: new Date(),
      },
      include: {
        module: true,
      },
    });

    this.logger.log(`✅ Module ${moduleId} detached from user ${user.id}`);
    return updated;
  }

  // Check if user has access to a module
  async hasModuleAccess(
    userId: string,
    moduleType: ModuleType,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { keycloakId: userId },
    });

    if (!user) {
      throw new NotFoundException(MODULES_MESSAGES.USER_NOT_FOUND(userId));
    }

    const userModule = await this.prisma.userModule.findFirst({
      where: {
        userId: user.id,
        module: { type: moduleType },
        status: ModuleStatus.ACTIVE,
      },
    });

    return !!userModule;
  }
}
