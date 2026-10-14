import { describe, expect, it, vi } from 'vitest';
import { createTestAccount, createTestApiWithAuth, signedInClient, signIn } from '@inithium/api-testing-accounts';
import { TEST_ENV, testClient } from '@inithium/api-testing';
import { UserModel } from '@inithium/api-users';
import type { UserDeletionHook } from './user-deletion.types';
import { createUsersRouter } from './user-management.routes';

const hookCalls: string[][] = [];
let failingHook = false;
const hook: UserDeletionHook = {
  key: 'test-plugin',
  label: 'test records',
  deleteUserData: async (ids) => {
    if (failingHook) throw new Error('store offline');
    hookCalls.push(ids);
  },
};

const app = createTestApiWithAuth((api) => api.use('/users', createUsersRouter({ deletionHooks: [hook] })));

describe('who sees which accounts (decision 0100)', () => {
  it('needs users.view: members are refused', async () => {
    const { client } = await signedInClient(app, 'user');
    expect((await client.get('/api/users')).status).toBe(403);
  });

  it('hides dev accounts from everyone but dev', async () => {
    await createTestAccount({ role: 'dev' });
    const { client: owner } = await signedInClient(app, 'owner');
    const listed = await owner.get('/api/users');
    expect(listed.body.users.map((user: { role: string }) => user.role)).not.toContain('dev');

    const { client: dev } = await signedInClient(app, 'dev');
    expect((await dev.get('/api/users')).body.users.map((user: { role: string }) => user.role)).toContain('dev');
  });
});

describe('creating accounts', () => {
  it('uses the temporary password, which must be changed on first sign-in', async () => {
    const { client, account } = await signedInClient(app, 'admin');
    const created = await client.post('/api/users', { email: 'new@example.com', firstName: 'New', role: 'editor' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ role: 'editor', passwordChangeRequired: true, createdBy: account.id });

    const newcomer = testClient(app);
    await signIn(newcomer, { email: 'new@example.com', password: TEST_ENV.USER_TEMP_PASSWORD });
    expect((await newcomer.get('/api/users')).body).toMatchObject({ code: 'PASSWORD_CHANGE_REQUIRED' });
  });

  it('gives roles only up to the creator’s own, and never dev', async () => {
    const { client: editor } = await signedInClient(app, 'editor');
    expect((await editor.post('/api/users', { email: 'a@example.com', firstName: 'A', role: 'editor' })).status).toBe(201);
    expect(await editor.post('/api/users', { email: 'b@example.com', firstName: 'B', role: 'admin' })).toMatchObject({ status: 403, body: { field: 'role' } });
    const { client: owner } = await signedInClient(app, 'owner');
    expect((await owner.post('/api/users', { email: 'c@example.com', firstName: 'C', role: 'dev' })).status).toBeGreaterThanOrEqual(400);
    expect(await UserModel.exists({ email: 'c@example.com' })).toBeNull();
  });

  it('refuses a taken email, naming the field', async () => {
    const existing = await createTestAccount();
    const { client } = await signedInClient(app, 'owner');
    expect(await client.post('/api/users', { email: existing.email, firstName: 'X', role: 'user' })).toMatchObject({ status: 409, body: { field: 'email' } });
  });
});

describe('changing accounts', () => {
  it('lets nobody change their own role or a more senior account', async () => {
    const { client, account } = await signedInClient(app, 'admin');
    expect((await client.patch(`/api/users/${account.id}`, { role: 'user' })).status).toBe(403);
    const owner = await createTestAccount({ role: 'owner' });
    expect((await client.patch(`/api/users/${owner.id}`, { firstName: 'Renamed' })).status).toBe(403);
  });

  it('keeps the last owner an owner', async () => {
    const { client: dev } = await signedInClient(app, 'dev');
    const owner = await createTestAccount({ role: 'owner' });
    expect(await dev.patch(`/api/users/${owner.id}`, { role: 'admin' })).toMatchObject({ status: 409, body: { field: 'role' } });
    await createTestAccount({ role: 'owner' });
    expect((await dev.patch(`/api/users/${owner.id}`, { role: 'admin' })).status).toBe(200);
  });

  it('signs an account out at once when its role changes', async () => {
    const { client: owner } = await signedInClient(app, 'owner');
    const { client: editor, account } = await signedInClient(app, 'editor');
    expect((await editor.get('/api/users')).status).toBe(200);
    await owner.patch(`/api/users/${account.id}`, { role: 'user' });
    expect((await editor.get('/api/users')).status).toBe(401);
  });

  it('resets a password to the temporary one and signs the account out', async () => {
    const { client: owner } = await signedInClient(app, 'owner');
    const { client: member, account } = await signedInClient(app, 'user');
    const reset = await owner.post(`/api/users/${account.id}/reset-password`);
    expect(reset.body.passwordChangeRequired).toBe(true);
    expect((await member.get('/api/auth/me')).status).toBe(401);
    const fresh = testClient(app);
    await signIn(fresh, { email: account.email, password: TEST_ENV.USER_TEMP_PASSWORD });
  });
});

describe('deleting accounts', () => {
  it('reports why each refused account wasn’t deleted, and deletes the rest after the hooks run', async () => {
    hookCalls.length = 0;
    const { client, account } = await signedInClient(app, 'admin');
    const owner = await createTestAccount({ role: 'owner' });
    const dev = await createTestAccount({ role: 'dev' });
    const member = await createTestAccount();

    const response = await client.post('/api/users/delete', { ids: [account.id, owner.id, dev.id, member.id] });
    expect(response.body.deleted).toEqual([member.id]);
    expect(Object.fromEntries(response.body.failed.map((f: { id: string; reason: string }) => [f.id, f.reason]))).toEqual({
      [account.id]: 'You can’t delete your own account',
      [owner.id]: 'It’s more senior than your own',
      [dev.id]: 'It doesn’t exist',
    });
    expect(hookCalls).toEqual([[member.id]]);
    expect(await UserModel.exists({ _id: member.id })).toBeNull();
  });

  it('deletes nothing when a hook fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    failingHook = true;
    const { client } = await signedInClient(app, 'owner');
    const member = await createTestAccount();
    const response = await client.post('/api/users/delete', { ids: [member.id] });
    failingHook = false;
    error.mockRestore();
    expect(response.body.deleted).toEqual([]);
    expect(response.body.failed[0].reason).toMatch(/test records couldn’t be removed/);
    expect(await UserModel.exists({ _id: member.id })).not.toBeNull();
  });

  it('keeps the last owner even in a batch', async () => {
    const { client } = await signedInClient(app, 'dev');
    const [first, second] = [await createTestAccount({ role: 'owner' }), await createTestAccount({ role: 'owner' })];
    const response = await client.post('/api/users/delete', { ids: [first.id, second.id] });
    expect(response.body.deleted).toHaveLength(1);
    expect(response.body.failed[0].reason).toBe('The site must keep at least one owner');
  });

  it('needs users.delete: editors are refused', async () => {
    const { client } = await signedInClient(app, 'editor');
    const member = await createTestAccount();
    expect((await client.post('/api/users/delete', { ids: [member.id] })).status).toBe(403);
  });
});
