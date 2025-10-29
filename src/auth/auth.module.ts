import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { PrismaClientService } from '@/clients/prisma.client';
import { KeycloakAdminService } from '@/keycloak/keycloak.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [
    UserService,
    PrismaClientService,
    KeycloakAdminService,
    ConfigService,
  ],
  imports: [UserModule],
})
export class AuthModule { }
