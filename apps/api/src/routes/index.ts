import type { Express, Request, Response } from 'express';
import { createAuthRouter } from '@inithium/auth';
import { getMongoClient } from '../db/mongo-client';
import { getConfig } from '../config/env';

export async function registerRoutes(app: Express): Promise<void> {
  const client = await getMongoClient();
  const config = getConfig();

  app.use('/auth', createAuthRouter({ client, config }));

  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Inithium API' });
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.get('/health/db', async (_req: Request, res: Response) => {
    try {
      await client.db().command({ ping: 1 });

      res.json({ status: 'ok' });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
      });
    }
  });
}

