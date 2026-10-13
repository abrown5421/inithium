import { z } from 'zod';
import { newPasswordSchema } from '@inithium/shared-contracts';

const missingUri =
  'MONGODB_URI is required. Copy core/.env.example to core/.env and paste your MongoDB connection string.';

const generateSecret = `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`;
const weakSecret = `JWT_ACCESS_SECRET must be at least 32 characters. Generate one with: ${generateSecret}`;

// Optional settings left empty (e.g. `R2_PUBLIC_URL=`) count as unset.
const optional = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

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
  // The temporary password of accounts created in the CMS and of password resets (decision 0100); they must change it
  // on first sign-in. It must meet the password policy. Without it, creating accounts and resetting passwords are off.
  USER_TEMP_PASSWORD: optional(newPasswordSchema),

  // Where uploaded files live (decision 0098): the site's own database, or Cloudflare R2 for staff only or for everyone.
  STORAGE_MODE: z
    .enum(['database', 'cloud-staff', 'cloud-all'], { error: 'STORAGE_MODE must be database, cloud-staff or cloud-all' })
    .default('database'),
  // The database driver's total cap for uploaded files, in MB; it shares the database with everything else.
  STORAGE_DATABASE_QUOTA_MB: z.coerce.number().int().positive().default(250),

  // Cloudflare R2, for the cloud storage modes: the account, an API token's S3 keys and the bucket.
  R2_ACCOUNT_ID: optional(z.string().trim().min(1)),
  R2_ACCESS_KEY_ID: optional(z.string().trim().min(1)),
  R2_SECRET_ACCESS_KEY: optional(z.string().trim().min(1)),
  R2_BUCKET: optional(z.string().trim().min(1)),
  // Overrides the endpoint built from R2_ACCOUNT_ID, e.g. for an EU-jurisdiction bucket or a local S3-compatible server.
  R2_ENDPOINT: optional(z.url({ error: 'R2_ENDPOINT must be a URL, e.g. https://<account>.eu.r2.cloudflarestorage.com' })),
  // The bucket's public address (r2.dev or a custom domain): files are then sent from there instead of through the api.
  R2_PUBLIC_URL: optional(
    z.url({ error: 'R2_PUBLIC_URL must be a URL, e.g. https://files.example.com' }).transform((url) => url.replace(/\/+$/, '')),
  ),
}).superRefine((env, ctx) => {
  if (env.STORAGE_MODE === 'database') return;
  // The cloud modes can't start without R2: name exactly which settings are missing.
  const missing: string[] = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'].filter((key) => !env[key as keyof typeof env]);
  if (!env.R2_ACCOUNT_ID && !env.R2_ENDPOINT) missing.unshift('R2_ACCOUNT_ID');
  for (const key of missing) {
    ctx.addIssue({ code: 'custom', path: [key], message: `${key} is required when STORAGE_MODE=${env.STORAGE_MODE}` });
  }
});
