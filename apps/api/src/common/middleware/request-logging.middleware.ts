import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request & { requestId?: string }, res: Response, next: NextFunction): void {
    const started = Date.now();

    res.on('finish', () => {
      const durationMs = Date.now() - started;
      this.logger.log(
        JSON.stringify({
          requestId: req.requestId,
          method: req.method,
          path: req.originalUrl.split('?')[0],
          statusCode: res.statusCode,
          durationMs,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    next();
  }
}
