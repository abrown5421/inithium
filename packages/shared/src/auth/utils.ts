import type { User, UserResponse } from './types.js';

export function sanitizeUser(user: User): UserResponse {
  return {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role ?? 'user',
    createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

export function isValidRole(role: unknown): role is 'user' | 'admin' {
  return role === 'user' || role === 'admin';
}

export function isAdmin(user: User | UserResponse): boolean {
  return user.role === 'admin';
}

export function getFullName(user: User | UserResponse): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
