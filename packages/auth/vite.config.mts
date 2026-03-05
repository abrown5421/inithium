/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { builtinModules } from 'module';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/auth',
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/index.ts',
      name: '@inithium/auth',
      fileName: 'index',
      formats: ['cjs' as const], 
    },
    rollupOptions: {
      external: (id: string) => {
        if (id.startsWith('.') || path.isAbsolute(id)) return false;
        if (builtinModules.includes(id) || id.startsWith('node:')) return true;
        return true;
      },
    },
  },
}));