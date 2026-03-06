import type { Request } from 'express';
import type { UserDocument, UserRepository, RefreshTokenDocument, RefreshTokenRepository } from '@inithium/shared';
import { UserRole } from '@inithium/shared';
import type { AuthConfig } from '../config/auth-config.interface.js';
import { jest } from '@jest/globals';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

export const TEST_CONFIG: AuthConfig = {
  jwtSecret: 'test-secret-that-is-long-enough',
  jwtExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
  bcryptRounds: 1,
};

export function makeUserDocument(overrides: Partial<UserDocument> = {}): UserDocument {
  return {
    id: 'aabbccddeeff001122334455',
    email: 'user@example.com',
    passwordHash: '$2b$01$placeholder',
    role: UserRole.User,
    isEmailVerified: false,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function makeTokenDocument(overrides: Partial<RefreshTokenDocument> = {}): RefreshTokenDocument {
  return {
    id: '112233445566778899aabbcc',
    userId: 'aabbccddeeff001122334455',
    tokenHash: '$2b$01$tokenplaceholder',
    family: 'test-family-uuid',
    isRevoked: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Repository mocks
// ---------------------------------------------------------------------------

export function makeUserRepo(overrides: Partial<UserRepository> = {}): jest.Mocked<UserRepository> {
  return {
    findByEmail: jest.fn<UserRepository['findByEmail']>().mockResolvedValue(null),
    findById: jest.fn<UserRepository['findById']>().mockResolvedValue(null),
    create: jest.fn<UserRepository['create']>().mockResolvedValue(makeUserDocument()),
    updateLastLogin: jest.fn<UserRepository['updateLastLogin']>().mockResolvedValue(undefined),
    ...overrides,
  } as jest.Mocked<UserRepository>;
}

export function makeTokenRepo(overrides: Partial<RefreshTokenRepository> = {}): jest.Mocked<RefreshTokenRepository> {
  return {
    store: jest.fn<RefreshTokenRepository['store']>().mockResolvedValue(undefined),
    findLatestByFamily: jest.fn<RefreshTokenRepository['findLatestByFamily']>().mockResolvedValue(null),
    findAnyByFamily: jest.fn<RefreshTokenRepository['findAnyByFamily']>().mockResolvedValue(null),
    findValidByUserId: jest.fn<RefreshTokenRepository['findValidByUserId']>().mockResolvedValue([]),
    revokeById: jest.fn<RefreshTokenRepository['revokeById']>().mockResolvedValue(undefined),
    revokeFamily: jest.fn<RefreshTokenRepository['revokeFamily']>().mockResolvedValue(undefined),
    deleteExpired: jest.fn<RefreshTokenRepository['deleteExpired']>().mockResolvedValue(undefined),
    ...overrides,
  } as jest.Mocked<RefreshTokenRepository>;
}

// ---------------------------------------------------------------------------
// Express req/res mocks
// ---------------------------------------------------------------------------

export function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    headers: {},
    cookies: {},
    ...overrides,
  } as unknown as Request;
}

export function makeRes() {
  const res = {
    _status: 200 as number,
    _body: undefined as unknown,
    status: jest.fn(),
    json: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  res.status.mockImplementation((...args: unknown[]) => {
    res._status = args[0] as number;
    return res;
  });
  res.json.mockImplementation((...args: unknown[]) => {
    res._body = args[0];
    return res;
  });

  return res;
}