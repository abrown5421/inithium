import { Router } from 'express';
import { validate, authValidators } from '@inithium/validators';
import type { LoginCredentials } from '@inithium/types';
import { authService } from './auth.service.js';

export const authRouter: Router = Router();

const REFRESH_COOKIE = 'refreshToken';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

authRouter.post(
  '/login',
  validate(authValidators.login),
  async (req, res, next) => {
    try {
      const tokens = await authService.login(req.body as LoginCredentials);
      res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
      res.status(200).json({ success: true, data: { accessToken: tokens.accessToken } });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post(
  '/register',
  validate(authValidators.register),
  async (req, res, next) => {
    try {
      const tokens = await authService.register(req.body);
      res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
      res.status(201).json({ success: true, data: { accessToken: tokens.accessToken } });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post(
  '/refresh',
  async (req, res, next) => {
    try {
      // Prefer the httpOnly cookie; fall back to body for backwards-compat
      const refreshToken: string | undefined =
        req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ success: false, error: 'No refresh token provided' });
        return;
      }

      const tokens = await authService.refresh(refreshToken);
      res.status(200).json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.status(200).json({ success: true, data: null });
});