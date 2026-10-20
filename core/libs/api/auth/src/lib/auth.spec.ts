import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestApi, testClient, type TestClient } from '@inithium/api-testing';
import { createUser, UserModel } from '@inithium/api-users';
import type { Role } from '@inithium/shared-contracts';
import { getAuth, readAuth, requireAuth, requirePermission } from './auth.middleware';
import { authRouter } from './auth.routes';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './cookies.service';
import { hashPassword, verifyPassword } from './passwords.service';
import { RefreshTokenModel } from './refresh-tokens.model';
import { revokeSessions } from './sessions.service';
import { signAccessToken, verifyAccessToken } from './tokens.service';
import { seedDevUser } from './users.seed';

// This lib sits below @inithium/api-testing-accounts, so its tests create accounts themselves.
const PASSWORD = 'Test-password-1!';
let passwordHash: string;
beforeEach(async () => {
  passwordHash ??= await hashPassword(PASSWORD);
});

const account = (email: string, role: Role = 'user', extra: { passwordChangeRequired?: boolean } = {}) =>
  createUser({ email, passwordHash, role, ...extra });

const app = createTestApi((api) => {
  api.use('/auth', authRouter);
  api.get('/whoami', requireAuth, (_req, res) => void res.send(getAuth(res)));
  api.get('/maybe', (req, res) => void res.send({ sub: readAuth(req)?.sub ?? null }));
  api.get('/publish', ...requirePermission('pages.publish'), (_req, res) => void res.send({ ok: true }));
});

const signIn = async (client: TestClient, email: string, password = PASSWORD) => client.post('/api/auth/login', { email, password });

describe('passwords', () => {
  it('verify only the password they were hashed from', async () => {
    const hash = await hashPassword('Secret-password-1!');
    expect(hash).toMatch(/^scrypt\$65536\$8\$1\$/);
    expect(await verifyPassword('Secret-password-1!', hash)).toBe(true);
    expect(await verifyPassword('secret-password-1!', hash)).toBe(false);
    expect(await verifyPassword('anything', 'bcrypt$whatever')).toBe(false);
  });

  it('are salted, so the same password hashes differently each time', async () => {
    expect(await hashPassword('Same-password-1!')).not.toBe(await hashPassword('Same-password-1!'));
  });
});

describe('access tokens', () => {
  it('carry the id, role and the password-change flag', () => {
    const payload = verifyAccessToken(signAccessToken({ id: 'abc', role: 'editor', passwordChangeRequired: true }));
    expect(payload).toMatchObject({ sub: 'abc', role: 'editor', pcr: true });
    expect(verifyAccessToken(signAccessToken({ id: 'abc', role: 'editor' }))).not.toHaveProperty('pcr');
  });

  it('are refused when tampered with or signed with another secret', () => {
    const token = signAccessToken({ id: 'abc', role: 'user' });
    const [header, , signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ sub: 'abc', role: 'dev' })).toString('base64url');
    expect(verifyAccessToken(`${header}.${forged}.${signature}`)).toBeNull();
    expect(verifyAccessToken('not-a-token')).toBeNull();
  });
});

describe('seedDevUser (decision 0023)', () => {
  const credentials = { email: 'dev@example.com', password: 'Dev-password-1!' };

  it('creates the dev account once, needing a password change', async () => {
    await seedDevUser(credentials);
    await seedDevUser(credentials);
    const devs = await UserModel.find({ role: 'dev' });
    expect(devs).toHaveLength(1);
    expect(devs[0]?.passwordChangeRequired).toBe(true);
  });

  it('never modifies an existing dev account', async () => {
    await seedDevUser(credentials);
    const before = await UserModel.findOne({ role: 'dev' }).select('+passwordHash').lean();
    await seedDevUser({ ...credentials, password: 'Other-password-1!' });
    expect(await UserModel.findOne({ role: 'dev' }).select('+passwordHash').lean()).toEqual(before);
  });

  it('never promotes an existing account to dev', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await account('dev@example.com', 'editor');
    await seedDevUser(credentials);
    warn.mockRestore();
    expect(await UserModel.exists({ role: 'dev' })).toBeNull();
    expect((await UserModel.findOne({ email: 'dev@example.com' }))?.role).toBe('editor');
  });
});

