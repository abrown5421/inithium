import { resolveCategory } from './config/index.js';
import { purgeExpiredTokens, registerToken, consumeToken, peekToken } from './handshake/token-store.js';

describe('resolveCategory', () => {
  it('maps image mimeTypes to images category', () => {
    expect(resolveCategory('image/png')).toBe('images');
    expect(resolveCategory('image/jpeg')).toBe('images');
  });

  it('maps font mimeTypes to fonts category', () => {
    expect(resolveCategory('font/woff2')).toBe('fonts');
  });

  it('falls back to misc for unknown mimeTypes', () => {
    expect(resolveCategory('application/x-unknown')).toBe('misc');
  });
});

describe('token-store', () => {
  beforeEach(() => {
    // Reset internal state before each test
    purgeExpiredTokens();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('registers and retrieves a valid token', () => {
    const token = {
      uploadId: 'test-id',
      storageKey: 'test-id.png',
      mimeType: 'image/png',
      originalName: 'photo.png',
      expiresAt: Date.now() + 60_000,
    };
    registerToken(token);
    expect(peekToken('test-id')).toEqual(token);
  });

  it('consumeToken removes it after access', () => {
    const token = {
      uploadId: 'consume-id',
      storageKey: 'consume-id.png',
      mimeType: 'image/png',
      originalName: 'photo.png',
      expiresAt: Date.now() + 60_000,
    };
    registerToken(token);
    const result = consumeToken('consume-id');
    expect(result).toEqual(token);
    expect(consumeToken('consume-id')).toBeNull();
  });

  it('returns null for expired tokens', () => {
    const token = {
      uploadId: 'expired-id',
      storageKey: 'expired-id.png',
      mimeType: 'image/png',
      originalName: 'photo.png',
      expiresAt: Date.now() - 1000,
    };
    registerToken(token);
    expect(peekToken('expired-id')).toBeNull();
  });

  it('returns null for unknown uploadId', () => {
    expect(consumeToken('does-not-exist')).toBeNull();
  });
});