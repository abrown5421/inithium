import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

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

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
