import type { UserRepository, RefreshTokenRepository, JwtPayload, TokenResponse } from '@inithium/shared';
import type { Request, Response } from 'express';
import type { AuthConfig } from '../config/auth-config.interface.js';
import { hashRefreshToken, verifyRefreshToken } from '../tokens/refresh-token.utils.js';
import { generateRefreshTokenString, signAccessToken } from '../tokens/token.utils.js';
import { parseDuration } from '../utils/parse-duration.js';
import jwt from 'jsonwebtoken';

export function createRefreshHandler(
  users: UserRepository,
  tokens: RefreshTokenRepository,
  config: AuthConfig,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    const cookies = (req as Request & { cookies?: Record<string, unknown> }).cookies;
    const rawRefreshToken = typeof cookies?.refreshToken === 'string' ? cookies.refreshToken : null;
    if (!rawRefreshToken) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const authHeader = req.headers.authorization;
    const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
    const decoded = bearer ? jwt.decode(bearer) : null;
    const decodedPayload = decoded && typeof decoded === 'object' ? (decoded as Partial<JwtPayload>) : null;
    const rtFamily = typeof decodedPayload?.rtFamily === 'string' ? decodedPayload.rtFamily : null;
    const sub = typeof decodedPayload?.sub === 'string' ? decodedPayload.sub : null;

    const now = new Date();
    let tokenDoc = null;

    if (rtFamily) {
      const latestAny = await tokens.findAnyByFamily(rtFamily);
      if (latestAny?.isRevoked) {
        await tokens.revokeFamily(rtFamily);
        res.status(401).json({ error: 'Token reuse detected. Please log in again.' });
        return;
      }
      if (latestAny && latestAny.expiresAt.getTime() <= now.getTime()) {
        res.status(401).json({ error: 'Refresh token expired' });
        return;
      }
      tokenDoc = await tokens.findLatestByFamily(rtFamily);
    } else if (sub) {
      const candidates = await tokens.findValidByUserId(sub, 25);
      for (const candidate of candidates) {
        const match = await verifyRefreshToken(rawRefreshToken, candidate.tokenHash);
        if (match) {
          tokenDoc = candidate;
          break;
        }
      }
    }

    if (!tokenDoc) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (tokenDoc.isRevoked) {
      await tokens.revokeFamily(tokenDoc.family);
      res.status(401).json({ error: 'Token reuse detected. Please log in again.' });
      return;
    }

    if (tokenDoc.expiresAt.getTime() <= now.getTime()) {
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }

    const valid = await verifyRefreshToken(rawRefreshToken, tokenDoc.tokenHash);
    if (!valid) {
      await tokens.revokeFamily(tokenDoc.family);
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await tokens.revokeById(tokenDoc.id);

    const user = await users.findById(tokenDoc.userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const newRawRefreshToken = generateRefreshTokenString();
    const newTokenHash = await hashRefreshToken(newRawRefreshToken);
    const expiresAt = new Date(now.getTime() + parseDuration(config.refreshTokenExpiresIn));

    await tokens.store({
      userId: user.id,
      tokenHash: newTokenHash,
      family: tokenDoc.family,
      isRevoked: false,
      expiresAt,
      createdAt: now,
    });

    const accessToken = signAccessToken(
      { sub: user.id, email: user.email, role: user.role, rtFamily: tokenDoc.family },
      config,
    );

    res.cookie('refreshToken', newRawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
