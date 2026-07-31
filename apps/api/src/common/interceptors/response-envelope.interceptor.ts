import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof StreamableFile) {
          return data;
        }

        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          typeof (data as { success: unknown }).success === 'boolean'
        ) {
          return data;
        }

        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            success: true,
            data: (data as { data: unknown }).data,
            meta: (data as { meta: unknown }).meta,
          };
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}
