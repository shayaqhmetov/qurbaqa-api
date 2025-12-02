import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module';
import { AuthModule } from './auth/auth.module';
import { ModuleManagementModule } from './modules/module.module';
import { TranslationModule } from './translation/translation.module';
import { ConfigModule } from '@nestjs/config';
import keycloakConfiguration from './configurations/keycloak.configuration';
import { ModuleAccessGuard } from './modules/guards/module-access.guard';
import { KeycloakGuard } from './keycloak/keycloak.guard';

@Module({
  imports: [
    FinanceModule,
    AuthModule,
    ModuleManagementModule,
    ConfigModule.forRoot({
      load: [keycloakConfiguration],
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
