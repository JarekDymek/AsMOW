import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('index.html');
const sw = read('sw.js');
const server = read('backend/server.js');
const pwa = read('assets/js/pwa.js');
const answerBankSize = fs.statSync(path.join(root, 'assets/js/data-answer-bank.js')).size;

const directAnswerBankScripts = [
  'src="assets/js/data-answer-bank.js"',
  'src="assets/js/answer-bank.js"'
].filter(fragment => html.includes(fragment));

if (directAnswerBankScripts.length) {
  throw new Error(`Bank odpowiedzi nie powinien być ładowany na starcie: ${directAnswerBankScripts.join(', ')}`);
}

for (const required of [
  'src="assets/js/answer-bank-loader.js"',
  'src="assets/js/help.js"',
  'onclick="openHelp()"'
]) {
  if (!html.includes(required)) throw new Error(`Brak wymaganego elementu pomocy/lazy-load w index.html: ${required}`);
}

for (const required of [
  './assets/js/data-answer-bank.js',
  './assets/js/answer-bank.js',
  './assets/js/answer-bank-loader.js',
  './assets/js/help.js'
]) {
  if (!sw.includes(required)) throw new Error(`Service worker nie cacheuje wymaganego pliku: ${required}`);
}

if (answerBankSize > 450_000) {
  throw new Error(`Kompaktowy bank odpowiedzi jest za duży: ${answerBankSize} B.`);
}

for (const required of [
  "KNOWLEDGE_PROMPT_EXCLUDED_FILES = new Set(['07_bank_odpowiedzi_mow_250.md'])",
  "const BACKEND_VERSION = '1.1.5'",
  'version: BACKEND_VERSION',
  'function getConfiguredCurrentInfoSyncTokens()',
  "tokensMatch(suppliedToken, expected)",
  'currentInfo: compactCurrentInfo(context.currentInfo)',
  'knowledgeBase: compactKnowledgeBase(context.knowledgeBase)',
  'function cleanupRateLimit'
]) {
  if (!server.includes(required)) throw new Error(`Brak strażnika backendu: ${required}`);
}

if (/localKnowledge\s*=\s*loadKnowledgeFiles\(knowledgeQuery\)\.slice\(0,\s*85_000\)/.test(server)) {
  throw new Error('Backend nadal używa starego limitu 85_000 dla wiedzy promptu.');
}

const installListener = pwa.indexOf("window.addEventListener('beforeinstallprompt'");
const installSetup = pwa.indexOf('function setupInstall()');
if (installListener < 0 || installListener > installSetup) {
  throw new Error('Nasłuch beforeinstallprompt musi być zarejestrowany przed inicjalizacją aplikacji.');
}

console.log(`OK: strażniki audytu aktywne, bank odpowiedzi ładowany leniwie (${answerBankSize} B).`);
