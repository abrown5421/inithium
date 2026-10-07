import { z } from 'zod';

const missingUri =
  'MONGODB_URI is required. Copy core/.env.example to core/.env and paste your MongoDB connection string.';

export const envSchema = z.object({
  HOST: z.string().min(1).default('localhost'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z
    .string({ error: missingUri })
    .min(1, { error: missingUri, abort: true })
    .regex(/^mongodb(\+srv)?:\/\//, {
      error: 'MONGODB_URI must start with mongodb:// or mongodb+srv://',
      abort: true,
    })
    // Without a database name Mongoose silently falls back to a database called "test".
    .regex(/^mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/, {
      error: 'MONGODB_URI must include a database name, e.g. mongodb+srv://user:pass@cluster.mongodb.net/inithium',
    }),
});
