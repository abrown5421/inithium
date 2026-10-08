// Validates the documentation library: frontmatter, file names, the manual's section structure, decision
// record sections and cross-references, relative links, and that every UI component has a page.
// Usage (from docs/): npm run check

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { decisionSchema, decisionSections, pageSchema } from './docs.schema.mjs';

const docsDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(docsDir, '..');
const pluginsDir = join(repoRoot, 'plugins');

const errors = [];
const fail = (file, message) => errors.push(`${relative(repoRoot, file).replaceAll('\\', '/')}: ${message}`);

/**
 * Each root holds decisions/ plus the manual's section folders (decision 0052). Plugin roots are
 * plugins/plugin-<name>/docs/ with the same layout.
 */
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

  for (const file of listMarkdown(root.dir)) {
    const rel = relative(root.dir, file).replaceAll('\\', '/');
    const [folder] = rel.split('/');
    if (rel === 'README.md' || ['templates', 'tooling', 'node_modules'].includes(folder)) continue;

    fileCount++;
    // decisions/ holds decision records; every other folder is a section of the manual.
    const kind = folder === 'decisions' ? 'decision' : 'page';
    if (kind === 'page' && !rel.includes('/')) {
      fail(file, 'manual pages must live in a section folder (e.g. backend/), not at the root');
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
      pages.push({ file, data, rel });
    }
  }
}

