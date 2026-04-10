import { build } from 'esbuild';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProduction = process.argv.includes('--production');

await build({
  entryPoints: [join(__dirname, 'src/main.ts')],
  outfile: join(__dirname, 'dist/main.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  sourcemap: !isProduction,
  conditions: ['@inithium/source'],
  external: [
    'express',
    'mongoose',
    'dotenv/config',
    'bcryptjs',
    'jsonwebtoken',
    'zod',
    'tslib',
  ],
  banner: {
    js: `
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'node:path'; // Destructure directly

    const require = createRequire(import.meta.url);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename); 
    `,
  },
  outExtension: { '.js': '.js' },
  logLevel: 'info',
});