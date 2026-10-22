/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
    proxy: { '/api': { target: 'http://localhost:3000', ws: true } },
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
    proxy: { '/api': { target: 'http://localhost:3000', ws: true } },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
