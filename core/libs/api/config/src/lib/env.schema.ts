import { z } from 'zod';

const missingUri =
  'MONGODB_URI is required. Copy core/.env.example to core/.env and paste your MongoDB connection string.';

const generateSecret = `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`;
const weakSecret = `JWT_ACCESS_SECRET must be at least 32 characters. Generate one with: ${generateSecret}`;

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
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

  // Auth: access tokens are JWTs signed with this secret; refresh tokens are random and stored hashed.
  JWT_ACCESS_SECRET: z.string({ error: weakSecret }).min(32, { error: weakSecret }),
  JWT_ACCESS_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  // The dev account created on startup when no dev user exists.
  SEED_DEV_EMAIL: z
    .string({ error: 'SEED_DEV_EMAIL is required: the email of the dev account created on first startup.' })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: 'SEED_DEV_EMAIL must be a valid email address' })),
  SEED_DEV_PASSWORD: z
    .string({ error: "SEED_DEV_PASSWORD is required: the dev account's temporary password." })
    .min(1, { error: "SEED_DEV_PASSWORD is required: the dev account's temporary password." }),
});
