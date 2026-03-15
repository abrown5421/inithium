import {
  type Tree,
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  logger,
} from '@nx/devkit';
import { join } from 'path';
import type { CollectionGeneratorSchema } from './schema';

// ---------------------------------------------------------------------------
// Name derivation
// ---------------------------------------------------------------------------

/**
 * Derives every name variant used across the templates from a single raw
 * input string.
 *
 * Example – input "product":
 *
 *   singular            → "product"
 *   plural              → "products"
 *   className           → "Product"        (PascalCase singular)
 *   classNamePlural     → "Products"       (PascalCase plural)
 *   propertyName        → "product"        (camelCase singular)
 *   propertyNamePlural  → "products"       (camelCase plural)
 *   fileName            → "product"        (kebab-case singular)
 *   fileNamePlural      → "products"       (kebab-case plural)
 *   constantName        → "PRODUCT"        (CONSTANT_CASE)
 *   tagType             → "Product"        (RTK Query tag – same as className)
 */
function deriveNames(raw: string) {
  const singular = names(raw);

  // Naïve pluralisation: append 's' unless the word already ends in 's'.
  const pluralRaw = raw.endsWith('s') ? raw : `${raw}s`;
  const plural = names(pluralRaw);

  return {
    singular:           singular.fileName,
    className:          singular.className,
    propertyName:       singular.propertyName,
    fileName:           singular.fileName,
    constantName:       singular.constantName,
    plural:             plural.fileName,
    classNamePlural:    plural.className,
    propertyNamePlural: plural.propertyName,
    fileNamePlural:     plural.fileName,
    tagType:            singular.className,
  };
}

type Names = ReturnType<typeof deriveNames>;

// ---------------------------------------------------------------------------
// apps/api/src/app.ts – route registration
// ---------------------------------------------------------------------------

/**
 * Inserts one import line and one app.use() line into app.ts, mirroring the
 * existing userRouter pattern exactly. Both operations are idempotent.
 */
function updateApiApp(tree: Tree, n: Names): void {
  const filePath = 'apps/api/src/app.ts';

  if (!tree.exists(filePath)) {
    logger.warn(`${filePath} not found – skipping route registration.`);
    return;
  }

  let src = tree.read(filePath, 'utf-8')!;

  // ── 1. Import ─────────────────────────────────────────────────────────────
  const importLine =
    `import { ${n.propertyName}Router } from './collections/${n.plural}/${n.fileName}.routes.js';`;

  if (!src.includes(importLine)) {
    const collectionImportRe =
      /^import\s+\{[^}]+\}\s+from\s+'\.\/collections\/[^']+';$/gm;
    const matches = [...src.matchAll(collectionImportRe)];

    if (matches.length > 0) {
      const last = matches[matches.length - 1];
      const at = last.index! + last[0].length;
      src = `${src.slice(0, at)}\n${importLine}${src.slice(at)}`;
    } else {
      src = src.replace(
        /^(import\s+\{[^}]+\}\s+from\s+'\.\/errors[^']*';)/m,
        `${importLine}\n$1`,
      );
    }
  }

  // ── 2. app.use() ──────────────────────────────────────────────────────────
  const useLine = `  app.use('/api/${n.plural}', ${n.propertyName}Router);`;

  if (!src.includes(useLine)) {
    const apiUseRe =
      /^  app\.use\(['"]\/api\/[^'"]+['"]\s*,\s*\w+\);$/gm;
    const useMatches = [...src.matchAll(apiUseRe)];

    if (useMatches.length > 0) {
      const last = useMatches[useMatches.length - 1];
      const at = last.index! + last[0].length;
      src = `${src.slice(0, at)}\n${useLine}${src.slice(at)}`;
    } else {
      src = src.replace(
        /^(\s+app\.use\(notFoundHandler\))/m,
        `${useLine}\n\n$1`,
      );
    }
  }

  tree.write(filePath, src);
  logger.info(`Updated ${filePath}`);
}

// ---------------------------------------------------------------------------
// apps/web/src/store/store.ts – RTK Query slice wiring
// ---------------------------------------------------------------------------

