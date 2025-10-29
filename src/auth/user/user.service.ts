import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaClientService } from '@/clients/prisma.client';

import { CreateUserDto } from './dtos/create-user.dto';
import { KeycloakAdminService } from '@/keycloak/keycloak.service';

@Injectable()
export class UserService {
  protected readonly logger = new Logger(UserService.name);
  constructor(
    @Inject(PrismaClientService) private readonly prisma: PrismaClientService,
    protected readonly keycloakService: KeycloakAdminService,
  ) { }

  async createUser(createUserDto: CreateUserDto) {
    this.logger.log('Creating user with email:', createUserDto.email);
    await this.keycloakService.createUser({
      username: createUserDto.username,
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: createUserDto.password,
    });
    this.logger.log('User created in Keycloak:', createUserDto.email);
    // return this.prisma.user.create({
    //   data: {
    //     email: createUserDto.email,
    //   },
    // });
  }

  async getProfile() {
    const user = await this.prisma.user.findFirst({
      where: {},
    });
    if (!user) {
      throw new Error('User not found');
    }
    this.logger.log('Fetched user profile:', user);
    return user;
  }
}