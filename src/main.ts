import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as OpenApiValidator from 'express-openapi-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    OpenApiValidator.middleware({
      apiSpec: './openapi-companies.yaml',
      validateRequests: true,
      validateResponses: true,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
