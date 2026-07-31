import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError as JwtTokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { TokenExpiredError, UnauthorizedError } from '../../common/errors/app-error';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error | null, user: TUser, info: Error | undefined): TUser {
    if (info instanceof JwtTokenExpiredError) {
      throw new TokenExpiredError();
    }
    if (info instanceof JsonWebTokenError || info) {
      throw new UnauthorizedError('Invalid or missing access token.');
    }
    if (err || !user) {
      throw err ?? new UnauthorizedError('Invalid or missing access token.');
    }
    return user;
  }
}
