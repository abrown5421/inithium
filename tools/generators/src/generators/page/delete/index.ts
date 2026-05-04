import {
  Tree,
  formatFiles,
  joinPathFragments,
} from '@nx/devkit';
import { deriveNames } from '../../../utils/names.js';

interface DeletePageSchema {
  name: string;
}

const REGISTRY_PATH = 'packages/pages/src/lib/registry.ts';
const PAGES_DIR = 'packages/pages/src/lib/pages';

export default async function deletePage(
  tree: Tree,
  schema: DeletePageSchema
): Promise<void> {
  const names = deriveNames(schema.name);

  removePageDirectory(tree, names);
  removeRegistryEntry(tree, names);

  await formatFiles(tree);
}

function removePageDirectory(
  tree: Tree,
  names: ReturnType<typeof deriveNames>
): void {
  const pageDir = joinPathFragments(PAGES_DIR, names.kebab);

  if (tree.exists(pageDir)) {
    tree.delete(pageDir);
  }
}

function removeRegistryEntry(
  tree: Tree,
  names: ReturnType<typeof deriveNames>
): void {
  const content = tree.read(REGISTRY_PATH, 'utf-8') ?? '';

  const entryPattern = new RegExp(
    /\s*\{[^{}]*?key:\s*'/.source +
    names.kebab +
    /'[^{}]*?(\{[^{}]*\}[^{}]*?)*\},/.source,
    's'
  );

  const updated = content.replace(entryPattern, '');

  if (updated === content) {
    const fallbackPattern = new RegExp(
      `\\s*\\{[\\s\\S]*?key:\\s*'${names.kebab}'[\\s\\S]*?\\},`,
      'g'
    );
    tree.write(REGISTRY_PATH, content.replace(fallbackPattern, ''));
    return;
  }

  tree.write(REGISTRY_PATH, updated);
}