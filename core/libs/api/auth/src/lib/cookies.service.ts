import type { CookieOptions, Response } from 'express';
import { loadEnv } from '@inithium/api-config';

export const ACCESS_COOKIE = 'inithium_access';
export const REFRESH_COOKIE = 'inithium_refresh';

// The access cookie is sent with every API request; the refresh cookie only to /api/auth.
const ACCESS_PATH = '/api';
const REFRESH_PATH = '/api/auth';

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    // Safari rejects Secure cookies on http://localhost, so only set it in production.
    secure: loadEnv().NODE_ENV === 'production',
    sameSite: 'strict',
  };
}

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }): void {
  const env = loadEnv();
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions(),
    path: ACCESS_PATH,
    maxAge: env.JWT_ACCESS_TTL_MINUTES * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions(),
    path: REFRESH_PATH,
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions(), path: ACCESS_PATH });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions(), path: REFRESH_PATH });
}
