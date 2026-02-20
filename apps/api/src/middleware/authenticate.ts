import { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '@inithium/shared';
import { verifyToken } from '../models/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : cookieToken;

    if (!token) {
      res
        .status(401)
        .json({ success: false, error: 'No token provided', statusCode: 401 });
      return;
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      statusCode: 401,
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res
        .status(403)
        .json({ success: false, error: 'Forbidden', statusCode: 403 });
      return;
    }
    next();
  };
}
