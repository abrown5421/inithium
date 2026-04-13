import { Router } from 'express';
import { validate, authValidators } from '@inithium/validators';
import type { LoginCredentials } from '@inithium/types';
import { authService } from './auth.service.js';

export const authRouter: Router = Router();

authRouter.post(
  '/login',
  validate(authValidators.login),
  async (req, res, next) => {
    try {
      const tokens = await authService.login(req.body as LoginCredentials);
      res.status(200).json({ success: true, data: tokens });
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
      res.status(201).json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post(
  '/refresh',
  validate(authValidators.refresh),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      const tokens = await authService.refresh(refreshToken);
      res.status(200).json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post('/logout', (_req, res) => {
  res.status(200).json({ success: true, data: null });
});
