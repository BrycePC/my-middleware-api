import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as OpenApiValidator from 'express-openapi-validator';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* Helmet autoamtically adds http responses headers to protect for:
  - Content-Security-Policy - Prevents XSS attacks
  - X-Content-Type-Options: nosniff - Prevents MIME sniffing
  - X-Frame-Options: DENY - Prevents clickjacking
  - X-DNS-Prefetch-Control: off - Controls DNS prefetching
  - Strict-Transport-Security - Enforces HTTPS
  - X-Download-Options: noopen - Prevents file execution in IE
- X-Permitted-Cross-Domain-Policies: none - Restricts Adobe products
   */
  app.use(helmet());

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
  // NB this is now redundant wioth the use of helmet. Keeping for info at the moment
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new ValidationExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
