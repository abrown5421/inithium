import type { Express, Request, Response } from 'express';
import { getMongoClient } from '../db/mongo-client';

export function registerRoutes(app: Express): void {
  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Inithium API' });
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.get('/health/db', async (_req: Request, res: Response) => {
    try {
      const client = await getMongoClient();
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

