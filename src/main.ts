import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { networkInterfaces } from 'os';

import { AppModule } from './app.module';
import { CustomExceptionFilter } from './filters/base.exection-filter';
import ResponseInterceptor from './response.interceptor';
import { LocaleMiddleware } from './modules/translation/locale.middleware';
import { LocalizationInterceptor } from './modules/translation/localization.interceptor';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const config = app.get<ConfigService>(ConfigService);
  const nodeEnv = config.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  // Production-safe CORS configuration
  const corsOrigins = config.get<string>('CORS_ORIGINS');
  app.enableCors({
    origin: isProduction && corsOrigins ? corsOrigins.split(',') : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Accept',
  });

  const httpAdapter = app.get(HttpAdapterHost);

  app.useGlobalFilters(new CustomExceptionFilter(httpAdapter));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(new LocaleMiddleware().use);
  // register global interceptor from module
  const localizationInterceptor = app.get(LocalizationInterceptor);
  app.useGlobalInterceptors(localizationInterceptor);

  const docConfig = new DocumentBuilder()
    .setTitle(config.get<string>('SWAGGER_TITLE') ?? 'API Documentation')
    .setDescription(
      config.get<string>('SWAGGER_DESCRIPTION') ?? 'API Documentation',
    )
    .setVersion(config.get<string>('SWAGGER_VERSION') ?? '1.0')
    .addTag('api')
    .build();
  const swaggerOptions: SwaggerCustomOptions = {
    ui: true,
    raw: ['json'],
  };
  const documentFactory = () => SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api/docs', app, documentFactory, swaggerOptions);

  const port = config.get<number>('PORT', 3000);
  const host = config.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);

  // Get local IP addresses
  const interfaces = networkInterfaces();
  const addresses: string[] = [];

  for (const interfaceName of Object.keys(interfaces)) {
    const iface = interfaces[interfaceName];
    if (iface) {
      for (const details of iface) {
        if (details.family === 'IPv4' && !details.internal) {
          addresses.push(details.address);
        }
      }
    }
  }

  logger.log('========================================');
  logger.log(`   Swagger:          http://localhost:${port}/api/docs`);

  logger.log(`🚀 Server is running on:`);
  logger.log(`   Local:            http://localhost:${port}`);
  if (!isProduction) {
    addresses.forEach((addr) => {
      logger.log(`   Network (WiFi):   http://${addr}:${port}`);
    });
  }
  logger.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  if (isProduction) {
    logger.log(`🔒 CORS Origins: ${corsOrigins || 'Not configured'}`);
  }
}
bootstrap();
