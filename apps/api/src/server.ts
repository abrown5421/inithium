import express, { type Express, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import { registerRoutes } from './routes';

export function createApp(): Express {
  const app = express();

  app.use(cookieParser());
  app.use(express.json());

  void registerRoutes(app);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

