import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Permission } from '@inithium/shared-contracts';
import { hasPermission } from '@inithium/shared-permissions';
import { ACCESS_COOKIE } from './cookies.service';
import { verifyAccessToken, type AccessTokenPayload } from './tokens.service';

const AUTH_LOCAL = 'auth';

/** The authenticated user's token payload. Only call after requireAuth has run. */
export function getAuth(res: Response): AccessTokenPayload {
  const auth = res.locals[AUTH_LOCAL] as AccessTokenPayload | undefined;
  if (!auth) throw new Error('getAuth() called on a route without requireAuth');
  return auth;
}

/** Rejects the request with 401 unless it carries a valid access token. */
export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const token: unknown = req.cookies?.[ACCESS_COOKIE];
  const payload = typeof token === 'string' ? verifyAccessToken(token) : null;
  if (!payload) {
    res.status(401).send({ message: 'Not authenticated' });
    return;
  }
  res.locals[AUTH_LOCAL] = payload;
  next();
};

/** Requires a valid access token whose role holds the permission (401 if not signed in, 403 if not allowed). */
export function requirePermission(permission: Permission): RequestHandler[] {
  return [
    requireAuth,
    (_req, res, next) => {
      if (!hasPermission(getAuth(res).role, permission)) {
        res.status(403).send({ message: 'You do not have permission to do this' });
        return;
      }
      next();
    },
  ];
}
