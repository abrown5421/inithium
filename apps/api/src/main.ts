import 'dotenv/config';
import express from 'express';
import { connectDB } from '@inithium/api-core';
import { assetsRouter, usersRouter, assetsService } from '@inithium/api-collections';
import { createAssetManager } from '@inithium/asset-manager';

interface AppConfig {
  readonly host: string;
  readonly port: number;
  readonly mongoUri: string;
}

const getConfiguration = (): AppConfig => ({
  host: process.env.HOST ?? 'localhost',
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  mongoUri: process.env.MONGO_URI ?? '',
});

const initializeRoutes =
  (routers: Record<string, express.Router>) => (app: express.Express) => {
    Object.entries(routers).forEach(([path, router]) => app.use(path, router));
    return app;
  };

const bootstrap = async (): Promise<void> => {
  const config = getConfiguration();

  const { handshakeRouter, proxyRouter } = await createAssetManager({
    assetsService,
  });

  const app = express();
  app.use(express.json());

  initializeRoutes({
    '/proxy': proxyRouter,
    '/users': usersRouter,
    '/assets': assetsRouter,
    '/asset': handshakeRouter,
  })(app);

  await connectDB(config.mongoUri);

  app.listen(config.port, config.host, () => {
    console.log(`[ ready ] http://${config.host}:${config.port}`);
  });
};

bootstrap().catch((err) => {
  console.error('Fatal Error during bootstrap:', err);
  process.exit(1);
});