/**
 * Inserts import, reducer entry, and middleware into store.ts, mirroring the
 * existing usersApi pattern exactly. All three operations are idempotent.
 */
function updateWebStore(tree: Tree, n: Names): void {
  const filePath = 'apps/web/src/store/store.ts';

  if (!tree.exists(filePath)) {
    logger.warn(`${filePath} not found – skipping store update.`);
    return;
  }

  let src = tree.read(filePath, 'utf-8')!;

  // ── 1. Import ─────────────────────────────────────────────────────────────
  const importLine =
    `import { ${n.propertyNamePlural}Api } from '../services/${n.plural}Api';`;

  if (!src.includes(importLine)) {
    const servicesRe =
      /^import\s+\{[^}]+\}\s+from\s+'\.\.\/services\/[^']+';$/gm;
    const matches = [...src.matchAll(servicesRe)];

    if (matches.length > 0) {
      const last = matches[matches.length - 1];
      const at = last.index! + last[0].length;
      src = `${src.slice(0, at)}\n${importLine}${src.slice(at)}`;
    }
  }

  // ── 2. Reducer entry ──────────────────────────────────────────────────────
  const reducerLine =
    `    [${n.propertyNamePlural}Api.reducerPath]: ${n.propertyNamePlural}Api.reducer,`;

  if (!src.includes(reducerLine)) {
    const reducerRe = /^    \[\w+\.reducerPath\]:\s+\w+\.reducer,$/gm;
    const matches = [...src.matchAll(reducerRe)];

    if (matches.length > 0) {
      const last = matches[matches.length - 1];
      const at = last.index! + last[0].length;
      src = `${src.slice(0, at)}\n${reducerLine}${src.slice(at)}`;
    }
  }

  // ── 3. Middleware ─────────────────────────────────────────────────────────
  const middlewareToken = `${n.propertyNamePlural}Api.middleware`;

  if (!src.includes(middlewareToken)) {
    src = src.replace(
      /(getDefault\(\)\.concat\([^)]+?)(\))/,
      `$1, ${middlewareToken}$2`,
    );
  }

  tree.write(filePath, src);
  logger.info(`Updated ${filePath}`);
}

// ---------------------------------------------------------------------------
// Generator entry point
// ---------------------------------------------------------------------------

export async function collectionGenerator(
  tree: Tree,
  options: CollectionGeneratorSchema,
): Promise<void> {
  const n = deriveNames(options.name);

  logger.info(`\n⚙  Scaffolding collection: ${n.plural}\n`);

  // 1. Backend collection files
  generateFiles(
    tree,
    join(__dirname, 'files/api/src/collections/__collectionName__'),
    joinPathFragments('apps/api/src/collections', n.plural),
    { ...n, tmpl: '' },
  );

  // 2. Register backend routes in app.ts
  updateApiApp(tree, n);

  // 3. Frontend RTK Query slice
  generateFiles(
    tree,
    join(__dirname, 'files/web/src/services'),
    'apps/web/src/services',
    { ...n, tmpl: '' },
  );

  // 4. Wire slice into Redux store
  updateWebStore(tree, n);

  // 5. Format all touched files
  await formatFiles(tree);

  logger.info(`
✅  Collection "${n.plural}" scaffolded successfully!

  Backend (new files):
    apps/api/src/collections/${n.plural}/${n.fileName}.model.ts
    apps/api/src/collections/${n.plural}/${n.fileName}.service.ts
    apps/api/src/collections/${n.plural}/${n.fileName}.controller.ts
    apps/api/src/collections/${n.plural}/${n.fileName}.routes.ts

  Frontend (new file):
    apps/web/src/services/${n.plural}Api.ts

  Updated:
    apps/api/src/app.ts         → /api/${n.plural} registered
    apps/web/src/store/store.ts → ${n.propertyNamePlural}Api wired

  Next steps:
    1. Define your I${n.className} shape in ${n.fileName}.model.ts
    2. Add Mongoose schema fields as needed
    3. Extend ${n.className}Service with domain-specific query methods
    4. Add custom Express routes in ${n.fileName}.routes.ts
    5. Add extra RTK Query endpoints in ${n.plural}Api.ts
`);
}

export default collectionGenerator;
