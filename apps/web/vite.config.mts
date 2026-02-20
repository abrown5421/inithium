import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@inithium/shared': resolve(
        __dirname,
        '../../packages/shared/src/index.ts'
      ),
      '@inithium/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@inithium/auth': resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@inithium/api-client': resolve(
        __dirname,
        '../../packages/api-client/src/index.ts'
      ),
    },
    dedupe: ['vue'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
