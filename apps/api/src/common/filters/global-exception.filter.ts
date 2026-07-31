import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import {
  AppError,
  ErrorCode,
  RateLimitExceededError,
  RouteNotFoundError,
} from '../errors/app-error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();
    const requestId = request.requestId ?? 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred.';
    let details: unknown = null;

    if (exception instanceof AppError) {
      status = exception.statusCode;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof ThrottlerException) {
      const rateLimitError = new RateLimitExceededError();
      status = rateLimitError.statusCode;
      code = rateLimitError.code;
      message = rateLimitError.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (status === HttpStatus.NOT_FOUND) {
        const notFound = new RouteNotFoundError();
        code = notFound.code;
        message = notFound.message;
      } else if (status === HttpStatus.UNAUTHORIZED) {
        code = ErrorCode.UNAUTHORIZED;
        message =
          typeof body === 'string'
            ? body
            : ((body as { message?: string }).message ?? 'Authentication is required.');
      } else if (status === HttpStatus.BAD_REQUEST) {
        code = ErrorCode.VALIDATION_ERROR;
        if (typeof body === 'object' && body !== null) {
          const payload = body as { message?: string | string[]; error?: string };
          if (Array.isArray(payload.message)) {
            message = 'Request validation failed.';
            details = payload.message.map((item) => ({ message: item }));
          } else {
            message = payload.message ?? 'Request validation failed.';
          }
        } else {
          message = String(body);
        }
      } else {
        message =
          typeof body === 'string' ? body : ((body as { message?: string }).message ?? message);
      }
    } else {
      this.logger.error(
        JSON.stringify({
          requestId,
          event: 'unhandled_exception',
          error: exception instanceof Error ? exception.message : 'unknown',
        }),
      );
    }

    if (status >= 500 && !(exception instanceof AppError)) {
      this.logger.error(
        JSON.stringify({
          requestId,
          event: 'server_error',
          code,
          path: request.url,
          method: request.method,
        }),
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      requestId,
    });
  }
}
