import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setUpSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('경사로 데이터 관리 API')
    .setDescription('경사로 데이터 관리 스웨거 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
      },
      'authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
      requestInterceptor: (req) => {
        (req as any).withCredentials = true; // 일부 버전 호환
        (req as any).credentials = 'include';
        return req;
      },
    },
  });
}