describe('POST /api/auth/login', () => {
  it('signs in with httpOnly cookies and returns the user without its hash', async () => {
    await account('ada@example.com');
    const client = testClient(app);
    const response = await signIn(client, 'ADA@example.com');
    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ email: 'ada@example.com', role: 'user' });
    expect(JSON.stringify(response.body)).not.toContain('scrypt');
    const cookies = response.headers.getSetCookie().join('\n');
    expect(cookies).toMatch(new RegExp(`${ACCESS_COOKIE}=.*HttpOnly.*SameSite=Strict`, 'i'));
    expect(cookies).toMatch(new RegExp(`${REFRESH_COOKIE}=.*Path=/api/auth`, 'i'));
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    await account('ada@example.com');
    const wrong = await signIn(testClient(app), 'ada@example.com', 'Wrong-password-1!');
    const unknown = await signIn(testClient(app), 'nobody@example.com');
    expect(wrong).toMatchObject({ status: 401, body: { message: 'Incorrect email or password' } });
    expect(unknown).toMatchObject({ status: 401, body: { message: 'Incorrect email or password' } });
  });
});

describe('POST /api/auth/register (decision 0083)', () => {
  it('creates a user-role account and signs it in', async () => {
    const client = testClient(app);
    const response = await client.post('/api/auth/register', { firstName: 'Ada', email: 'ada@example.com', password: PASSWORD });
    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({ role: 'user', profile: { firstName: 'Ada' } });
    expect((await client.get('/api/auth/me')).status).toBe(200);
  });

  it('refuses a taken email, naming the field, and weak passwords', async () => {
    await account('ada@example.com');
    expect(await testClient(app).post('/api/auth/register', { firstName: 'A', email: 'ada@example.com', password: PASSWORD })).toMatchObject({
      status: 409,
      body: { field: 'email' },
    });
    expect((await testClient(app).post('/api/auth/register', { firstName: 'A', email: 'b@example.com', password: 'weak' })).status).toBe(400);
  });

  it('saves the visitor’s colour scheme as the account’s, and defaults to system (decision 0119)', async () => {
    const dark = await testClient(app).post('/api/auth/register', { firstName: 'A', email: 'd@example.com', password: PASSWORD, colorScheme: 'dark' });
    expect(dark.body.user.preferences).toEqual({ colorScheme: 'dark' });
    const plain = await testClient(app).post('/api/auth/register', { firstName: 'A', email: 'e@example.com', password: PASSWORD });
    expect(plain.body.user.preferences).toEqual({ colorScheme: 'system' });
  });

  it('can never be used to choose a role', async () => {
    const response = await testClient(app).post('/api/auth/register', { firstName: 'A', email: 'c@example.com', password: PASSWORD, role: 'owner' });
    expect(response.status).toBe(400);
    expect(await UserModel.exists({ email: 'c@example.com' })).toBeNull();
  });
});

