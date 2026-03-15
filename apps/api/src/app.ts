import express, { type Express } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { userRouter } from './collections/users/user.routes.js';
import { errorHandler, notFoundHandler } from './errors/index.js';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json());

  app.use(healthRouter);
  app.use(authRouter);
  app.use('/api/users', userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
