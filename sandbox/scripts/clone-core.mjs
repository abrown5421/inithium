// Usage: node scripts/clone-core.mjs <name> [--force] [--install]
// Copies core into sandbox/workspaces/<name>, skipping build output and dependencies.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { basename, relative, resolve, sep } from 'node:path';
import { execSync } from 'node:child_process';
import { coreTemplate, fail, workspacesDir } from './paths.mjs';

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith('--'));
const force = args.includes('--force');
const install = args.includes('--install');

if (!name) fail('missing workspace name, e.g. `npm run clone -- demo`');
if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) fail(`invalid workspace name "${name}"`);

const target = resolve(workspacesDir, name);

if (existsSync(target)) {
  if (!force) fail(`${relative(process.cwd(), target)} already exists (use --force to replace it)`);
  rmSync(target, { recursive: true, force: true });
}

const skipped = new Set(['node_modules', 'dist', 'tmp', 'out-tsc', '.nx']);

cpSync(coreTemplate, target, {
  recursive: true,
  filter: (src) => {
    const rel = relative(coreTemplate, src);
    return !rel || !rel.split(sep).some((part) => skipped.has(part));
  },
});

console.log(`cloned core -> sandbox/workspaces/${basename(target)}`);

if (install) {
  execSync('npm install', { cwd: target, stdio: 'inherit' });
}
