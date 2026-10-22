/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  base: '/cms/',
  cacheDir: '../../node_modules/.vite/apps/cms',
  server: {
    port: 5174,
    strictPort: true,
    host: 'localhost',
    proxy: { '/api': { target: 'http://localhost:3000', ws: true } },
  },
  preview: {
    port: 5174,
    strictPort: true,
    host: 'localhost',
    proxy: { '/api': { target: 'http://localhost:3000', ws: true } },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../dist/apps/cms',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
