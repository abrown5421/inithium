// Validates the documentation library: frontmatter, file names, required sections,
// cross-references between decisions, and relative links.
// Usage (from docs/): npm run check

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { decisionSchema, decisionSections, pageSchema } from './docs.schema.mjs';

const docsDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(docsDir, '..');
const pluginsDir = join(repoRoot, 'plugins');

const errors = [];
const fail = (file, message) => errors.push(`${relative(repoRoot, file).replaceAll('\\', '/')}: ${message}`);

/** Each root holds decisions/, guides/ and reference/. Plugin roots are plugins/plugin-<name>/docs/. */
function findRoots() {
  const roots = [{ dir: docsDir, plugin: null }];
  if (existsSync(pluginsDir)) {
    for (const entry of readdirSync(pluginsDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.startsWith('plugin-')) continue;
      const dir = join(pluginsDir, entry.name, 'docs');
      if (existsSync(dir)) roots.push({ dir, plugin: entry.name.slice('plugin-'.length) });
    }
  }
  return roots;
}

function listMarkdown(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listMarkdown(path);
    return name.endsWith('.md') ? [path] : [];
  });
}

function readDoc(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) {
    fail(file, 'missing YAML frontmatter (--- ... ---) at the top of the file');
    return null;
  }
  try {
    return { data: parseYaml(match[1]) ?? {}, body: text.slice(match[0].length) };
  } catch (error) {
    fail(file, `invalid YAML frontmatter: ${error.message}`);
    return null;
  }
}

function validate(file, schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  for (const issue of result.error.issues) fail(file, `frontmatter ${issue.path.join('.') || '(root)'}: ${issue.message}`);
  return null;
}

function checkLinks(file, body) {
  // Strip fenced code so example links inside code blocks are ignored.
  const prose = body.replace(/```[\s\S]*?```/g, '');
  for (const [, target] of prose.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^([a-z]+:|#)/i.test(target)) continue;
    const path = decodeURIComponent(target.split('#')[0]);
    if (!existsSync(resolve(dirname(file), path))) fail(file, `broken link: ${target}`);
  }
}

const decisions = new Map();
const pages = [];
let fileCount = 0;

for (const root of findRoots()) {
  const idPrefix = root.plugin ? `${root.plugin}-` : '';
  const allowedScopes = root.plugin ? ['plugin'] : ['ecosystem', 'core'];
  const kinds = { decisions: 'decision', guides: 'page', reference: 'page' };

  for (const file of listMarkdown(root.dir)) {
    const rel = relative(root.dir, file).replaceAll('\\', '/');
    const [folder] = rel.split('/');
    if (rel === 'README.md' || folder === 'templates' || folder === 'node_modules') continue;

    fileCount++;
    const kind = kinds[folder];
    if (!kind) {
      fail(file, 'docs must live in decisions/, guides/ or reference/');
      continue;
    }

    const name = rel.split('/').pop();
    const doc = readDoc(file);
    checkLinks(file, doc?.body ?? '');
    if (!doc) continue;

    if (kind === 'decision') {
      if (rel !== `decisions/${name}`) fail(file, 'decisions/ must be flat (no subfolders)');
      const fileMatch = /^(\d{4})-[a-z0-9]+(-[a-z0-9]+)*\.md$/.exec(name);
      if (!fileMatch) fail(file, 'decision file names must be NNNN-kebab-title.md');

      const data = validate(file, decisionSchema, doc.data);
      if (!data) continue;
      if (fileMatch && data.id !== `${idPrefix}${fileMatch[1]}`) {
        fail(file, `id "${data.id}" must be "${idPrefix}${fileMatch[1]}" to match the file name`);
      }
      if (!allowedScopes.includes(data.scope)) fail(file, `scope must be one of: ${allowedScopes.join(', ')}`);
      if (decisions.has(data.id)) fail(file, `duplicate decision id "${data.id}"`);

      const headings = [...doc.body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
      const present = decisionSections.filter((s) => headings.includes(s));
      if (present.length !== decisionSections.length) {
        fail(file, `missing sections: ${decisionSections.filter((s) => !headings.includes(s)).join(', ')}`);
      } else if (present.join() !== headings.filter((h) => decisionSections.includes(h)).join()) {
        fail(file, `sections must appear in this order: ${decisionSections.join(', ')}`);
      }

      decisions.set(data.id, { file, data });
    } else {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(name)) fail(file, 'page file names must be kebab-case.md');
      const data = validate(file, pageSchema, doc.data);
      if (!data) continue;
      if (!allowedScopes.includes(data.scope)) fail(file, `scope must be one of: ${allowedScopes.join(', ')}`);
      pages.push({ file, data });
    }
  }
}

// Cross-references must point at real decisions, and supersession must be recorded on both sides.
for (const { file, data } of decisions.values()) {
  for (const id of [...data.related, ...data.supersedes, ...(data.supersededBy ? [data.supersededBy] : [])]) {
    if (!decisions.has(id)) fail(file, `references unknown decision "${id}"`);
  }
  for (const id of data.supersedes) {
    const old = decisions.get(id)?.data;
    if (old && old.supersededBy !== data.id) fail(file, `supersedes "${id}", but "${id}" does not set supersededBy: "${data.id}"`);
  }
  if (data.supersededBy) {
    const next = decisions.get(data.supersededBy)?.data;
    if (next && !next.supersedes.includes(data.id)) {
      fail(file, `supersededBy "${data.supersededBy}", but that decision does not list "${data.id}" in supersedes`);
    }
  }
}
for (const { file, data } of pages) {
  for (const id of data.decisions) if (!decisions.has(id)) fail(file, `references unknown decision "${id}"`);
}

if (errors.length) {
  console.error(`docs check failed with ${errors.length} error(s):\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`docs check passed: ${fileCount} file(s), ${decisions.size} decision(s), ${pages.length} page(s)`);
