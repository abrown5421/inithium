import type { ComponentType } from 'react';

// Live examples (decision 0053): every src/examples/<section>/<name>.example.tsx file, its default-exported component
// and its exact source. A page embeds one with a fenced block: ```example ui-library/container/card ```.

const modules = import.meta.glob('../../examples/**/*.example.tsx', { eager: true }) as Record<
  string,
  { default?: ComponentType }
>;
const sources = import.meta.glob('../../examples/**/*.example.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const keyOf = (path: string) => path.replace('../../examples/', '').replace(/\.example\.tsx$/, '');

export interface Example {
  Component: ComponentType;
  source: string;
}

const examples = new Map<string, Example>();
for (const [path, module] of Object.entries(modules)) {
  if (module.default) examples.set(keyOf(path), { Component: module.default, source: sources[path] ?? '' });
}

export const findExample = (key: string) => examples.get(key.trim());
