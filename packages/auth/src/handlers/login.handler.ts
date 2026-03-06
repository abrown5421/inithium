import type { UserRepository, RefreshTokenRepository, LoginRequest, TokenResponse } from '@inithium/shared';
import type { Request, Response } from 'express';
import type { AuthConfig } from '../config/auth-config.interface.js';
import { comparePassword } from '../password/password.utils.js';
import { hashRefreshToken } from '../tokens/refresh-token.utils.js';
import { generateRefreshTokenString, signAccessToken } from '../tokens/token.utils.js';
import { parseDuration } from '../utils/parse-duration.js';
import crypto from 'crypto';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getCookieSecureFlag(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function createLoginHandler(
  users: UserRepository,
  tokens: RefreshTokenRepository,
  config: AuthConfig,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    const body = req.body as Partial<LoginRequest> | undefined;
    const details: string[] = [];

    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !isValidEmail(email)) {
      details.push('email must be a valid email address');
    }
    if (!password) {
      details.push('password is required');
    }

    if (details.length > 0) {
      res.status(400).json({ error: 'Validation failed', details });
      return;
    }

    const user = await users.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    await users.updateLastLogin(user.id);

    const family = crypto.randomUUID();
    const accessToken = signAccessToken(
      { sub: user.id, email: user.email, role: user.role, rtFamily: family },
      config,
    );

    const rawRefreshToken = generateRefreshTokenString();
    const tokenHash = await hashRefreshToken(rawRefreshToken);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + parseDuration(config.refreshTokenExpiresIn));

    await tokens.store({
      userId: user.id,
      tokenHash,
      family,
      isRevoked: false,
      expiresAt,
      createdAt: now,
    });

    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: getCookieSecureFlag(),
      sameSite: 'strict',
      path: '/',
      expires: expiresAt,
    });

    const response: TokenResponse = {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
      },
    };

    res.status(200).json(response);
  };
}
