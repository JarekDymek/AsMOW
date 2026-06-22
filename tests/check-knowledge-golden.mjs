import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const casesPath = path.join(root, 'tests', 'knowledge-golden-cases.json');
const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

if (!Array.isArray(cases) || cases.length < 35) {
  fail(`Zbyt malo pytan kontrolnych w ${path.relative(root, casesPath)}. Minimum: 35.`);
}

const activeKnowledge = collectActiveKnowledge();
const normalizedKnowledge = normalize(activeKnowledge);
const failures = [];

for (const testCase of cases) {
  validateCaseShape(testCase);
  for (const phrase of testCase.mustInclude || []) {
    if (!normalizedKnowledge.includes(normalize(phrase))) {
      failures.push(`${testCase.id}: brak wymaganego fragmentu wiedzy: "${phrase}"`);
    }
  }
  for (const phrase of testCase.mustNotInclude || []) {
    if (normalizedKnowledge.includes(normalize(phrase))) {
      failures.push(`${testCase.id}: znaleziono zakazany fragment: "${phrase}"`);
    }
  }
}

const stalePhrases = [
  'UPN (Dz.U. 2022 poz. 1082)',
  'Rozp. MEN 2011',
  'Rozp. RM 2011',
  'Ustawa o postepowaniu w sprawach nieletnich (Dz.U. 2022 poz. 1082)'
];

for (const phrase of stalePhrases) {
  if (normalizedKnowledge.includes(normalize(phrase))) {
    failures.push(`Nieaktualna podstawa prawna nadal wystepuje w aktywnej wiedzy: "${phrase}"`);
  }
}

if (failures.length) {
  console.error('Baza wiedzy nie przeszla testu odpowiedzi wzorcowych:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`OK: sprawdzono ${cases.length} pytan kontrolnych bazy wiedzy.`);

function collectActiveKnowledge() {
  const parts = [];
  const knowledgeDir = path.join(root, 'backend', 'knowledge');
  for (const entry of fs.readdirSync(knowledgeDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (entry.name.startsWith('_')) continue;
    if (!/\.(md|txt|json)$/i.test(entry.name)) continue;
    const full = path.join(knowledgeDir, entry.name);
    parts.push(`\n--- ${entry.name} ---\n${fs.readFileSync(full, 'utf8')}`);
  }

  const appFiles = [
    'assets/js/ai-config.js',
    'assets/js/data-laws.js',
    'index.html'
  ];

  for (const file of appFiles) {
    const full = path.join(root, file);
    if (fs.existsSync(full)) {
      parts.push(`\n--- ${file} ---\n${fs.readFileSync(full, 'utf8')}`);
    }
  }

  return parts.join('\n');
}

function validateCaseShape(testCase) {
  const required = ['id', 'question', 'expected', 'source', 'mustInclude'];
  for (const key of required) {
    if (!testCase[key] || (Array.isArray(testCase[key]) && !testCase[key].length)) {
      failures.push(`Niepelny przypadek testowy: ${testCase.id || '(brak id)'} - brak pola ${key}`);
    }
  }
}

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
