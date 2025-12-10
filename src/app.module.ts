import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './modules/finance/finance.module';
import { AuthModule } from './modules/auth/auth.module';
import { ModuleManagementModule } from './modules/modules/module.module';
import { TranslationModule } from './modules/translation/translation.module';
import { ConfigModule } from '@nestjs/config';
import keycloakConfiguration from './configurations/keycloak.configuration';
import { ModuleAccessGuard } from './modules/modules/module-access.guard';
import { KeycloakGuard } from './keycloak/keycloak.guard';
import configuration from './configurations/configuration';

@Module({
  imports: [
    FinanceModule,
    AuthModule,
    ModuleManagementModule,
    ConfigModule.forRoot({
      load: [keycloakConfiguration, configuration],
      isGlobal: true,
    }),
    TranslationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: KeycloakGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ModuleAccessGuard,
    },
  ],
})
export class AppModule {}
