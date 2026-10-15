import cookieParser from 'cookie-parser';
import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { assetsRouter, fontFamiliesRouter, startStorage } from '@inithium/api-assets';
import { authRouter, seedDevUser } from '@inithium/api-auth';
import { loadEnv } from '@inithium/api-config';
import { connectDatabase, disconnectDatabase, healthRouter } from '@inithium/api-database';
import { apiErrorHandler, apiNotFound } from '@inithium/api-http';
import { pagesRouter, seedCorePages, siteRouter } from '@inithium/api-pages';
import { profilesRouter } from '@inithium/api-profiles';
import { seedSiteSettings, settingsRouter } from '@inithium/api-settings';
import { createUsersRouter } from '@inithium/api-user-management';
import { backfillUserProfiles } from '@inithium/api-users';
import { registeredUserDeletionHooks } from './app/plugins.registry';

const app = express();

// Render sits behind one proxy hop; this makes req.ip the client's address (used by login rate limiting).
app.set('trust proxy', 1);

// Every API route lives under /api.
const api = express.Router();
// Content pages' drafts are saved whole, so bodies may be larger than express's 100 KB default.
api.use(express.json({ limit: '1mb' }), cookieParser());

api.get('/', (_req, res) => {
  res.send({ message: 'Hello API' });
});
api.use('/health', healthRouter);
api.use('/auth', authRouter);
api.use('/assets', assetsRouter);
api.use('/fonts', fontFamiliesRouter);
api.use('/site', siteRouter);
api.use('/pages', pagesRouter);
api.use('/profiles', profilesRouter);
api.use('/settings', settingsRouter);
api.use('/users', createUsersRouter({ deletionHooks: registeredUserDeletionHooks }));

app.use('/api', api);
app.use('/api', apiNotFound);
app.use('/api', apiErrorHandler);

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
  // Picks where uploads go and, for R2, checks the bucket can be reached, failing fast if not (decision 0098).
  const storage = await startStorage();
  console.log(`[ storage ] ${storage.name}${storage.publicUrl ? ', files sent from the bucket’s public address' : ''}`);
  await connectDatabase(env.MONGODB_URI);
  await seedDevUser({ email: env.SEED_DEV_EMAIL, password: env.SEED_DEV_PASSWORD });
  await backfillUserProfiles();
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
