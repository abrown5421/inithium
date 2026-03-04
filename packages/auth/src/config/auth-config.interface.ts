import type { Secret, SignOptions } from 'jsonwebtoken';

export interface AuthConfig {
  jwtSecret: Secret;
  jwtExpiresIn: SignOptions['expiresIn'];
  refreshTokenExpiresIn: SignOptions['expiresIn'];
  bcryptRounds: number;
}