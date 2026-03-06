import bcrypt from 'bcrypt';
import { createLoginHandler } from './login.handler.js';
import { makeUserRepo, makeTokenRepo, makeReq, makeRes, TEST_CONFIG, makeUserDocument } from './mocks.js';

describe('createLoginHandler', () => {
  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  describe('validation', () => {
    it('returns 400 when email is missing', async () => {
      const handler = createLoginHandler(makeUserRepo(), makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { password: 'password123' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when password is missing', async () => {
      const handler = createLoginHandler(makeUserRepo(), makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { email: 'user@example.com' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(400);
      expect((res._body as { details: string[] }).details).toEqual(
        expect.arrayContaining(['password is required']),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Authentication failures
  // -------------------------------------------------------------------------

  describe('authentication failures', () => {
    it('returns 401 when user is not found', async () => {
      const users = makeUserRepo({ findByEmail: jest.fn().mockResolvedValue(null) });
      const handler = createLoginHandler(users, makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { email: 'ghost@example.com', password: 'password123' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res._body).toMatchObject({ error: 'Invalid credentials' });
    });

    it('returns 401 when password is wrong', async () => {
      const realHash = await bcrypt.hash('correct-password', 1);
      const user = makeUserDocument({ passwordHash: realHash });
      const users = makeUserRepo({ findByEmail: jest.fn().mockResolvedValue(user) });
      const handler = createLoginHandler(users, makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { email: 'user@example.com', password: 'wrong-password' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res._body).toMatchObject({ error: 'Invalid credentials' });
    });

    it('does not leak whether the email exists (same error for both cases)', async () => {
      const realHash = await bcrypt.hash('correct', 1);
      const user = makeUserDocument({ passwordHash: realHash });

      const notFoundUsers = makeUserRepo({ findByEmail: jest.fn().mockResolvedValue(null) });
      const wrongPassUsers = makeUserRepo({ findByEmail: jest.fn().mockResolvedValue(user) });

      const handler1 = createLoginHandler(notFoundUsers, makeTokenRepo(), TEST_CONFIG);
      const handler2 = createLoginHandler(wrongPassUsers, makeTokenRepo(), TEST_CONFIG);

      const req1 = makeReq({ body: { email: 'ghost@example.com', password: 'anything' } });
      const req2 = makeReq({ body: { email: 'user@example.com', password: 'wrong' } });
      const res1 = makeRes();
      const res2 = makeRes();

      await handler1(req1, res1 as never);
      await handler2(req2, res2 as never);

      expect(res1._body).toEqual(res2._body);
    });
  });

  // -------------------------------------------------------------------------
  // Success
  // -------------------------------------------------------------------------

  describe('success', () => {
    async function setupSuccessfulLogin() {
      const realHash = await bcrypt.hash('password123', 1);
      const user = makeUserDocument({ passwordHash: realHash });
      const users = makeUserRepo({ findByEmail: jest.fn().mockResolvedValue(user) });
      const tokens = makeTokenRepo();
      const handler = createLoginHandler(users, tokens, TEST_CONFIG);
      const req = makeReq({ body: { email: 'user@example.com', password: 'password123' } });
      const res = makeRes();
      await handler(req, res as never);
      return { user, users, tokens, res };
    }

    it('returns 200 with accessToken and user', async () => {
      const { user, res } = await setupSuccessfulLogin();

      expect(res.status).toHaveBeenCalledWith(200);
      const body = res._body as { accessToken: string; user: { id: string } };
      expect(body.accessToken).toBeTruthy();
      expect(body.user.id).toBe(user.id);
    });

    it('calls updateLastLogin with the user id', async () => {
      const { user, users } = await setupSuccessfulLogin();
      expect(users.updateLastLogin).toHaveBeenCalledWith(user.id);
    });

    it('stores a refresh token', async () => {
      const { tokens } = await setupSuccessfulLogin();
      expect(tokens.store).toHaveBeenCalledTimes(1);
    });

    it('sets an httpOnly refreshToken cookie', async () => {
      const { res } = await setupSuccessfulLogin();
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
      );
    });

    it('does not expose passwordHash in the response', async () => {
      const { res } = await setupSuccessfulLogin();
      const body = JSON.stringify(res._body);
      expect(body).not.toContain('passwordHash');
      expect(body).not.toContain('$2b$');
    });
  });
});
