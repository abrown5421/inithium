import { describe, expect, it } from 'vitest';
import { testClient } from '@inithium/api-testing';
import { createTestAccount, createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import { richTextFromPlainText } from '@inithium/shared-contracts';
import { profilesRouter } from './profiles.routes';

const app = createTestApiWithAuth((api) => api.use('/profiles', profilesRouter));

describe('GET /api/profiles/:id (decision 0090)', () => {
  it('is public, but shows the email only to its owner', async () => {
    const { client, account } = await signedInClient(app);
    expect((await testClient(app).get(`/api/profiles/${account.id}`)).body).not.toHaveProperty('email');
    const other = await signedInClient(app);
    expect((await other.client.get(`/api/profiles/${account.id}`)).body).not.toHaveProperty('email');
    expect((await client.get(`/api/profiles/${account.id}`)).body.email).toBe(account.email);
  });

  it('is a 404 for unknown and malformed ids', async () => {
    expect((await testClient(app).get('/api/profiles/64b0c0ffee64b0c0ffee64b0')).status).toBe(404);
    expect((await testClient(app).get('/api/profiles/not-an-id')).status).toBe(404);
  });
});

describe('PATCH /api/profiles/me', () => {
  it('changes only the signed-in user’s own profile', async () => {
    const { client, account } = await signedInClient(app);
    const response = await client.patch('/api/profiles/me', { firstName: 'Ada', bio: richTextFromPlainText('Hello') });
    expect(response.body).toMatchObject({ id: account.id, firstName: 'Ada', bio: richTextFromPlainText('Hello') });
    expect((await testClient(app).patch('/api/profiles/me', { firstName: 'Nobody' })).status).toBe(401);
  });

  it('holds the bio to its contract (decision 0102)', async () => {
    const { client } = await signedInClient(app);
    expect((await client.patch('/api/profiles/me', { bio: richTextFromPlainText('x'.repeat(281)) })).status).toBe(400);
    const heading = { type: 'doc', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Big' }] }] };
    expect((await client.patch('/api/profiles/me', { bio: heading })).status).toBe(400);
  });

  it('refuses a picture that isn’t the member’s own upload', async () => {
    const { client } = await signedInClient(app);
    await createTestAccount();
    expect((await client.patch('/api/profiles/me', { avatarAssetId: '64b0c0ffee64b0c0ffee64b0' })).status).toBeGreaterThanOrEqual(400);
  });
});
