import jwt from 'jsonwebtoken';
import type { JwtPayload } from '@inithium/types';

export const signAccessToken  = (payload: JwtPayload) =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });

export const signRefreshToken = (payload: JwtPayload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });

export const verifyAccessToken  = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;