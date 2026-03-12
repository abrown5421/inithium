import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '@inithium/shared';
import { AUTH_ERRORS } from '@inithium/shared';
import { tokenService } from '../services/token.service.js';
import { UnauthorizedError, ForbiddenError } from '../errors/index.js';

/**
 * Extend Express Request to include user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Extract token from Authorization header
 */
function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Middleware to authenticate requests using JWT
 * Adds user data to req.user if token is valid
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    // Extract token from header
    const token = extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedError(AUTH_ERRORS.UNAUTHORIZED);
    }

    // Verify token
    const payload = tokenService.verifyAccessToken(token);

    // Attach user data to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError(AUTH_ERRORS.INVALID_TOKEN));
    }
  }
}

/**
 * Middleware to require admin role
 * Must be used after authenticate middleware
 */
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    return next(new UnauthorizedError(AUTH_ERRORS.UNAUTHORIZED));
  }

  if (req.user.role !== 'admin') {
    return next(new ForbiddenError(AUTH_ERRORS.FORBIDDEN));
  }

  next();
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      return next();
    }

    const payload = tokenService.verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next();
  }
}
