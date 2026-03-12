export const AUTH_ROUTES = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User with this email already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized - no token provided',
  FORBIDDEN: 'Forbidden - insufficient permissions',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 10,
  REQUIRES_LETTER: true,
  REQUIRES_NUMBER: true,
  REQUIRES_SPECIAL: true,
} as const;
