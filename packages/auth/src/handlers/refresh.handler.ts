import type { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
import type { JwtPayload, RefreshTokenDocument, TokenResponse } from '@inithium/shared';
import type { Request, Response } from 'express';
import type { AuthConfig } from '../config/auth-config.interface.js';
import { findRefreshTokenByFamily, hashRefreshToken, revokeTokenById, revokeTokenFamily, storeRefreshToken } from '../tokens/refresh-token.utils.js';
import { generateRefreshTokenString, signAccessToken } from '../tokens/token.utils.js';
import { findUserById } from '../users/user.repository.js';
import { parseDuration } from '../utils/parse-duration.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export function createRefreshHandler(
  client: MongoClient,
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
    const refreshTokens = client.db().collection<RefreshTokenDocument>('refresh_tokens');

    let tokenDoc: RefreshTokenDocument | null = null;

    if (rtFamily) {
      const latestAny = await refreshTokens.findOne({ family: rtFamily }, { sort: { createdAt: -1 } });
      if (latestAny?.isRevoked) {
        await revokeTokenFamily(client, rtFamily);
        res.status(401).json({ error: 'Token reuse detected. Please log in again.' });
        return;
      }
      if (latestAny && latestAny.expiresAt.getTime() <= now.getTime()) {
        res.status(401).json({ error: 'Refresh token expired' });
        return;
      }

      tokenDoc = await findRefreshTokenByFamily(client, rtFamily);
    } else if (sub) {
      let userId: ObjectId | null = null;
      try {
        userId = new ObjectId(sub);
      } catch {
        userId = null;
      }

      if (userId) {
        const candidates = await refreshTokens
          .find({ userId, isRevoked: false, expiresAt: { $gt: now } }, { sort: { createdAt: -1 }, limit: 25 })
          .toArray();

        for (const candidate of candidates) {
          const match = await bcrypt.compare(rawRefreshToken, candidate.tokenHash);
          if (match) {
            tokenDoc = candidate;
            break;
          }
        }
      }
    }

    if (!tokenDoc) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (tokenDoc.isRevoked) {
      await revokeTokenFamily(client, tokenDoc.family);
      res.status(401).json({ error: 'Token reuse detected. Please log in again.' });
      return;
    }

    if (tokenDoc.expiresAt.getTime() <= now.getTime()) {
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }

    const valid = await bcrypt.compare(rawRefreshToken, tokenDoc.tokenHash);
    if (!valid) {
      await revokeTokenFamily(client, tokenDoc.family);
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await revokeTokenById(client, tokenDoc._id);

    const user = await findUserById(client, tokenDoc.userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const newRawRefreshToken = generateRefreshTokenString();
    const newTokenHash = await hashRefreshToken(newRawRefreshToken);
    const expiresAt = new Date(now.getTime() + parseDuration(config.refreshTokenExpiresIn));//error here

    await storeRefreshToken(client, {
      userId: user._id,
      tokenHash: newTokenHash,
      family: tokenDoc.family,
      isRevoked: false,
      expiresAt,
      createdAt: now,
    });

    const accessToken = signAccessToken(
      { sub: user._id.toHexString(), email: user.email, role: user.role, rtFamily: tokenDoc.family },
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
        _id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
      },
    };

    res.status(200).json(response);
  };
}
