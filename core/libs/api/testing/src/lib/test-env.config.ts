/**
 * The environment api tests run with. MONGODB_URI only has to pass validation: tests connect to the in-memory server
 * themselves. USER_TEMP_PASSWORD is set, so creating accounts and resetting passwords are on.
 */
export const TEST_ENV = {
  NODE_ENV: 'test',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/inithium-test',
  JWT_ACCESS_SECRET: 'test-secret-that-is-at-least-32-characters-long',
  JWT_ACCESS_TTL_MINUTES: '15',
  JWT_REFRESH_TTL_DAYS: '30',
  SEED_DEV_EMAIL: 'dev@example.com',
  SEED_DEV_PASSWORD: 'Dev-password-1!',
  USER_TEMP_PASSWORD: 'Temporary-password-1!',
  STORAGE_MODE: 'database',
  STORAGE_DATABASE_QUOTA_MB: '250',
} as const;