// The manual's structure: every section folder has an index.md (its sidebar label and landing page), and every
// page has an order that is unique among its siblings, so the sidebar is deterministic.
const sectionDirs = new Set(pages.map(({ file }) => dirname(file)));
for (const dir of sectionDirs) {
  if (!existsSync(join(dir, 'index.md'))) fail(join(dir, 'index.md'), 'every section folder needs an index.md');
}
const siblings = new Map();
for (const page of pages) {
  if (page.data.order === undefined) fail(page.file, 'frontmatter order is required: the position in the sidebar');
  // A section's index.md sits among its parent folder's pages.
  const isIndex = page.file.endsWith(`${sep}index.md`);
  const parent = isIndex ? dirname(dirname(page.file)) : dirname(page.file);
  if (!siblings.has(parent)) siblings.set(parent, []);
  siblings.get(parent).push(page);
}
for (const group of siblings.values()) {
  const seen = new Map();
  for (const page of group) {
    if (page.data.order === undefined) continue;
    const other = seen.get(page.data.order);
    if (other) fail(page.file, `order ${page.data.order} is also used by ${relative(repoRoot, other.file).replaceAll(sep, '/')}`);
    else seen.set(page.data.order, page);
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

// Every component, composite and layout the UI libs export must have exactly one reference page, and every
// component page must describe something that is actually exported.
const uiLibs = { component: 'ui-components', composite: 'ui-composites', layout: 'ui-layouts' };
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function exportedUi() {
  const found = [];
  for (const [layer, lib] of Object.entries(uiLibs)) {
    const libDir = join(repoRoot, 'core', 'libs', 'shared', lib, 'src');
    const index = join(libDir, 'index.ts');
    if (!existsSync(index)) continue;
    for (const [, path] of readFileSync(index, 'utf8').matchAll(/export \* from '\.\/(lib\/[^']+\.component)'/g)) {
      const source = join(libDir, `${path}.tsx`);
      if (!existsSync(source)) continue;
      for (const [, name] of readFileSync(source, 'utf8').matchAll(/^export function ([A-Z][A-Za-z0-9]*)\(/gm)) {
        // Providers are app-level infrastructure, documented on the UI overview page.
        if (!name.endsWith('Provider')) found.push({ name, layer, import: `@inithium/shared-${lib}`, index });
      }
    }
  }
  return found;
}

const componentPages = new Map();
for (const { file, data } of pages) {
  if (!data.component) continue;
  const { name, layer } = data.component;
  const expected = join(docsDir, 'ui-library', `${layer}s`, `${kebab(name)}.md`);
  if (resolve(file) !== expected) fail(file, `a ${layer} page must be ui-library/${layer}s/${kebab(name)}.md`);
  if (componentPages.has(name)) fail(file, `duplicate page for component "${name}"`);
  componentPages.set(name, { file, data });
}
const exported = exportedUi();
for (const item of exported) {
  const page = componentPages.get(item.name);
  if (!page) {
    fail(item.index, `exports ${item.layer} "${item.name}" but docs/ui-library/${item.layer}s/${kebab(item.name)}.md doesn't exist (see docs/templates/component.md)`);
    continue;
  }
  if (page.data.component.layer !== item.layer) fail(page.file, `component.layer must be "${item.layer}"`);
  if (page.data.component.import !== item.import) fail(page.file, `component.import must be "${item.import}"`);
}
for (const [name, { file }] of componentPages) {
  if (!exported.some((item) => item.name === name)) fail(file, `documents "${name}", which no UI lib exports`);
}

// Coverage (decision 0052): every core lib, env var and live example is documented, and the docs describe
// nothing that no longer exists.
const coreDir = join(repoRoot, 'core');
const readText = (path) => (existsSync(path) ? readFileSync(path, 'utf8').replace(/\r\n/g, '\n') : null);
const manualPages = pages.filter((page) => !page.file.includes(`${sep}plugins${sep}plugin-`));
const pageText = (relPath) => readText(join(docsDir, relPath));

// Libs: every core lib's import path appears in reference/libs.md, and every lib listed there exists.
const libsPage = pageText('reference/libs.md');
const tsconfig = readText(join(coreDir, 'tsconfig.base.json'));
if (libsPage && tsconfig) {
  const paths = JSON.parse(tsconfig).compilerOptions?.paths ?? {};
  // Installed plugins and client code are documented by the plugin and the client, not by core.
  const coreLibs = Object.entries(paths)
    .filter(([, [target]]) => !/libs\/(plugins|client)\//.test(target))
    .map(([alias]) => alias);
  const libsFile = join(docsDir, 'reference', 'libs.md');
  for (const alias of coreLibs) {
    if (!libsPage.includes(`\`${alias}\``)) fail(libsFile, `lib ${alias} isn't documented (add it to the table and give it a section)`);
  }
  for (const [, alias] of libsPage.matchAll(/^\| `(@inithium\/[a-z0-9-]+)` \|/gm)) {
    if (!coreLibs.includes(alias)) fail(libsFile, `lists ${alias}, which isn't a core lib (check core/tsconfig.base.json)`);
  }
}

// Env vars: every key in envSchema is in the environment variables table and in core/.env.example; the table
// lists nothing else.
const envPage = pageText('backend/environment-variables.md');
const envSchemaSource = readText(join(coreDir, 'libs', 'api', 'config', 'src', 'lib', 'env.schema.ts'));
const envExample = readText(join(coreDir, '.env.example'));
if (envPage && envSchemaSource) {
  const envFile = join(docsDir, 'backend', 'environment-variables.md');
  const schemaKeys = [...envSchemaSource.matchAll(/^ {2}([A-Z][A-Z0-9_]*):/gm)].map((m) => m[1]);
  const documented = [...envPage.matchAll(/^\| `([A-Z][A-Z0-9_]*)` \|/gm)].map((m) => m[1]);
  for (const key of schemaKeys) {
    if (!documented.includes(key)) fail(envFile, `env var ${key} is in envSchema but not in the table`);
    if (envExample && !new RegExp(`^#?\\s*${key}=`, 'm').test(envExample)) {
      fail(join(coreDir, '.env.example'), `env var ${key} is in envSchema but not in .env.example`);
    }
  }
  for (const key of documented) {
    if (!schemaKeys.includes(key)) fail(envFile, `documents ${key}, which isn't in envSchema`);
  }
}

// Examples: every embedded example file exists and default-exports a component; every example file is embedded.
const examplesDir = join(coreDir, 'apps', 'docs', 'src', 'examples');
if (existsSync(examplesDir)) {
  const embedded = new Set();
  for (const { file } of manualPages) {
    // Drop blocks fenced with 4+ backticks first: an ```example inside one is shown as text, not embedded.
    const body = (readText(file) ?? '').replace(/^(`{4,})[^\n]*\n[\s\S]*?^\1$/gm, '');
    for (const [, key] of body.matchAll(/^```example\n([^\n`]+)\n```$/gm)) {
      const name = key.trim();
      embedded.add(name);
      const source = readText(join(examplesDir, `${name}.example.tsx`));
      if (source === null) fail(file, `embeds example "${name}", but core/apps/docs/src/examples/${name}.example.tsx doesn't exist`);
      else if (!/^export default function /m.test(source)) fail(join(examplesDir, `${name}.example.tsx`), 'an example must default-export its component');
    }
  }
  const listExamples = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? listExamples(join(dir, entry.name)) : entry.name.endsWith('.example.tsx') ? [join(dir, entry.name)] : [],
    );
  for (const path of listExamples(examplesDir)) {
    const name = relative(examplesDir, path).replaceAll(sep, '/').replace(/\.example\.tsx$/, '');
    if (!embedded.has(name)) fail(path, `example "${name}" isn't embedded in any manual page`);
  }
}

if (errors.length) {
  console.error(`docs check failed with ${errors.length} error(s):\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`docs check passed: ${fileCount} file(s), ${decisions.size} decision(s), ${pages.length} page(s)`);
