import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB, errorMiddleware } from '@inithium/api-core';
import {
  assetsRouter,
  usersRouter,
  authRouter,
  assetsService,
} from '@inithium/api-collections';
import { createAssetManager } from '@inithium/asset-manager';
import { seedIfEmpty } from './seed-guard.js';

interface AppConfig {
  readonly host: string;
  readonly port: number;
  readonly mongoUri: string;
}

const getConfiguration = (): AppConfig => ({
  host:     process.env.HOST     ?? 'localhost',
  port:     process.env.PORT     ? Number(process.env.PORT) : 3000,
  mongoUri: process.env.MONGO_URI ?? '',
});

const initializeRoutes =
  (routers: Record<string, express.Router>) =>
  (app: express.Express): express.Express => {
    Object.entries(routers).forEach(([path, router]) => app.use(path, router));
    return app;
  };

const bootstrap = async (): Promise<void> => {
  const config = getConfiguration();

  const { handshakeRouter, proxyRouter } = await createAssetManager({
    assetsService,
  });

  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  }));

  app.use(express.json());
  app.use(cookieParser());

  initializeRoutes({
    '/proxy':  proxyRouter,
    '/auth':   authRouter,
    '/users':  usersRouter,
    '/assets': assetsRouter,
    '/asset':  handshakeRouter,
  })(app);

  app.use(errorMiddleware);

  await connectDB(config.mongoUri);
  await seedIfEmpty();

  app.listen(config.port, config.host, () => {
    console.log(`[ ready ] http://${config.host}:${config.port}`);
  });
};

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});