import { Router, type IRouter } from 'express';
import { getDbStatus } from '../db/connection';
import type { HealthResponse } from '@inithium/shared';
import { HEALTH_ROUTE } from '@inithium/shared';

const router: IRouter = Router();

router.get(HEALTH_ROUTE, (_req, res) => {
  const dbStatus = getDbStatus();

  const body: HealthResponse = {
    status: dbStatus === 'connected' ? 'ok' : 'error',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  };

  res.status(dbStatus === 'connected' ? 200 : 503).json(body);
});

export { router as healthRouter, HEALTH_ROUTE };
