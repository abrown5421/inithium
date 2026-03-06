import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createRefreshHandler } from './refresh.handler.js';
import { makeUserRepo, makeTokenRepo, makeReq, makeRes, TEST_CONFIG, makeUserDocument, makeTokenDocument } from './mocks.js';
import type { JwtPayload } from '@inithium/shared';
import { UserRole } from '@inithium/shared';

const TEST_SECRET = TEST_CONFIG.jwtSecret as string;

function makeAccessToken(payload: Partial<JwtPayload> = {}): string {
  return jwt.sign(
    { sub: 'aabbccddeeff001122334455', email: 'user@example.com', role: UserRole.User, rtFamily: 'test-family', ...payload },
    TEST_SECRET,
    { expiresIn: '15m' },
  );
}

async function makeRealTokenDoc(rawToken: string, overrides = {}) {
  const tokenHash = await bcrypt.hash(rawToken, 1);
  return makeTokenDocument({ tokenHash, ...overrides });
}

describe('createRefreshHandler', () => {
  // -------------------------------------------------------------------------
  // Missing cookie
  // -------------------------------------------------------------------------

  describe('when no refresh token cookie is present', () => {
    it('returns 401', async () => {
      const handler = createRefreshHandler(makeUserRepo(), makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ cookies: {} });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // -------------------------------------------------------------------------
  // Token reuse detection
  // -------------------------------------------------------------------------

  describe('token reuse detection', () => {
    it('returns 401 and revokes the family when the latest token is already revoked', async () => {
      const revokedDoc = makeTokenDocument({ isRevoked: true, family: 'stolen-family' });
      const tokens = makeTokenRepo({
        findAnyByFamily: jest.fn().mockResolvedValue(revokedDoc),
      });

      const handler = createRefreshHandler(makeUserRepo(), tokens, TEST_CONFIG);
      const accessToken = makeAccessToken({ rtFamily: 'stolen-family' });
      const req = makeReq({
        cookies: { refreshToken: 'some-token' },
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const res = makeRes();

      await handler(req, res as never);

      expect(tokens.revokeFamily).toHaveBeenCalledWith('stolen-family');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res._body).toMatchObject({ error: expect.stringContaining('reuse') });
    });
  });

  // -------------------------------------------------------------------------
  // Expired token
  // -------------------------------------------------------------------------

  describe('expired token', () => {
    it('returns 401 when the token document is past its expiry', async () => {
      const expiredDoc = makeTokenDocument({
        isRevoked: false,
        expiresAt: new Date(Date.now() - 1000), // in the past
      });
      const tokens = makeTokenRepo({
        findAnyByFamily: jest.fn().mockResolvedValue(expiredDoc),
      });

      const handler = createRefreshHandler(makeUserRepo(), tokens, TEST_CONFIG);
      const accessToken = makeAccessToken({ rtFamily: 'test-family' });
      const req = makeReq({
        cookies: { refreshToken: 'some-token' },
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // -------------------------------------------------------------------------
  // Success via rtFamily claim
  // -------------------------------------------------------------------------

  describe('successful refresh via rtFamily claim', () => {
    async function setupSuccessfulRefresh() {
      const rawToken = 'valid-raw-refresh-token-string';
      const tokenDoc = await makeRealTokenDoc(rawToken, { family: 'test-family' });
      const user = makeUserDocument();

      const tokens = makeTokenRepo({
        findAnyByFamily: jest.fn().mockResolvedValue(tokenDoc),
        findLatestByFamily: jest.fn().mockResolvedValue(tokenDoc),
      });
      const users = makeUserRepo({
        findById: jest.fn().mockResolvedValue(user),
      });

      const handler = createRefreshHandler(users, tokens, TEST_CONFIG);
      const accessToken = makeAccessToken({ rtFamily: 'test-family', sub: user.id });
      const req = makeReq({
        cookies: { refreshToken: rawToken },
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const res = makeRes();

      await handler(req, res as never);
      return { res, tokens, users, user };
    }

    it('returns 200 with a new accessToken', async () => {
      const { res } = await setupSuccessfulRefresh();

      expect(res.status).toHaveBeenCalledWith(200);
      const body = res._body as { accessToken: string };
      expect(body.accessToken).toBeTruthy();
    });

    it('revokes the old token by id', async () => {
      const { tokens } = await setupSuccessfulRefresh();
      expect(tokens.revokeById).toHaveBeenCalledTimes(1);
    });

    it('stores a new refresh token', async () => {
      const { tokens } = await setupSuccessfulRefresh();
      expect(tokens.store).toHaveBeenCalledTimes(1);
      const stored = tokens.store.mock.calls[0][0];
      expect(stored.isRevoked).toBe(false);
      expect(stored.family).toBe('test-family'); // same family, rotated
    });

    it('sets a new refreshToken cookie', async () => {
      const { res } = await setupSuccessfulRefresh();
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('does not expose passwordHash in the response', async () => {
      const { res } = await setupSuccessfulRefresh();
      expect(JSON.stringify(res._body)).not.toContain('passwordHash');
    });
  });

  // -------------------------------------------------------------------------
  // No rtFamily fallback (sub-based lookup)
  // -------------------------------------------------------------------------

  describe('fallback lookup when no rtFamily in JWT', () => {
    it('returns 401 when no matching token is found among candidates', async () => {
      const tokens = makeTokenRepo({
        findValidByUserId: jest.fn().mockResolvedValue([]),
      });

      const handler = createRefreshHandler(makeUserRepo(), tokens, TEST_CONFIG);
      // JWT with no rtFamily
      const accessToken = jwt.sign(
        { sub: 'aabbccddeeff001122334455', email: 'user@example.com', role: UserRole.User },
        TEST_SECRET,
        { expiresIn: '15m' },
      );
      const req = makeReq({
        cookies: { refreshToken: 'some-token' },
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
