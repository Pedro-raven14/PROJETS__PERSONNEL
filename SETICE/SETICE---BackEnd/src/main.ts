import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // app.enableCors({
  //   origin:["http://localhost:5173","http://localhost:5174"],

  // })
  // await app.listen(process.env.PORT ?? 3000);

  // Version finale avec gestion du port en production

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://apex-dev-setice.vercel.app', 'http://localhost:5173'], // temporaire (on sécurise après)
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });
  // const port = process.env.PORT || 3000;
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
