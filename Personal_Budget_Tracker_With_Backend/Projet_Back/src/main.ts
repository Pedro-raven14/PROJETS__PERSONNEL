import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProd = process.env.NODE_ENV === 'production';

  // CORS : en dev on accepte localhost, en prod on accepte l'URL Vercel
  const allowedOrigins = isProd
    ? [process.env.FRONTEND_URL_PROD].filter(Boolean)
    : [process.env.FRONTEND_URL_DEV || 'http://localhost:5173'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(process.env.PORT || 3000);
  console.log(`Backend demarre en mode ${isProd ? 'PRODUCTION' : 'DEVELOPPEMENT'} sur le port ${process.env.PORT || 3000}`);
}
bootstrap();
