import cookieParser from 'cookie-parser';
import express, { Router, type Express } from 'express';
import { apiErrorHandler, apiNotFound } from '@inithium/api-http';

/**
 * An Express app shaped like the api's own (apps/api/src/main.ts): JSON bodies up to 1 MB, cookies, your routers under
 * `/api`, then the JSON 404 and the real error handler. Mount only what the test needs.
 *
 * ```ts
 * const app = createTestApi((api) => api.use('/settings', settingsRouter));
 * ```
 */
export function createTestApi(mount: (api: Router) => void): Express {
  const app = express();
  const api = Router();
  api.use(express.json({ limit: '1mb' }), cookieParser());
  mount(api);
  app.use('/api', api);
  app.use('/api', apiNotFound);
  app.use('/api', apiErrorHandler);
  return app;
}
