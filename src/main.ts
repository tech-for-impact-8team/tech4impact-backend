import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { setUpSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://tech4impact-front.vercel.app/',
    ],
    credentials: true,
  });

  setUpSwagger(app);
  await app.listen(3000);
}
bootstrap();
