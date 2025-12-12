import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = Number(process.env.PORT) ?? 3000;

  app.setGlobalPrefix(process.env.CONTEXT || '');

  // Configuración de CORS
  app.enableCors({
    credentials: true,
    origin: process.env.CORS_ORIGIN?.split(',').map((e) => e.trim()),
    // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  });

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('OrbiFlow Tracker API')
    .setDescription('API para gestión de finanzas personales - OrbiFlow Tracker')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'OrbiFlow Tracker API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(port);
  Logger.debug(`==== API CORRIENDO [${process.env.MODE_ENV}] =====`);
}
bootstrap();