describe('sessions', () => {
  it('refresh rotates the refresh token', async () => {
    await account('ada@example.com');
    const client = testClient(app);
    await signIn(client, 'ada@example.com');
    const first = client.cookie(REFRESH_COOKIE);
    expect((await client.post('/api/auth/refresh')).status).toBe(200);
    expect(client.cookie(REFRESH_COOKIE)).not.toBe(first);
  });

  it('treats a rotated token replayed after the grace window as theft and revokes every session', async () => {
    await account('ada@example.com');
    const client = testClient(app);
    await signIn(client, 'ada@example.com');
    const stolen = client.cookie(REFRESH_COOKIE) ?? '';
    await client.post('/api/auth/refresh');
    // Age the rotation past the 10-second grace window.
    await RefreshTokenModel.updateMany({ revokedAt: { $ne: null } }, { revokedAt: new Date(Date.now() - 60_000) });

    const thief = testClient(app);
    thief.setCookie(REFRESH_COOKIE, stolen);
    expect((await thief.post('/api/auth/refresh')).status).toBe(401);
    expect((await client.post('/api/auth/refresh')).status).toBe(401);
  });

  it('logout revokes the refresh token and clears the cookies', async () => {
    await account('ada@example.com');
    const client = testClient(app);
    await signIn(client, 'ada@example.com');
    const token = client.cookie(REFRESH_COOKIE) ?? '';
    expect((await client.post('/api/auth/logout')).status).toBe(204);
    expect(client.cookie(ACCESS_COOKIE)).toBeUndefined();
    client.setCookie(REFRESH_COOKIE, token);
    expect((await client.post('/api/auth/refresh')).status).toBe(401);
  });

  it('revokeSessions refuses current access tokens at once (decision 0100)', async () => {
    const user = await account('ada@example.com');
    const client = testClient(app);
    await signIn(client, 'ada@example.com');
    expect((await client.get('/api/whoami')).status).toBe(200);
    await revokeSessions(user._id.toString());
    expect((await client.get('/api/whoami')).status).toBe(401);
    expect(await client.get('/api/maybe')).toMatchObject({ body: { sub: null } });
    expect((await client.post('/api/auth/refresh')).status).toBe(401);
  });
});

describe('temporary passwords (decision 0088)', () => {
  it('allow only /me and change-password until the password is changed', async () => {
    await account('temp@example.com', 'editor', { passwordChangeRequired: true });
    const client = testClient(app);
    await signIn(client, 'temp@example.com');
    expect(await client.get('/api/whoami')).toMatchObject({ status: 403, body: { code: 'PASSWORD_CHANGE_REQUIRED' } });
    expect((await client.get('/api/auth/me')).body.user.passwordChangeRequired).toBe(true);

    const changed = await client.post('/api/auth/change-password', { currentPassword: PASSWORD, newPassword: 'Brand-new-password-2!' });
    expect(changed.status).toBe(200);
    expect(changed.body.user.passwordChangeRequired).toBe(false);
    expect((await client.get('/api/whoami')).status).toBe(200);
  });

  it('change-password checks the current password, the policy, and that it changes', async () => {
    await account('ada@example.com');
    const client = testClient(app);
    await signIn(client, 'ada@example.com');
    expect(await client.post('/api/auth/change-password', { currentPassword: 'Wrong-password-1!', newPassword: 'Brand-new-password-2!' })).toMatchObject({
      status: 400,
      body: { field: 'currentPassword' },
    });
    expect(await client.post('/api/auth/change-password', { currentPassword: PASSWORD, newPassword: PASSWORD })).toMatchObject({
      status: 400,
      body: { field: 'newPassword' },
    });
    expect((await client.post('/api/auth/change-password', { currentPassword: PASSWORD, newPassword: 'weak' })).status).toBe(400);
  });

  it('changing the password signs out every other session', async () => {
    await account('ada@example.com');
    const [laptop, phone] = [testClient(app), testClient(app)];
    await signIn(laptop, 'ada@example.com');
    await signIn(phone, 'ada@example.com');
    await laptop.post('/api/auth/change-password', { currentPassword: PASSWORD, newPassword: 'Brand-new-password-2!' });
    expect((await phone.post('/api/auth/refresh')).status).toBe(401);
    expect((await laptop.post('/api/auth/refresh')).status).toBe(200);
  });
});

describe('requirePermission', () => {
  it('is 401 signed out and 403 without the permission', async () => {
    await account('editor@example.com', 'editor');
    await account('admin@example.com', 'admin');
    expect((await testClient(app).get('/api/publish')).status).toBe(401);
    const editor = testClient(app);
    await signIn(editor, 'editor@example.com');
    expect((await editor.get('/api/publish')).status).toBe(403);
    const admin = testClient(app);
    await signIn(admin, 'admin@example.com');
    expect((await admin.get('/api/publish')).status).toBe(200);
  });
});
