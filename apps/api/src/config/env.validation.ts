import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsString, Max, Min, validateSync } from 'class-validator';

enum NodeEnv {
  development = 'development',
  test = 'test',
  production = 'production',
}

enum LogLevel {
  error = 'error',
  warn = 'warn',
  log = 'log',
  debug = 'debug',
  verbose = 'verbose',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV!: NodeEnv;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN!: string;

  @IsString()
  CORS_ORIGIN!: string;

  @IsEnum(LogLevel)
  LOG_LEVEL!: LogLevel;
}

export interface AppConfig {
  nodeEnv: NodeEnv;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
  logLevel: LogLevel;
  isProduction: boolean;
}

function parseExpiresInSeconds(value: string): number {
  const match = /^(\d+)([smhd])?$/.exec(value);
  if (!match) {
    return 3600;
  }
  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  switch (unit) {
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 3600;
    case 'd':
      return amount * 86400;
    default:
      return amount;
  }
}

export function validateEnvironment(config: Record<string, unknown>): AppConfig {
  const validated = plainToInstance(
    EnvironmentVariables,
    {
      ...config,
      PORT: config.PORT ? Number(config.PORT) : undefined,
    },
    { enableImplicitConversion: true },
  );

  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid application configuration: ${messages}`);
  }

  if (validated.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters.');
  }

  if (
    validated.NODE_ENV === NodeEnv.production &&
    (validated.JWT_SECRET.includes('change-me') ||
      validated.JWT_SECRET === 'local-dev-only-change-me-to-a-long-random-secret-value')
  ) {
    throw new Error('JWT_SECRET must not use the local development placeholder in production.');
  }

  return {
    nodeEnv: validated.NODE_ENV,
    port: validated.PORT,
    databaseUrl: validated.DATABASE_URL,
    jwtSecret: validated.JWT_SECRET,
    jwtExpiresIn: validated.JWT_EXPIRES_IN,
    corsOrigin: validated.CORS_ORIGIN,
    logLevel: validated.LOG_LEVEL,
    isProduction: validated.NODE_ENV === NodeEnv.production,
  };
}

export function getJwtExpiresInSeconds(expiresIn: string): number {
  return parseExpiresInSeconds(expiresIn);
}
