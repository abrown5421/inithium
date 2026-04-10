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
  format: 'cjs',
  target: 'node20',
  sourcemap: !isProduction,
  // This is the key: resolves @inithium/source export condition,
  // which maps to ./src/index.ts in each package — so workspace
  // packages are bundled from source rather than their dist.
  conditions: ['@inithium/source'],
  // Only externalize true npm dependencies, not workspace packages
  external: [
    'express',
    'mongoose',
    'dotenv/config',
    'bcryptjs',
    'jsonwebtoken',
    'zod',
    'tslib',
  ],
  // Suppress warnings about the packages' own "type": "module"
  // since we're outputting CJS
  banner: {
    js: '/* bundled by esbuild */',
  },
  logLevel: 'info',
});
