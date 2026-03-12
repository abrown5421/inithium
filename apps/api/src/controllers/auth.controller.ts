import type { Request, Response, NextFunction } from 'express';
import type { RegisterInput, LoginInput, RefreshInput } from '@inithium/shared';
import { sanitizeUser } from '@inithium/shared';
import { authService } from '../services/auth.service.js';

export async function register(
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request<object, object, RefreshInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function logout(
  _req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  res.status(200).json({
    message: 'Logged out successfully',
  });
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const user = await authService.getUserById(req.user.userId);
    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    next(error);
  }
}
