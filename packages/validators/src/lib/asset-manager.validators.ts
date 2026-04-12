import { z } from 'zod';
import { mongoIdSchema } from './primitives.js';

const MIME_TYPE_RE = /^[a-z]+\/[a-z0-9][a-z0-9!#$&\-^_.+]*$/i;

export const assetManagerValidators = {
  uploadIntent: z.object({
    body: z.object({
      mimeType:     z.string().regex(MIME_TYPE_RE, 'Must be a valid MIME type'),
      originalName: z.string().min(1),
    }),
  }),

  presignedUpload: z.object({
    params: z.object({
      uploadId: z.string().uuid('uploadId must be a UUID'),
    }),
  }),

  proxyById: z.object({
    params: z.object({ id: mongoIdSchema }),
  }),

  proxyByKey: z.object({
    params: z.object({
      storageKey: z.string().min(1),
    }),
  }),
};
