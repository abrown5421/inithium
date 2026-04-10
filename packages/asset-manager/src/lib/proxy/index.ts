import { Router, Request, Response } from 'express';
import { readFileStream, resolveStoragePath } from '../adapter/index.js';
import type { ProxyTarget } from '../types/index.js';

type AssetResolver = {
  byId: (id: string) => Promise<ProxyTarget | null>;
  byStorageKey: (storageKey: string) => Promise<ProxyTarget | null>;
};

const CACHE_CONTROL_PUBLIC = 'public, max-age=31536000, immutable';
const CACHE_CONTROL_PRIVATE = 'private, no-store';

const pipeAsset = (target: ProxyTarget, res: Response): void => {
  const result = readFileStream(target.absolutePath);

  if (!result.ok) {
    res.status(404).json({ error: result.error, code: result.code });
    return;
  }

  res.setHeader('Content-Type', target.mimeType);
  res.setHeader('Cache-Control', CACHE_CONTROL_PUBLIC);
  res.setHeader('X-Storage-Key', target.storageKey);

  result.data.on('error', () => {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream error', code: 'STREAM_ERROR' });
    }
  });

  result.data.pipe(res);
};

export const createProxyRouter = (resolver: AssetResolver): Router => {
  const router = Router();

  router.get('/by-id/:id', async (req: Request, res: Response) => {
    const target = await resolver.byId(req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Asset not found', code: 'NOT_FOUND' });
      return;
    }
    pipeAsset(target, res);
  });

  router.get('/by-key/:storageKey(*)', async (req: Request, res: Response) => {
    const target = await resolver.byStorageKey(req.params.storageKey);
    if (!target) {
      res.status(404).json({ error: 'Asset not found', code: 'NOT_FOUND' });
      return;
    }
    pipeAsset(target, res);
  });

  return router;
};
