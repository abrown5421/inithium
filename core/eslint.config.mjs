import nx from '@nx/eslint-plugin';

// Module boundaries mirror CLAUDE.md §4 "Libs hold the business logic".
// Apps carry only a scope tag; type and origin constraints apply to libs.
export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mts', '**/*.mjs'],
    rules: {
      // Prefix a parameter with _ when its position is required but its value isn't (e.g. Express error handlers).
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          // Projects' tooling configs may import the workspace's shared ones: ESLint's, and Vitest's preset (decision 0103).
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$', '^.*/vitest\\.preset\\.mts$'],
          depConstraints: [
            // scope: which app(s) may consume a project
            { sourceTag: 'scope:api', onlyDependOnLibsWithTags: ['scope:api', 'scope:shared'] },
            { sourceTag: 'scope:web', onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'] },
            { sourceTag: 'scope:cms', onlyDependOnLibsWithTags: ['scope:cms', 'scope:shared'] },
            // apps/docs, the manual viewer (decision 0053), uses shared libs only
            { sourceTag: 'scope:docs', onlyDependOnLibsWithTags: ['scope:docs', 'scope:shared'] },
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },

            // type: layering. Any lib may use the test kits (type:testing), but only from its tests: see the
            // no-restricted-imports rule below (decision 0103).
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:ui', 'type:util', 'type:testing'],
            },
            { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:data-access', 'type:util', 'type:testing'] },
            { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'type:testing'] },
            { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util', 'type:testing'] },
            {
              sourceTag: 'type:testing',
              onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:ui', 'type:util', 'type:testing'],
            },

            // origin: core never depends on plugin or client code
            { sourceTag: 'origin:core', notDependOnLibsWithTags: ['origin:plugin', 'origin:client'] },

            // ui: each UI layer builds only on the layers above it (decision 0038)
            { sourceTag: 'ui:theme', notDependOnLibsWithTags: ['ui:component', 'ui:composite', 'ui:layout'] },
            { sourceTag: 'ui:component', notDependOnLibsWithTags: ['ui:composite', 'ui:layout'] },
            { sourceTag: 'ui:composite', notDependOnLibsWithTags: ['ui:layout'] },
          ],
        },
      ],
    },
  },
  {
    // Test kits (type:testing libs, named *-testing*) are for tests only: code that ships never imports them (decision
    // 0103). The kits' own eslint configs turn this off, since they build on each other.
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@inithium/.*-testing(-.*)?$',
              message: 'Test kits may only be imported from *.spec.ts(x) files (decision 0103).',
            },
          ],
        },
      ],
    },
  },
];
