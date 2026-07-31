import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppConfig, getJwtExpiresInSeconds } from '../config/env.validation';
import { InvalidCredentialsError } from '../common/errors/app-error';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';

export interface LoginResult {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    @Inject('APP_CONFIG') private readonly appConfig: AppConfig,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: getJwtExpiresInSeconds(this.appConfig.jwtExpiresIn),
    };
  }
}
