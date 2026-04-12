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

interface CreateCollectionSchema {
  name: string;
}

const templateRoot = resolve(__dirname, '../../../../src/generators/collection/create');

export default async function createCollection(
  tree: Tree,
  schema: CreateCollectionSchema
): Promise<void> {
  const names = deriveNames(schema.name);

  generateCollectionFiles(tree, names);
  generateTypeFile(tree, names);
  generateValidatorFile(tree, names);
  updateCollectionsBarrel(tree, names);
  updateValidatorsBarrel(tree, names);
  updateTypesBarrel(tree, names);
  updateMainApp(tree, names);

  await formatFiles(tree);
}

function generateCollectionFiles(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const collectionDir = joinPathFragments(
    'packages/api-collections/src/lib',
    names.kebab
  );

  generateFiles(
    tree,
    joinPathFragments(templateRoot, 'files/collection'),
    collectionDir,
    { ...names, tmpl: '' }
  );
}

function generateTypeFile(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  generateFiles(
    tree,
    joinPathFragments(templateRoot, 'files/types'),
    'packages/types/src/lib',
    { ...names, tmpl: '' }
  );
}

function generateValidatorFile(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  generateFiles(
    tree,
    joinPathFragments(templateRoot, 'files/validators'),
    'packages/validators/src/lib',
    { ...names, tmpl: '' }
  );
}

function updateCollectionsBarrel(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const barrelPath = 'packages/api-collections/src/index.ts';
  const content = tree.read(barrelPath, 'utf-8') ?? '';
  const exportLine = `export * from './lib/${names.kebab}/index.js';\n`;

  if (!content.includes(exportLine)) {
    tree.write(barrelPath, content + exportLine);
  }
}

function updateValidatorsBarrel(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const barrelPath = 'packages/validators/src/index.ts';
  const content = tree.read(barrelPath, 'utf-8') ?? '';
  const exportLine = `export * from './lib/${names.singular}.validators.js';\n`;

  if (!content.includes(exportLine)) {
    tree.write(barrelPath, content + exportLine);
  }
}

function updateTypesBarrel(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const barrelPath = 'packages/types/src/index.ts';
  const content = tree.read(barrelPath, 'utf-8') ?? '';
  const exportLine = `export * from './lib/${names.singular}.types.js';\n`;

  if (!content.includes(exportLine)) {
    tree.write(barrelPath, content + exportLine);
  }
}

function updateMainApp(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const mainPath = 'apps/api/src/main.ts';
  const content = tree.read(mainPath, 'utf-8') ?? '';

  const importLine = `import { ${names.singularCamel}sRouter } from '@inithium/api-collections';\n`;
  const routeEntry = `    '/${names.kebab}': ${names.singularCamel}sRouter,\n`;

  let updated = content;

  if (!updated.includes(importLine)) {
    updated = updated.replace(
      /^(import { assetsRouter.*?)\n/m,
      `$1\n${importLine}`
    );
  }

  if (!updated.includes(routeEntry)) {
    updated = updated.replace(
      /(initializeRoutes\(\{[^}]*)(}\))/s,
      (match, before, closing) => `${before}${routeEntry}${closing}`
    );
  }

  tree.write(mainPath, updated);
}
