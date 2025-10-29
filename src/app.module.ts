import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import keycloakConfiguration from './configurations/keycloak.configuration';

@Module({
  imports: [
    FinanceModule,
    AuthModule,
    ConfigModule.forRoot({
      load: [keycloakConfiguration],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
