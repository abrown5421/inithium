import { createRegisterHandler } from './register.handler.js';
import { makeUserRepo, makeTokenRepo, makeReq, makeRes, TEST_CONFIG, makeUserDocument } from './mocks.js';

describe('createRegisterHandler', () => {
  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  describe('validation', () => {
    it('returns 400 when email is missing', async () => {
      const handler = createRegisterHandler(makeUserRepo(), makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { password: 'password123' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res._body).toMatchObject({ error: 'Validation failed' });
    });

    it('returns 400 when email is malformed', async () => {
      const handler = createRegisterHandler(makeUserRepo(), makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { email: 'not-an-email', password: 'password123' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when password is too short', async () => {
      const handler = createRegisterHandler(makeUserRepo(), makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { email: 'user@example.com', password: 'short' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(400);
      expect((res._body as { details: string[] }).details).toEqual(
        expect.arrayContaining(['password must be at least 8 characters']),
      );
    });

    it('returns 400 with all validation errors when both fields are invalid', async () => {
      const handler = createRegisterHandler(makeUserRepo(), makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: {} });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(400);
      expect((res._body as { details: string[] }).details).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Conflict
  // -------------------------------------------------------------------------

  describe('email conflict', () => {
    it('returns 409 when email is already registered', async () => {
      const users = makeUserRepo({
        findByEmail: jest.fn().mockResolvedValue(makeUserDocument()),
      });
      const handler = createRegisterHandler(users, makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { email: 'user@example.com', password: 'password123' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res._body).toMatchObject({ error: 'Email already in use' });
    });
  });

  // -------------------------------------------------------------------------
  // Success
  // -------------------------------------------------------------------------

  describe('success', () => {
    it('returns 201 with accessToken and user on valid registration', async () => {
      const user = makeUserDocument({ email: 'new@example.com' });
      const users = makeUserRepo({
        findByEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(user),
      });
      const handler = createRegisterHandler(users, makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { email: 'new@example.com', password: 'password123' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.status).toHaveBeenCalledWith(201);
      const body = res._body as { accessToken: string; user: { id: string; email: string } };
      expect(body.accessToken).toBeTruthy();
      expect(body.user.id).toBe(user.id);
      expect(body.user.email).toBe(user.email);
    });

    it('stores a refresh token on success', async () => {
      const tokens = makeTokenRepo();
      const handler = createRegisterHandler(makeUserRepo(), tokens, TEST_CONFIG);
      const req = makeReq({ body: { email: 'new@example.com', password: 'password123' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(tokens.store).toHaveBeenCalledTimes(1);
      const stored = tokens.store.mock.calls[0][0];
      expect(stored.isRevoked).toBe(false);
      expect(stored.userId).toBe(makeUserDocument().id);
    });

    it('sets an httpOnly refreshToken cookie on success', async () => {
      const handler = createRegisterHandler(makeUserRepo(), makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { email: 'new@example.com', password: 'password123' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('calls users.create with the correct email and a hashed password', async () => {
      const users = makeUserRepo();
      const handler = createRegisterHandler(users, makeTokenRepo(), TEST_CONFIG);
      const req = makeReq({ body: { email: 'new@example.com', password: 'plaintext123' } });
      const res = makeRes();

      await handler(req, res as never);

      expect(users.create).toHaveBeenCalledTimes(1);
      const [calledEmail, calledHash] = users.create.mock.calls[0];
      expect(calledEmail).toBe('new@example.com');
      // Must not store the plain password
      expect(calledHash).not.toBe('plaintext123');
      expect(calledHash).toMatch(/^\$2b\$/); // bcrypt prefix
    });
  });
});
