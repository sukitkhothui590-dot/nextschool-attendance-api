import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, validateEnvironment } from './env.validation';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => validateEnvironment(config as Record<string, unknown>),
    }),
  ],
  providers: [
    {
      provide: 'APP_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): AppConfig => ({
        nodeEnv: configService.getOrThrow('nodeEnv'),
        port: configService.getOrThrow('port'),
        databaseUrl: configService.getOrThrow('databaseUrl'),
        jwtSecret: configService.getOrThrow('jwtSecret'),
        jwtExpiresIn: configService.getOrThrow('jwtExpiresIn'),
        corsOrigin: configService.getOrThrow('corsOrigin'),
        logLevel: configService.getOrThrow('logLevel'),
        isProduction: configService.getOrThrow('isProduction'),
      }),
    },
  ],
  exports: ['APP_CONFIG', ConfigModule],
})
export class AppConfigModule {}
