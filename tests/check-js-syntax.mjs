import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['backend/server.js', 'sw.js'];

collectJs(path.join(root, 'assets/js'), files);

let failed = false;
for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: root,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    failed = true;
    console.error(result.stderr || result.stdout || `Blad skladni w ${file}`);
  }
}

if (failed) process.exit(1);
console.log(`OK: sprawdzono skladnie ${files.length} plikow JavaScript.`);

function collectJs(dir, target) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJs(full, target);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      target.push(path.relative(root, full).replace(/\\/g, '/'));
    }
  }
}
