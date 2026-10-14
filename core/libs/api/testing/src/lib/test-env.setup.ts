import { TEST_ENV } from './test-env.config';

// Vitest setup file for `database: true` projects: loadEnv() validates these instead of core/.env, so tests never
// depend on a developer's local settings or reach real services. It runs before any test code reads the environment.
for (const key of Object.keys(process.env)) if (key.startsWith('R2_')) delete process.env[key];
Object.assign(process.env, TEST_ENV);
