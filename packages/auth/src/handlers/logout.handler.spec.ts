import jwt from 'jsonwebtoken';
import { createLogoutHandler } from './logout.handler.js';
import { makeTokenRepo, makeReq, makeRes } from './mocks.js';
import type { JwtPayload } from '@inithium/shared';
import { UserRole } from '@inithium/shared';

const TEST_SECRET = 'test-secret-that-is-long-enough';

function makeAccessToken(payload: Partial<JwtPayload> = {}): string {
  return jwt.sign(
    { sub: 'abc123', email: 'user@example.com', role: UserRole.User, rtFamily: 'test-family', ...payload },
    TEST_SECRET,
    { expiresIn: '15m' },
  );
}

describe('createLogoutHandler', () => {
  // -------------------------------------------------------------------------
  // No cookie present
  // -------------------------------------------------------------------------

  describe('when no refresh token cookie is present', () => {
    it('returns 200 without touching the token repo', async () => {
      const tokens = makeTokenRepo();
      const handler = createLogoutHandler(tokens);
      const req = makeReq({ cookies: {} });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(tokens.revokeFamily).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Cookie present, valid JWT
  // -------------------------------------------------------------------------

  describe('when refresh token cookie and bearer token are present', () => {
    it('revokes the token family from the JWT rtFamily claim', async () => {
      const tokens = makeTokenRepo();
      const handler = createLogoutHandler(tokens);
      const accessToken = makeAccessToken({ rtFamily: 'family-to-revoke' });
      const req = makeReq({
        cookies: { refreshToken: 'some-raw-token' },
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const res = makeRes();

      await handler(req, res as never);

      expect(tokens.revokeFamily).toHaveBeenCalledWith('family-to-revoke');
    });

    it('returns 200 after revoking', async () => {
      const tokens = makeTokenRepo();
      const handler = createLogoutHandler(tokens);
      const accessToken = makeAccessToken();
      const req = makeReq({
        cookies: { refreshToken: 'some-raw-token' },
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('clears the refreshToken cookie', async () => {
      const handler = createLogoutHandler(makeTokenRepo());
      const accessToken = makeAccessToken();
      const req = makeReq({
        cookies: { refreshToken: 'some-raw-token' },
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Cookie present, no/invalid JWT
  // -------------------------------------------------------------------------

  describe('when refresh cookie is present but bearer token is missing', () => {
    it('still returns 200 and clears cookie but does not call revokeFamily', async () => {
      const tokens = makeTokenRepo();
      const handler = createLogoutHandler(tokens);
      const req = makeReq({ cookies: { refreshToken: 'some-raw-token' }, headers: {} });
      const res = makeRes();

      await handler(req, res as never);

      expect(tokens.revokeFamily).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
