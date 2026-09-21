import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('index.html');
const sw = read('sw.js');
const server = read('backend/server.js');
const pwa = read('assets/js/pwa.js');
const weeklyPlan = read('assets/js/weekly-plan.js');
const answerBankSize = fs.statSync(path.join(root, 'assets/js/data-answer-bank.js')).size;
const frontendPackage = JSON.parse(read('package.json'));
const backendPackage = JSON.parse(read('backend/package.json'));

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
  `const BACKEND_VERSION = '${backendPackage.version}'`,
  'version: BACKEND_VERSION',
  'function getConfiguredCurrentInfoSyncTokens()',
  "tokensMatch(suppliedToken, expected)",
  'currentInfo: compactCurrentInfo(context.currentInfo)',
  'knowledgeBase: compactKnowledgeBase(context.knowledgeBase)',
  'function cleanupRateLimit',
  "url.pathname === '/api/legal-updates'",
  'Oficjalne API ELI Sejmu RP'
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

if (sw.includes("'mow-pwa-'")) {
  throw new Error('Service worker nie może usuwać współdzielonego prefiksu cache innych aplikacji.');
}
const expectedCacheRevision = Number(frontendPackage.version.split('.').at(-1)) + 60;
if (!sw.includes('const CACHE = `${CACHE_PREFIX}v' + expectedCacheRevision + '`;')) {
  throw new Error(`Cache PWA nie odpowiada wydaniu ${frontendPackage.version}; oczekiwano v${expectedCacheRevision}.`);
}
if (!weeklyPlan.includes('function mergeStableWeeklyPlan')) {
  throw new Error('Brak blokady ponownego nadpisywania tygodnia przez ten sam dokument.');
}
if (!weeklyPlan.includes('incomingWeek.sourceVersion === existingWeek.sourceVersion')) {
  throw new Error('Ten sam sourceVersion musi pozostawiać lokalny tydzień bez zmian.');
}
if (!weeklyPlan.includes('function validateWeeklyWeek')) {
  throw new Error('Brak niezależnej walidacji danych planu z generatora.');
}
if (!server.includes('function validateInternatScheduleRecords')) {
  throw new Error('Brak walidacji rekordów grafiku odczytanych z DOCX.');
}
for (const required of [
  "const SCHEDULE_POLICY_REVISION = 'latest-document-per-week-v2'",
  "const SCHEDULE_ARCHIVE_SINCE = '2026-01-01'",
  'function buildActiveMailSchedule',
  'const authoritative = documents[0] || null',
  "filter(item => item.scheduleKind === 'internat')"
]) {
  if (!server.includes(required)) throw new Error(`Brak strażnika kanonicznego grafiku: ${required}`);
}
for (const required of [
  '/api/weekly-plan',
  'targetUrl',
  'settings.token',
  'WEEKLY_DEFAULT_BACKEND_URL',
  'harmonogram-mow-settings-v1'
]) {
  if (!weeklyPlan.includes(required)) throw new Error(`Zakładka Grafik musi korzystać z Harmonogram-MOW przez bezpieczne proxy: ${required}`);
}
if (weeklyPlan.includes('fetchMailScheduleDashboard')) {
  throw new Error('Zakładka Grafik nie może wymagać tokenu synchronizacji poczty Render zamiast tokenu Harmonogram-MOW.');
}

console.log(`OK: strażniki audytu aktywne, bank odpowiedzi ładowany leniwie (${answerBankSize} B).`);
