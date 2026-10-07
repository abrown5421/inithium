import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const repoRoot = resolve(here, '../..');
export const coreTemplate = resolve(repoRoot, 'templates/core');
export const pluginsDir = resolve(repoRoot, 'plugins');
export const workspacesDir = resolve(repoRoot, 'sandbox/workspaces');

// Where each plugin source folder lands inside a cloned workspace.
export const injectionTargets = {
  api: 'apps/api/src/plugins',
  web: 'apps/web/src/plugins',
};

export function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}
