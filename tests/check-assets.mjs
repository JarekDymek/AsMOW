import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:\/)/, '$1'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));

const html = read('index.html');
const sw = read('sw.js');

const assetRefs = [];
for (const match of html.matchAll(/<link[^>]+href="([^"]+)"/g)) {
  const href = match[1];
  if (href.startsWith('assets/')) assetRefs.push(href);
}
for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
  const src = match[1];
  if (src.startsWith('assets/')) assetRefs.push(src);
}

const missing = assetRefs.filter(ref => !exists(ref));
if (missing.length) {
  throw new Error(`Brak plików wskazanych w index.html: ${missing.join(', ')}`);
}

const inlineStyles = [...html.matchAll(/<style(\s[^>]*)?>[\s\S]*?<\/style>/gi)];
const inlineScripts = [...html.matchAll(/<script(?![^>]*\ssrc=)(\s[^>]*)?>[\s\S]*?<\/script>/gi)];
if (inlineStyles.length || inlineScripts.length) {
  throw new Error(`index.html nadal zawiera inline style/script: style=${inlineStyles.length}, script=${inlineScripts.length}`);
}

const shellMatch = sw.match(/const APP_SHELL = \[([\s\S]*?)\];/);
if (!shellMatch) throw new Error('sw.js nie zawiera APP_SHELL.');
const shell = [...shellMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1].replace(/^\.\//, '').replace(/^\//, ''));
const notCached = assetRefs.filter(ref => !shell.includes(ref));
if (notCached.length) {
  throw new Error(`Zasoby z index.html nie są wpisane do cache PWA: ${notCached.join(', ')}`);
}

const docker = exists('Dockerfile') ? read('Dockerfile') : '';
if (docker && !/COPY\s+assets\s+\.\/assets/i.test(docker)) {
  throw new Error('Dockerfile nie kopiuje katalogu assets do obrazu.');
}

console.log(`OK: ${assetRefs.length} zasobów z index.html istnieje i jest w cache PWA.`);
