import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API Prefix: /api/v1 (PRD §6, BRAIN.md §2)
  app.setGlobalPrefix('api/v1');

  // RFC 7807 Problem Details Error Filter
  app.useGlobalFilters(new ProblemDetailsFilter());

  // Strict Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger OpenAPI 3.1 documentation
  const config = new DocumentBuilder()
    .setTitle('Multi-Tenant LMS Portal API')
    .setDescription('Canonical API for Multi-Tenant LMS Portal (PRD §6)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'X-API-Key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 LMS Portal API running on http://localhost:${port}/api/v1`);
  console.log(`📖 API Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
