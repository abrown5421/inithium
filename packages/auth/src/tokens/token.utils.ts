import type { JwtPayload } from '@inithium/shared';
import type { AuthConfig } from '../config/auth-config.interface.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export function signAccessToken(payload: JwtPayload, config: AuthConfig): string {
  const { sub, email, role, rtFamily } = payload;
  const toSign: Pick<JwtPayload, 'sub' | 'email' | 'role'> & { rtFamily?: string } = {
    sub,
    email,
    role,
  };
  if (rtFamily) {
    toSign.rtFamily = rtFamily;
  }

  return jwt.sign(toSign, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function verifyAccessToken(token: string, config: AuthConfig): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded || typeof decoded !== 'object') {
      throw new Error('Unauthorized');
    }

    const payload = decoded as Partial<JwtPayload>;
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string' || typeof payload.role !== 'string') {
      throw new Error('Unauthorized');
    }

    return payload as JwtPayload;
  } catch {
    throw new Error('Unauthorized');
  }
}

export function generateRefreshTokenString(): string {
  return `${crypto.randomUUID()}${crypto.randomBytes(32).toString('hex')}`;
}
