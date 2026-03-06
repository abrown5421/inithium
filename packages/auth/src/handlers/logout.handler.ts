import type { RefreshTokenRepository, JwtPayload } from '@inithium/shared';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function createLogoutHandler(
  tokens: RefreshTokenRepository,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    const cookies = (req as Request & { cookies?: Record<string, unknown> }).cookies;
    const rawRefreshToken = typeof cookies?.refreshToken === 'string' ? cookies.refreshToken : null;

    if (!rawRefreshToken) {
      res.status(200).json({ message: 'Logged out' });
      return;
    }

    const authHeader = req.headers.authorization;
    const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
    const decoded = bearer ? jwt.decode(bearer) : null;
    const payload = decoded && typeof decoded === 'object' ? (decoded as Partial<JwtPayload>) : null;
    const rtFamily = typeof payload?.rtFamily === 'string' ? payload.rtFamily : null;

    if (rtFamily) {
      await tokens.revokeFamily(rtFamily);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({ message: 'Logged out' });
  };
}
