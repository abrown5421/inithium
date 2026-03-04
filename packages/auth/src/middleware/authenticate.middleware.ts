import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, JwtPayload } from '@inithium/shared';
import type { AuthConfig } from '../config/auth-config.interface.js';
import { verifyAccessToken } from '../tokens/token.utils.js';

export function createAuthenticateMiddleware(
  config: AuthConfig,
): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const payload: JwtPayload = verifyAccessToken(token, config);
      req.session = payload;
      next();
    } catch {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
}
