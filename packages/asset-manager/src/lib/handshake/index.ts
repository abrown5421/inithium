import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { validate } from '@inithium/validators';
import { assetManagerValidators } from '@inithium/validators';
import { PRESIGNED_PATH_PREFIX, TOKEN_TTL_MS, resolveCategory } from '../config/index.js';
import { registerToken, consumeToken } from './token-store.js';
import { writeFileStream } from '../adapter/index.js';
import type { UploadIntent, UploadToken } from '../types/index.js';

type AssetsFinalizer = (params: {
  uploadId:     string;
  storageKey:   string;
  mimeType:     string;
  originalName: string;
  sizeBytes:    number;
}) => Promise<void>;

const buildStorageKey = (uploadId: string, originalName: string): string => {
  const ext = originalName.includes('.')
    ? '.' + originalName.split('.').pop()
    : '';
  return `${uploadId}${ext}`;
};

export const createHandshakeRouter = (finalizeAsset: AssetsFinalizer): Router => {
  const router = Router();

  router.post(
    '/intent',
    validate(assetManagerValidators.uploadIntent),
    (req: Request, res: Response) => {
      const { mimeType, originalName } = req.body as {
        mimeType:     string;
        originalName: string;
      };

      const uploadId     = randomUUID();
      const storageKey   = buildStorageKey(uploadId, originalName);
      const expiresAt    = Date.now() + TOKEN_TTL_MS;
      const presignedPath = `${PRESIGNED_PATH_PREFIX}/${uploadId}`;

      const token: UploadToken = {
        uploadId,
        storageKey,
        mimeType,
        originalName,
        expiresAt,
      };

      registerToken(token);

      const intent: UploadIntent = {
        uploadId,
        storageKey,
        presignedPath,
        expiresAt,
      };

      res.status(201).json(intent);
    }
  );

  router.put(
    `${PRESIGNED_PATH_PREFIX}/:uploadId`,
    validate(assetManagerValidators.presignedUpload),
    async (req: Request, res: Response, next: NextFunction) => {
      const { uploadId } = req.params;
      const token = consumeToken(uploadId);

      if (!token) {
        res.status(410).json({ error: 'Upload token expired or invalid' });
        return;
      }

      const result = await writeFileStream(req, token.storageKey, token.mimeType);

      if (!result.ok) {
        res.status(500).json({ error: result.error, code: result.code });
        return;
      }

      try {
        await finalizeAsset({
          uploadId:     token.uploadId,
          storageKey:   token.storageKey,
          mimeType:     token.mimeType,
          originalName: token.originalName,
          sizeBytes:    result.data.sizeBytes,
        });
      } catch (err) {
        next(err);
        return;
      }

      res.status(200).json({
        storageKey:   token.storageKey,
        category:     resolveCategory(token.mimeType),
        sizeBytes:    result.data.sizeBytes,
        originalName: token.originalName,
      });
    }
  );

  return router;
};
