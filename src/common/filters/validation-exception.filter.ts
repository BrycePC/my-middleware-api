import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle OpenAPI request validation errors
    if (exception.status === 400 && exception.errors) {
      return response.status(400).json({
        error: 'Bad Request',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error_description: exception.message || 'Request validation failed',
      });
    }

    // Handle OpenAPI response validation errors
    if (exception.status === 500 && exception.errors) {
      console.log('response validation errors:', exception.errors);
      return response.status(500).json({
        error: 'Internal Server Error',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error_description: exception.message || 'Response validation failed',
      });
    }

    // Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // If already in correct format, return as-is
      if (
        typeof exceptionResponse === 'object' &&
        'error' in exceptionResponse
      ) {
        return response.status(status).json(exceptionResponse);
      }

      // Convert to OpenAPI error format
      return response.status(status).json({
        error: exception.message,
        error_description:
          typeof exceptionResponse === 'string' ? exceptionResponse : undefined,
      });
    }

    // Handle unexpected errors
    return response.status(500).json({
      error: 'Internal Server Error',
      error_description: 'An unexpected error occurred',
    });
  }
}
