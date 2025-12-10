/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { PrismaClientService } from '@/clients/prisma.client';

import { AttachKeycloakUserToDatabaseDto, CreateUserDto } from './user.dto';
import { KeycloakAdminService, TokenDto } from '@/keycloak/keycloak.service';

@Injectable()
export class UserService {
  protected readonly logger = new Logger(UserService.name);
  constructor(
    @Inject(PrismaClientService)
    private readonly prismaService: PrismaClientService,
    protected readonly keycloakService: KeycloakAdminService,
  ) { }

  async removeUser(createUserDto: CreateUserDto) {
    this.logger.log('Removing user with email:', createUserDto.email);
    const user = await this.prismaService.user.findFirst({
      where: {
        email: createUserDto.email,
      },
    });
    if (!user) {
      this.logger.warn('User not found with email:', createUserDto.email);
      throw new NotFoundException('User not found in database');
    }
    await this.prismaService.user.delete({
      where: {
        email: createUserDto.email,
      },
    });
    this.logger.log('User deleted in database:', createUserDto.email);
    return { message: 'User successfully removed' };
  }

  async attachKeycloakUserToDatabase(attachKeycloakUserToDatabaseDto: AttachKeycloakUserToDatabaseDto) {
    this.logger.log('Attaching Keycloak user to database - Not implemented yet');
    const user = await this.prismaService.$transaction(async (tx) => {
      try {
        this.logger.log('User created in Keycloak:', attachKeycloakUserToDatabaseDto.email);
        return await tx.user.create({
          data: {
            email: attachKeycloakUserToDatabaseDto.email,
            keycloakId: attachKeycloakUserToDatabaseDto.keycloakId,
            firstName: attachKeycloakUserToDatabaseDto.firstName,
            lastName: attachKeycloakUserToDatabaseDto.lastName,
            username: attachKeycloakUserToDatabaseDto.username,
          },
        });
      } catch (error) {
        throw error;
      }
    });
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<TokenDto> {
    this.logger.log('Creating user with email:', createUserDto.email);
    const user = await this.prismaService.user.findFirst({
      where: {
        email: createUserDto.email,
      },
    });
    if (!user) {
      this.logger.log(
        'User not found, creating new user in Keycloak and database',
      );
      await this.prismaService.$transaction(async (tx) => {
        let keycloakUserId: string | undefined;

        try {
          const result = await this.keycloakService.createUser({
            username: createUserDto.username,
            email: createUserDto.email,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            password: createUserDto.password,
          });
          keycloakUserId = result.id;
          this.logger.log('User created in Keycloak:', createUserDto.email);

          return await tx.user.create({
            data: {
              email: createUserDto.email,
              keycloakId: keycloakUserId,
              firstName: createUserDto.firstName,
              lastName: createUserDto.lastName,
              username: createUserDto.username,
            },
          });
        } catch (error) {
          if (keycloakUserId) {
            try {
              await this.keycloakService.removeUser(keycloakUserId);
              this.logger.log('Removed user from Keycloak due to transaction failure:', createUserDto.email);
            } catch (cleanupError) {
              this.logger.error('Failed to cleanup Keycloak user:', cleanupError);
            }
          }
          throw error;
        }
      });
    }
    return await this.keycloakService.login({
      identifier: createUserDto.email,
      password: createUserDto.password,
    });
  }

  async getProfile() {
    const user = await this.prismaService.user.findFirst({
      where: {},
    });
    if (!user) {
      throw new Error('User not found');
    }
    this.logger.log('Fetched user profile:', user);
    return user;
  }

  async getUserByKeycloakId(keycloakId: string) {
    const user = await this.prismaService.user.findFirst({
      where: { keycloakId },
    });
    this.logger.log('Fetched user by Keycloak ID:', user);
    return user;
  }
}
