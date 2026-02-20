import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_SRC = path.resolve(__dirname, '../src');
const OUTPUT_FILE = path.join(ASSETS_SRC, 'index.ts');

const VALID_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.ico',
  '.ttf',
  '.woff',
  '.woff2',
];

function toExportName(file) {
  return path.basename(file, path.extname(file)).replace(/[^a-zA-Z0-9]/g, '_');
}

const exports = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    if (entry === 'index.ts' || entry === 'types.d.ts') continue;

    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else {
      const ext = path.extname(entry);
      if (!VALID_EXTENSIONS.includes(ext)) continue;

      const relPath = path.relative(ASSETS_SRC, fullPath).replace(/\\/g, '/');

      const exportName = toExportName(entry);

      exports.push(`export { default as ${exportName} } from './${relPath}';`);
    }
  }
}

walk(ASSETS_SRC);

fs.writeFileSync(OUTPUT_FILE, exports.join('\n') + '\n');

console.log('assets index.ts generated');
