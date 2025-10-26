import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard, KeycloakConnectModule, PolicyEnforcementMode, ResourceGuard, RoleGuard, TokenValidation } from 'nest-keycloak-connect';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module';
import { AuthModule } from './auth/auth.module';
import { KeycloakConfigService } from './configs/keycloak.config';
import { ConfigModules } from './configs/configs.module';

@Module({
  imports: [
    FinanceModule,
    AuthModule,
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigService,
      imports: [ConfigModules],
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard, //By default, it will throw a 401 unauthorized when it is unable to verify the JWT token or Bearer header is missing.
    }, {
      provide: APP_GUARD,
      useClass: ResourceGuard, //Only controllers annotated with @Resource and methods with @Scopes are handled by this guard
    }, {
      provide: APP_GUARD,
      useClass: RoleGuard, //Permissive by default. Used by controller methods annotated with @Roles
    },
    AppService],
})
export class AppModule { }
