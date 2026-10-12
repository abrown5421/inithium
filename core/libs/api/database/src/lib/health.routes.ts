import { Router } from 'express';
import { isDatabaseConnected } from './database.service';

/**
 * Mounted at /api/health, for Render's health check (decision 0089): 200 `{ status: 'ok' }` while the database is
 * connected, 503 `{ status: 'unavailable' }` while it isn't, so a broken instance is taken out of service.
 */
export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const connected = isDatabaseConnected();
  res.status(connected ? 200 : 503).send({ status: connected ? 'ok' : 'unavailable', database: connected ? 'connected' : 'disconnected' });
});
