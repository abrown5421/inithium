import mongoose from 'mongoose';
import { describe, expect, it, vi } from 'vitest';
import { createTestApi, testClient } from '@inithium/api-testing';
import { healthRouter } from './health.routes';

const app = createTestApi((api) => api.use('/health', healthRouter));

describe('GET /api/health (decision 0089)', () => {
  it('is 200 while the database is connected', async () => {
    const response = await testClient(app).get('/api/health');
    expect(response).toMatchObject({ status: 200, body: { status: 'ok', database: 'connected' } });
  });

  it('is 503 while it isn’t, so Render takes the instance out of service', async () => {
    const state = vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(mongoose.ConnectionStates.disconnected);
    const response = await testClient(app).get('/api/health');
    state.mockRestore();
    expect(response).toMatchObject({ status: 503, body: { status: 'unavailable', database: 'disconnected' } });
  });
});
