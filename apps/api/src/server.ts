import express, { type Express, type Request, type Response } from 'express';
import { registerRoutes } from './routes';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  registerRoutes(app);

  // Fallback 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

