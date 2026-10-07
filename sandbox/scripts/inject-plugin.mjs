// Usage: node scripts/inject-plugin.mjs <workspace> <plugin> [<plugin> ...]
// Copies plugins/<plugin>/{api,web} into the matching app inside sandbox/workspaces/<workspace>.
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fail, injectionTargets, pluginsDir, workspacesDir } from './paths.mjs';

const [workspace, ...requested] = process.argv.slice(2);

if (!workspace || requested.length === 0) {
  fail('usage: npm run inject -- <workspace> <plugin> [<plugin> ...]');
}

const workspaceDir = resolve(workspacesDir, workspace);
if (!existsSync(workspaceDir)) fail(`no sandbox workspace "${workspace}" (run \`npm run clone -- ${workspace}\` first)`);

const available = readdirSync(pluginsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const input of requested) {
  const plugin = input.startsWith('plugin-') ? input : `plugin-${input}`;
  if (!available.includes(plugin)) fail(`unknown plugin "${input}" (available: ${available.join(', ')})`);

  for (const [layer, targetRoot] of Object.entries(injectionTargets)) {
    const source = resolve(pluginsDir, plugin, layer);
    if (!existsSync(source)) continue;

    const destination = resolve(workspaceDir, targetRoot, plugin);
    rmSync(destination, { recursive: true, force: true });
    cpSync(source, destination, {
      recursive: true,
      filter: (src) => basename(src) !== '.gitkeep',
    });

    console.log(`${plugin}/${layer} -> ${workspace}/${targetRoot}/${plugin}`);
  }
}
