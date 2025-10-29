import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { KeycloakAdminService } from './keycloak.service';

@Module({
  imports: [ConfigService],
  providers: [KeycloakAdminService, ConfigService],
  exports: [KeycloakAdminService],
})
export class KeycloakAdminModule {}
