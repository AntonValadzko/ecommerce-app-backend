import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { WinstonModule } from 'nest-winston';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './presentation/http/common/filters/all-exceptions.filter';
import { buildWinstonModuleOptions, createCliLogger } from './common/logger/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(buildWinstonModuleOptions()),
  });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useLogger(logger);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-Commerce Catalog API')
    .setDescription('Product catalog with search, faceted filtering, and saved searches')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-session-id' }, 'session')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);

  logger.log(`Server running on http://localhost:${port}/api/v1`);
  logger.log(`Swagger UI at http://localhost:${port}/api/docs`);
}

bootstrap().catch((err: unknown) => {
  const logger = createCliLogger('Bootstrap');
  logger.error('Application failed to start', { error: err });
  process.exit(1);
});
