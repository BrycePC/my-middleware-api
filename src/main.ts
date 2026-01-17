import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as OpenApiValidator from 'express-openapi-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /*
    Enable request/response validation against provided OpenAPI3 spec that has been predefined for this proxy service.
    Configured below so requests/responses MUST match schema (rather than warn only) otherwise will error.
    see: https://cdimascio.github.io/express-openapi-validator-documentation/usage-validate-responses
  */
  app.use(
    OpenApiValidator.middleware({
      apiSpec: './openapi-companies.yaml',
      validateRequests: true,
      validateResponses: true,
    }),
  );

  // The following line has been added to remove response headers for security purposes (to hide implementation details)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
