import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// The shared Vitest setup every project's vitest.config.mts builds on (decision 0103), so they all run the same way.

const workspaceRoot = dirname(fileURLToPath(import.meta.url));
const testingLib = join(workspaceRoot, 'libs/api/testing/src/lib');

export type ProjectTestOptions = {
  /** 'jsdom' for React components and hooks; everything else runs in Node. */
  environment?: 'node' | 'jsdom';
  /**
   * For api code: sets the test environment variables and gives every test file its own empty MongoDB database
   * (one in-memory server per run, cleared before each test).
   */
  database?: boolean;
};

/** The Vitest config for the project in `projectRoot` (pass `import.meta.dirname`). */
export function projectTestConfig(projectRoot: string, options: ProjectTestOptions = {}) {
  const name = relative(workspaceRoot, projectRoot).replace(/\\/g, '/');
  return defineConfig({
    root: projectRoot,
    cacheDir: join(workspaceRoot, 'node_modules/.vite', name),
    // @inithium/* aliases come from tsconfig.base.json, as in the apps (CLAUDE.md §7).
    resolve: { tsconfigPaths: true },
    test: {
      name,
      environment: options.environment ?? 'node',
      include: ['src/**/*.spec.{ts,tsx}'],
      ...(options.database
        ? {
            globalSetup: [join(testingLib, 'mongo.setup.ts')],
            setupFiles: [join(testingLib, 'test-env.setup.ts'), join(testingLib, 'database.setup.ts')],
            // Hashing passwords (scrypt) and a first-run MongoDB download take longer than Vitest's defaults.
            testTimeout: 20_000,
            hookTimeout: 120_000,
          }
        : {}),
    },
  });
}
