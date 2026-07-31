import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { json } from 'express';
import { AppModule } from './app.module';
import { AppConfig } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get<AppConfig>('APP_CONFIG');
  const logger = new Logger('Bootstrap');

  app.use(helmet());
  app.use(json({ limit: '32kb' }));
  app.enableCors({
    origin: config.corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NextSchool Attendance Operations API')
    .setDescription(
      'Production-minded school attendance REST API. Required paths: POST /login, GET /students, POST /attendance, GET /attendance/summary.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
  });

  await app.listen(config.port);
  logger.log(`API listening on port ${config.port}`);
  logger.log(`Swagger UI available at /docs`);
}

void bootstrap();
