import { AuthConfig } from '@inithium/auth';
import type { SignOptions, Secret } from 'jsonwebtoken';

export interface AppConfig extends AuthConfig {
  host: string;
  port: number;
  mongoUri: string;
  nodeEnv: string;
}

export function getConfig(): AppConfig {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const mongoUri = process.env.MONGO_URI;
  const jwtSecret: Secret = process.env.JWT_SECRET ?? '';

  if (!mongoUri) throw new Error('MONGO_URI environment variable is required');
  if (!jwtSecret) throw new Error('JWT_SECRET environment variable is required');

  const nodeEnv = process.env.NODE_ENV ?? 'development';

  const jwtExpiresIn: SignOptions['expiresIn'] =
    (process.env.JWT_EXPIRES_IN ?? '15m') as SignOptions['expiresIn'];

  const refreshTokenExpiresIn: SignOptions['expiresIn'] =
    (process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];

  const bcryptRounds = process.env.BCRYPT_ROUNDS ? Number(process.env.BCRYPT_ROUNDS) : 12;

  return {
    host,
    port,
    mongoUri,
    nodeEnv,
    jwtSecret,
    jwtExpiresIn,
    refreshTokenExpiresIn,
    bcryptRounds,
  };
}