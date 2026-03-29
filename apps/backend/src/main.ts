import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS (Next.js 프론트엔드 허용)
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // 전역 유효성 검사 파이프
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Swagger 문서
  const config = new DocumentBuilder()
    .setTitle('예약 관리 API')
    .setDescription('케이터링 예약 관리 시스템 REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`서버 실행 중: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api`);
}
bootstrap();
