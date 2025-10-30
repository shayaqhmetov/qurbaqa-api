import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { CustomExceptionFilter } from './filters/base.exection-filter';
import ResponseInterceptor from './response.interceptor';
import { KeycloakGuard } from './keycloak/keycloak.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const httpAdapter = app.get(HttpAdapterHost);
  const reflector = new Reflector();
  app.useGlobalFilters(new CustomExceptionFilter(httpAdapter));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  const config = app.get<ConfigService>(ConfigService);
  app.useGlobalGuards(new KeycloakGuard(reflector, config));
  await app.listen(3000);
}
bootstrap();
