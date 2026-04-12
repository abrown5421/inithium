import {
  Tree,
  formatFiles,
  joinPathFragments,
} from '@nx/devkit';
import { deriveNames } from '../../../utils/names.js';

interface DeleteCollectionSchema {
  name: string;
}

export default async function deleteCollection(
  tree: Tree,
  schema: DeleteCollectionSchema
): Promise<void> {
  const names = deriveNames(schema.name);

  removeCollectionDirectory(tree, names);
  removeTypeFile(tree, names);
  removeValidatorFile(tree, names);
  stripCollectionsBarrel(tree, names);
  stripValidatorsBarrel(tree, names);
  stripTypesBarrel(tree, names);
  stripMainApp(tree, names);

  await formatFiles(tree);
}

function removeCollectionDirectory(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const collectionDir = joinPathFragments(
    'packages/api-collections/src/lib',
    names.kebab
  );

  if (tree.exists(collectionDir)) {
    tree.delete(collectionDir);
  }
}

function removeTypeFile(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const typePath = joinPathFragments(
    'packages/types/src/lib',
    `${names.singular}.types.ts`
  );

  if (tree.exists(typePath)) {
    tree.delete(typePath);
  }
}

function removeValidatorFile(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const validatorPath = joinPathFragments(
    'packages/validators/src/lib',
    `${names.singular}.validators.ts`
  );

  if (tree.exists(validatorPath)) {
    tree.delete(validatorPath);
  }
}

function stripCollectionsBarrel(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const barrelPath = 'packages/api-collections/src/index.ts';
  const content = tree.read(barrelPath, 'utf-8') ?? '';
  const exportLine = `export * from './lib/${names.kebab}/index.js';\n`;
  tree.write(barrelPath, content.replace(exportLine, ''));
}

function stripValidatorsBarrel(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const barrelPath = 'packages/validators/src/index.ts';
  const content = tree.read(barrelPath, 'utf-8') ?? '';
  const exportLine = `export * from './lib/${names.singular}.validators.js';\n`;
  tree.write(barrelPath, content.replace(exportLine, ''));
}

function stripTypesBarrel(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const barrelPath = 'packages/types/src/index.ts';
  const content = tree.read(barrelPath, 'utf-8') ?? '';
  const exportLine = `export * from './lib/${names.singular}.types.js';\n`;
  tree.write(barrelPath, content.replace(exportLine, ''));
}

function stripMainApp(tree: Tree, names: ReturnType<typeof deriveNames>): void {
  const mainPath = 'apps/api/src/main.ts';
  const content = tree.read(mainPath, 'utf-8') ?? '';

  const importLine = `import { ${names.singularCamel}sRouter } from '@inithium/api-collections';\n`;
  const routeEntry = `    '/${names.kebab}': ${names.singularCamel}sRouter,\n`;

  tree.write(
    mainPath,
    content.replace(importLine, '').replace(routeEntry, '')
  );
}
