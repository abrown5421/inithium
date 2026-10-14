import { describe, expect, it } from 'vitest';
import { envSchema } from './env.schema';

const valid = {
  MONGODB_URI: 'mongodb+srv://user:pass@cluster.example.net/inithium?retryWrites=true',
  JWT_ACCESS_SECRET: 'x'.repeat(32),
  SEED_DEV_EMAIL: 'Dev@Example.com',
  SEED_DEV_PASSWORD: 'anything',
};

const messages = (env: Record<string, unknown>) => envSchema.safeParse(env).error?.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`) ?? [];

describe('envSchema', () => {
  it('accepts the required variables and fills in the defaults', () => {
    const env = envSchema.parse(valid);
    expect(env).toMatchObject({ NODE_ENV: 'development', HOST: 'localhost', PORT: 3000, STORAGE_MODE: 'database', SEED_DEV_EMAIL: 'dev@example.com' });
  });

  it('insists MONGODB_URI names a database, so Mongoose never falls back to "test"', () => {
    expect(messages({ ...valid, MONGODB_URI: 'mongodb+srv://user:pass@cluster.example.net/' })[0]).toMatch(/must include a database name/);
    expect(messages({ ...valid, MONGODB_URI: 'mongodb+srv://user:pass@cluster.example.net?x=1' })[0]).toMatch(/must include a database name/);
    expect(messages({ ...valid, MONGODB_URI: 'postgres://db/x' })[0]).toMatch(/must start with mongodb/);
  });

  it('refuses short JWT secrets', () => {
    expect(messages({ ...valid, JWT_ACCESS_SECRET: 'short' })[0]).toMatch(/at least 32 characters/);
  });

  it('holds USER_TEMP_PASSWORD to the password policy, and treats an empty value as unset', () => {
    expect(messages({ ...valid, USER_TEMP_PASSWORD: 'weak' }).length).toBeGreaterThan(0);
    expect(envSchema.parse({ ...valid, USER_TEMP_PASSWORD: '' }).USER_TEMP_PASSWORD).toBeUndefined();
  });

  it('names every R2 setting missing in a cloud storage mode (decision 0099)', () => {
    expect(messages({ ...valid, STORAGE_MODE: 'cloud-all', R2_BUCKET: '' })).toEqual([
      'R2_ACCOUNT_ID: R2_ACCOUNT_ID is required when STORAGE_MODE=cloud-all',
      'R2_ACCESS_KEY_ID: R2_ACCESS_KEY_ID is required when STORAGE_MODE=cloud-all',
      'R2_SECRET_ACCESS_KEY: R2_SECRET_ACCESS_KEY is required when STORAGE_MODE=cloud-all',
      'R2_BUCKET: R2_BUCKET is required when STORAGE_MODE=cloud-all',
    ]);
  });

  it('accepts R2_ENDPOINT in place of R2_ACCOUNT_ID, and trims R2_PUBLIC_URL’s trailing slash', () => {
    const env = envSchema.parse({
      ...valid,
      STORAGE_MODE: 'cloud-staff',
      R2_ENDPOINT: 'http://localhost:9000',
      R2_ACCESS_KEY_ID: 'key',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET: 'bucket',
      R2_PUBLIC_URL: 'https://files.example.com//',
    });
    expect(env.R2_PUBLIC_URL).toBe('https://files.example.com');
  });
});
