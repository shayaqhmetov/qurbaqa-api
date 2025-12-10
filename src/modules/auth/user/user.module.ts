import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClientService } from '@/clients/prisma.client';
import { KeycloakAdminService } from '@/keycloak/keycloak.service';

@Module({
  controllers: [],
  imports: [],
  providers: [UserService, PrismaClientService, KeycloakAdminService],
})
export class UserModule { }