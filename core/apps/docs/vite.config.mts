/// <reference types='vitest' />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The manual lives in the Inithium repo's docs/ folder, outside core (decision 0053).
const manualDir = resolve(import.meta.dirname, '../../../docs');

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/docs',
  server: {
    port: 5175,
    strictPort: true,
    host: 'localhost',
    // Let the dev server read the manual's Markdown from outside core.
    fs: { allow: [resolve(import.meta.dirname, '../..'), manualDir] },
  },
  preview: {
    port: 5175,
    strictPort: true,
    host: 'localhost',
  },
  define: {
    // Absolute path of docs/, for "open in VS Code" links. The app is local-only, so this is the developer's own path.
    __MANUAL_DIR__: JSON.stringify(manualDir.replaceAll('\\', '/')),
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../dist/apps/docs',
    emptyOutDir: true,
    reportCompressedSize: true,
    // Shiki and the Markdown renderer are large; fine for a local tool.
    chunkSizeWarningLimit: 2000,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
