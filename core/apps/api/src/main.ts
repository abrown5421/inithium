import cookieParser from 'cookie-parser';
import express from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assetsRouter, backfillFontFamilyMetrics, fontFamiliesRouter, startStorage } from '@inithium/api-assets';
import { authRouter, seedDevUser } from '@inithium/api-auth';
import { loadEnv } from '@inithium/api-config';
import { createDashboardRouter } from '@inithium/api-dashboards';
import { connectDatabase, disconnectDatabase, healthRouter } from '@inithium/api-database';
import { apiErrorHandler, apiNotFound } from '@inithium/api-http';
import { pagesRouter, seedCorePages, siteRouter } from '@inithium/api-pages';
import { profilesRouter } from '@inithium/api-profiles';
import { renderAppPage, seedSiteSettings, settingsRouter } from '@inithium/api-settings';
import { createUsersRouter } from '@inithium/api-user-management';
import { backfillUserProfiles } from '@inithium/api-users';
import { registerContentElementContracts } from '@inithium/shared-contracts';
import { registeredContentElementContracts, registeredSetupChecklistItems, registeredUserDeletionHooks } from './app/plugins.registry';

// Page content is checked against installed plugins' element contracts (decision 0116).
registerContentElementContracts(registeredContentElementContracts);

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
api.use('/dashboard', createDashboardRouter({ setupChecklistItems: registeredSetupChecklistItems }));

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

  // index.html is never sent as a static file: every page gets the theme's fonts written into it (decision 0114).
  const template = readFileSync(indexHtml, 'utf8');
  app.use(mountPath, express.static(dir, { index: false }));
  app.get(mountPath === '/' ? '/{*splat}' : `${mountPath}{/*splat}`, async (_req, res) => {
    res.set('Cache-Control', 'no-cache').type('html').send(await renderAppPage(template));
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
  await backfillFontFamilyMetrics();
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
