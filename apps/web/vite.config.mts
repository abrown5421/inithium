/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  server: {
    port: 5173,
    host: 'localhost',
  },
  preview: {
    port: 5173,
    host: 'localhost',
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      // Sub-path alias MUST come before the bare package alias.
      // Without this, Tailwind's @import "@inithium/ui/styles" resolves the
      // bare @inithium/ui alias (→ index.ts) then appends "/styles" to that
      // file path, producing the broken path "index.ts/styles".
      {
        find: '@inithium/ui/styles',
        replacement: resolve(
          __dirname,
          '../../packages/ui/src/styles/globals.css',
        ),
      },
      {
        find: '@inithium/ui',
        replacement: resolve(
          __dirname,
          '../../packages/ui/src/index.ts',
        ),
      },
      {
        find: '@inithium/shared',
        replacement: resolve(
          __dirname,
          '../../packages/shared/src/index.ts',
        ),
      },
    ],
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
