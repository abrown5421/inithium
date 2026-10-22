import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Permission } from '@inithium/shared-contracts';
import { hasPermission } from '@inithium/shared-permissions';
import { ACCESS_COOKIE } from './cookies.service';
import { isSessionRevoked } from './sessions.service';
import { verifyAccessToken, type AccessTokenPayload } from './tokens.service';

const AUTH_LOCAL = 'auth';

/** The authenticated user's token payload. Only call after requireAuth has run. */
export function getAuth(res: Response): AccessTokenPayload {
  const auth = res.locals[AUTH_LOCAL] as AccessTokenPayload | undefined;
  if (!auth) throw new Error('getAuth() called on a route without requireAuth');
  return auth;
}

/**
 * Accepts any valid access token, including one that must change its password first: only for the routes that
 * make that change possible (/auth/me and /auth/change-password). Everything else uses requireAuth.
 */
export const requireSession: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const payload = readAuth(req);
  if (!payload) {
    res.status(401).send({ message: 'Not authenticated' });
    return;
  }
  res.locals[AUTH_LOCAL] = payload;
  next();
};

/**
 * The request's session, if it carries a valid access token, without requiring one: for public routes that answer
 * differently to a signed-in user (e.g. a profile shows its owner their email). Revoked sessions count as none.
 */
export function readAuth(req: Request): AccessTokenPayload | null {
  const token: unknown = req.cookies?.[ACCESS_COOKIE];
  const payload = typeof token === 'string' ? verifyAccessToken(token) : null;
  return payload && !isSessionRevoked(payload.sub, payload.iat) ? payload : null;
}

/**
 * The session a raw `Cookie` header carries, as `readAuth` reads it: for connections Express doesn't parse, e.g. the
 * realtime handshake (decision 0121).
 */
export function readAuthFromCookieHeader(header: string | undefined): AccessTokenPayload | null {
  const pair = (header ?? '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ACCESS_COOKIE}=`));
  if (!pair) return null;
  let token: string;
  try {
    token = decodeURIComponent(pair.slice(ACCESS_COOKIE.length + 1));
  } catch {
    return null;
  }
  const payload = verifyAccessToken(token);
  return payload && !isSessionRevoked(payload.sub, payload.iat) ? payload : null;
}

/**
 * Rejects the request with 401 unless it carries a valid access token, and with 403 (`code:
 * 'PASSWORD_CHANGE_REQUIRED'`) while the account must change its password first (decision 0088).
 */
export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  requireSession(req, res, () => {
    if (getAuth(res).pcr) {
      res.status(403).send({ message: 'Change your password to continue', code: 'PASSWORD_CHANGE_REQUIRED' });
      return;
    }
    next();
  });
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
