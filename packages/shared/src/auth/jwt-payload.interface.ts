import type { UserRole } from './roles.enum.js';

export interface JwtPayload {
  sub: string; // user _id as string
  email: string;
  role: UserRole;
  rtFamily?: string;
  iat?: number;
  exp?: number;
}
