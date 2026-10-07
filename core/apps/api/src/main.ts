import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv } from '@inithium/api-config';
import { connectDatabase, disconnectDatabase } from '@inithium/api-database';

const app = express();

// Every API route lives under /api.
const api = express.Router();

api.get('/', (_req, res) => {
  res.send({ message: 'Hello API' });
});

app.use('/api', api);
app.use('/api', (_req, res) => {
  res.status(404).send({ message: 'Not found' });
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
