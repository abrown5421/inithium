import { describe, expect, it } from 'vitest';
import { createTestApi } from './test-api.service';
import { testClient } from './test-client.service';

const app = createTestApi((api) => {
  api.post('/set', (req, res) => void res.cookie('flavour', req.body.flavour, { httpOnly: true, path: '/api' }).send({ ok: true }));
  api.get('/read', (req, res) => void res.send({ flavour: req.cookies.flavour ?? null }));
  api.post('/clear', (_req, res) => void res.clearCookie('flavour', { path: '/api' }).status(204).end());
  api.get('/fail', () => {
    throw Object.assign(new Error('Nope'), { status: 409, field: 'name' });
  });
});

describe('TestClient', () => {
  it('keeps the cookies the api sets and forgets the ones it clears', async () => {
    const client = testClient(app);
    await client.post('/api/set', { flavour: 'mint choc' });
    expect((await client.get('/api/read')).body).toEqual({ flavour: 'mint choc' });
    expect((await client.post('/api/clear')).status).toBe(204);
    expect(client.cookie('flavour')).toBeUndefined();
    expect((await client.get('/api/read')).body).toEqual({ flavour: null });
  });

  it('keeps each client’s cookies to itself', async () => {
    const [one, two] = [testClient(app), testClient(app)];
    await one.post('/api/set', { flavour: 'lemon' });
    expect((await two.get('/api/read')).body).toEqual({ flavour: null });
  });
});

describe('createTestApi', () => {
  it('uses the api’s own 404 and error handling', async () => {
    const client = testClient(app);
    expect(await client.get('/api/missing')).toMatchObject({ status: 404, body: { message: 'Not found' } });
    expect(await client.get('/api/fail')).toMatchObject({ status: 409, body: { message: 'Nope', field: 'name' } });
  });
});
