import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = read('index.html');
const scriptRefs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
const js = scriptRefs
  .filter(ref => ref.startsWith('assets/js/'))
  .map(ref => `\n// ${ref}\n${read(ref)}`)
  .join('\n');

const handlers = [...html.matchAll(/\son[a-z]+="([^"]+)"/gi)]
  .flatMap(match => extractTopLevelCalls(match[1]))
  .filter(name => !isNativeInlineCall(name));

const definitions = new Set([
  ...js.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g),
  ...js.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)
].map(match => match[1]));

const missingHandlers = [...new Set(handlers)].filter(name => !definitions.has(name));
if (missingHandlers.length) {
  throw new Error(`Brak funkcji uzytych w HTML: ${missingHandlers.sort().join(', ')}`);
}

const duplicateIds = findDuplicateIds(html);
if (duplicateIds.length) {
  throw new Error(`Powtorzone id w index.html: ${duplicateIds.join(', ')}`);
}

console.log(`OK: sprawdzono ${new Set(handlers).size} funkcji z HTML i unikalnosc id.`);

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function isNativeInlineCall(name) {
  return ['confirm', 'if', 'return'].includes(name);
}

function extractTopLevelCalls(expression) {
  const calls = [];
  for (const match of expression.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
    const previous = expression.slice(0, match.index).trimEnd().slice(-1);
    if (previous === '.') continue;
    calls.push(match[1]);
  }
  return calls;
}

function findDuplicateIds(text) {
  const seen = new Set();
  const duplicates = new Set();
  for (const match of text.matchAll(/\bid="([^"]+)"/g)) {
    if (seen.has(match[1])) duplicates.add(match[1]);
    seen.add(match[1]);
  }
  return [...duplicates].sort();
}
