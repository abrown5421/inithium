import type { MongoClient } from 'mongodb';

import { UserRole, type RegisterRequest, type TokenResponse } from '@inithium/shared';
import type { Request, Response } from 'express';

import type { AuthConfig } from '../config/auth-config.interface';
import { hashPassword } from '../password/password.utils';
import { storeRefreshToken, hashRefreshToken } from '../tokens/refresh-token.utils';
import { generateRefreshTokenString, signAccessToken } from '../tokens/token.utils';
import { createUser, findUserByEmail } from '../users/user.repository';
import { parseDuration } from '../utils/parse-duration';

import crypto from 'crypto';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getCookieSecureFlag(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function createRegisterHandler(
  client: MongoClient,
  config: AuthConfig,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    const body = req.body as Partial<RegisterRequest> | undefined;
    const details: string[] = [];

    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !isValidEmail(email)) {
      details.push('email must be a valid email address');
    }
    if (!password || password.length < 8) {
      details.push('password must be at least 8 characters');
    }

    if (details.length > 0) {
      res.status(400).json({ error: 'Validation failed', details });
      return;
    }

    const existing = await findUserByEmail(client, email);
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const passwordHash = await hashPassword(password, config.bcryptRounds);
    const user = await createUser(client, email, passwordHash, UserRole.User);

    const family = crypto.randomUUID();
    const accessToken = signAccessToken(
      { sub: user._id.toHexString(), email: user.email, role: user.role, rtFamily: family },
      config,
    );

    const rawRefreshToken = generateRefreshTokenString();
    const tokenHash = await hashRefreshToken(rawRefreshToken);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + parseDuration(config.refreshTokenExpiresIn));

    await storeRefreshToken(client, {
      userId: user._id,
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
        _id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
      },
    };

    res.status(201).json(response);
  };
}
