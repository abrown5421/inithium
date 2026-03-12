import express, { type Express } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';

export function createApp(): Express {
  const app = express();

  app.use(
    cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }),
  );
  app.use(express.json());
  app.use(healthRouter);

  return app;
}
