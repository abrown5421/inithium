import cookieParser from 'cookie-parser';
import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { authRouter, seedDevUser } from '@inithium/api-auth';
import { loadEnv } from '@inithium/api-config';
import { connectDatabase, disconnectDatabase } from '@inithium/api-database';
import { pagesRouter, seedCorePages, siteRouter } from '@inithium/api-pages';
import { seedSiteSettings, settingsRouter } from '@inithium/api-settings';

const app = express();

// Render sits behind one proxy hop; this makes req.ip the client's address (used by login rate limiting).
app.set('trust proxy', 1);

// Every API route lives under /api.
const api = express.Router();
api.use(express.json(), cookieParser());

api.get('/', (_req, res) => {
  res.send({ message: 'Hello API' });
});
api.use('/auth', authRouter);
api.use('/site', siteRouter);
api.use('/pages', pagesRouter);
api.use('/settings', settingsRouter);

app.use('/api', api);
app.use('/api', (_req, res) => {
  res.status(404).send({ message: 'Not found' });
});
app.use('/api', (error: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = error.status && error.status < 500 ? error.status : 500;
  if (status === 500) console.error('[ error ]', error);
  res.status(status).send({ message: status === 500 ? 'Something went wrong' : error.message });
});

// When the frontends have been built, serve them from this same origin:
// cms at /cms and web at /. The api is always started from the workspace root.
const distApps = join(process.cwd(), 'dist', 'apps');
serveSpa('/cms', join(distApps, 'cms'));
serveSpa('/', join(distApps, 'web'));

function serveSpa(mountPath: string, dir: string) {
  const indexHtml = join(dir, 'index.html');
  if (!existsSync(indexHtml)) return;

  app.use(mountPath, express.static(dir));
  app.get(mountPath === '/' ? '/{*splat}' : `${mountPath}{/*splat}`, (_req, res) => {
    res.sendFile(indexHtml);
  });
}

async function start() {
  const env = loadEnv();
  await connectDatabase(env.MONGODB_URI);
  await seedDevUser({ email: env.SEED_DEV_EMAIL, password: env.SEED_DEV_PASSWORD });
  await seedSiteSettings();
  await seedCorePages();

  const server = app.listen(env.PORT, env.HOST, () => {
    console.log(`[ ready ] http://${env.HOST}:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[ shutdown ] ${signal} received`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error: Error) => {
  console.error(`[ startup failed ] ${error.message}`);
  process.exit(1);
});
