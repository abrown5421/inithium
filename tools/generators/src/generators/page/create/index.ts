import {
  Tree,
  formatFiles,
  generateFiles,
  joinPathFragments,
} from '@nx/devkit';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { deriveNames } from '../../../utils/names.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CreatePageSchema {
  name: string;
  path: string;
  entry: string;
  exit: string;
  bg: string;
  color?: string;
  centered?: boolean;
  isErrorPage?: boolean;
  entrySpeed?: string;
  exitSpeed?: string;
  addNavigation?: boolean;
  navLabel?: string;
  navLocation?: string;
  navOrder?: number;
  navAuthenticated?: boolean;
  navAnonymous?: boolean;
  navDynamic?: boolean;
  navDynamicField?: string;
}

const REGISTRY_PATH = 'packages/pages/src/lib/registry.ts';
const PAGES_DIR = 'packages/pages/src/lib/pages';

const templateRoot = resolve(
  __dirname,
  '../../../../src/generators/page/create'
);

export default async function createPage(
  tree: Tree,
  schema: CreatePageSchema
): Promise<void> {
  const names = deriveNames(schema.name);
  const opts = normalizeOptions(schema);

  generatePageComponent(tree, names, opts);
  insertRegistryEntry(tree, names, opts);

  await formatFiles(tree);
}

function normalizeOptions(schema: CreatePageSchema): CreatePageSchema {
  const fallbackLabel = schema.name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    ...schema,
    color: schema.color === 'none' ? undefined : schema.color,
    entrySpeed: schema.entrySpeed === 'none' ? undefined : schema.entrySpeed,
    exitSpeed: schema.exitSpeed === 'none' ? undefined : schema.exitSpeed,
    navLabel: schema.navLabel || fallbackLabel,
    navLocation: schema.navLocation ?? 'main',
    navOrder: schema.navOrder ?? 1,
    navAuthenticated: schema.navAuthenticated ?? false,
    navAnonymous: schema.navAnonymous ?? false,
    navDynamic: schema.navDynamic ?? false,
  };
}

function generatePageComponent(
  tree: Tree,
  names: ReturnType<typeof deriveNames>,
  opts: CreatePageSchema
): void {
  const pageDir = joinPathFragments(PAGES_DIR, names.kebab);

  generateFiles(tree, joinPathFragments(templateRoot, 'files/page'), pageDir, {
    ...names,
    tmpl: '',
  });
}

function buildRegistryEntry(
  names: ReturnType<typeof deriveNames>,
  opts: CreatePageSchema
): string {
  const lines: string[] = [];

  lines.push(`  {`);
  lines.push(`    key: '${names.kebab}',`);
  lines.push(`    path: '${opts.path}',`);
  lines.push(`    entry: '${opts.entry}',`);
  lines.push(`    exit: '${opts.exit}',`);

  if (opts.entrySpeed) {
    lines.push(`    entrySpeed: '${opts.entrySpeed}',`);
  }

  if (opts.exitSpeed) {
    lines.push(`    exitSpeed: '${opts.exitSpeed}',`);
  }

  lines.push(`    bg: '${opts.bg}',`);

  if (opts.color) {
    lines.push(`    color: '${opts.color}',`);
  }

  if (opts.centered) {
    lines.push(`    centered: true,`);
  }

  if (opts.isErrorPage) {
    lines.push(`    isErrorPage: true,`);
  }

  lines.push(
    `    component: React.lazy(() => import('./pages/${names.kebab}/${names.kebab}')),`
  );

  if (opts.addNavigation && opts.navLabel) {
    lines.push(`    navigation: {`);
    lines.push(`      label: '${opts.navLabel}',`);
    lines.push(`      location: '${opts.navLocation}',`);

    if (opts.navOrder !== undefined) {
      lines.push(`      order: ${opts.navOrder},`);
    }

    if (opts.navAuthenticated) {
      lines.push(`      authenticated: true,`);
    }

    if (opts.navAnonymous) {
      lines.push(`      anonymous: true,`);
    }

    if (opts.navDynamic && opts.navDynamicField) {
      lines.push(
        `      resolveNavPath: (user) => \`${opts.path.replace(`:${opts.navDynamicField}`, `\${user.${opts.navDynamicField}}`)}\`,`
      );
    }

    lines.push(`    },`);
  }

  lines.push(`  },`);

  return lines.join('\n');
}

function insertRegistryEntry(
  tree: Tree,
  names: ReturnType<typeof deriveNames>,
  opts: CreatePageSchema
): void {
  const content = tree.read(REGISTRY_PATH, 'utf-8') ?? '';
  const entry = buildRegistryEntry(names, opts);
  const anchor = '];';

  if (content.includes(`key: '${names.kebab}'`)) {
    return;
  }

  const insertionIndex = content.lastIndexOf(anchor);

  if (insertionIndex === -1) {
    throw new Error(
      `Could not find closing ]; in ${REGISTRY_PATH}. Registry may be malformed.`
    );
  }

  const updated =
    content.slice(0, insertionIndex) + entry + '\n' + content.slice(insertionIndex);

  tree.write(REGISTRY_PATH, updated);
}