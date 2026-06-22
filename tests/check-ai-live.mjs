import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const casesPath = path.join(root, 'tests', 'knowledge-golden-cases.json');
const reportDir = path.join(root, 'tests', 'reports');
const reportPath = path.join(reportDir, 'ai-live-report.json');

const url = process.env.ASMOW_LIVE_AI_URL || '';
if (!url) {
  console.log('SKIP: test AI live wymaga ASMOW_LIVE_AI_URL, np. https://asmow.onrender.com/api/chat');
  process.exit(0);
}

const limit = Number(process.env.ASMOW_LIVE_LIMIT || 0);
const delayMs = Number(process.env.ASMOW_LIVE_DELAY_MS || 4500);
const retries = Number(process.env.ASMOW_LIVE_RETRIES || 2);
const retryDelayMs = Number(process.env.ASMOW_LIVE_RETRY_DELAY_MS || 20_000);
const allowBlocked = process.env.ASMOW_LIVE_ALLOW_BLOCKED === '1';
const selectedIds = (process.env.ASMOW_LIVE_CASES || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
const selectedCases = selectedIds.length
  ? cases.filter(testCase => selectedIds.includes(testCase.id))
  : cases;
const limitedCases = limit > 0 ? selectedCases.slice(0, limit) : selectedCases;

if (!limitedCases.length) {
  console.log('SKIP: nie znaleziono przypadkow testowych dla podanych ustawien.');
  process.exit(0);
}

fs.mkdirSync(reportDir, { recursive: true });

const report = {
  ok: true,
  url: redactUrl(url),
  startedAt: new Date().toISOString(),
  cases: []
};

for (const [index, testCase] of limitedCases.entries()) {
  const result = await runCase(testCase, index + 1, limitedCases.length);
  report.cases.push(result);
  if (!result.ok) report.ok = false;
  if (index < limitedCases.length - 1) await sleep(delayMs);
}

report.finishedAt = new Date().toISOString();
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

const passed = report.cases.filter(item => item.ok).length;
const blocked = report.cases.filter(item => item.blocked).length;
const failed = report.cases.length - passed - blocked;

if (failed) {
  console.error(`AI live: ${passed}/${report.cases.length} OK, ${failed} bledow, ${blocked} zablokowanych limitem/obciazeniem. Raport: ${path.relative(root, reportPath)}`);
  for (const item of report.cases.filter(item => !item.ok && !item.blocked)) {
    console.error(`- ${item.id}: ${item.errors.join('; ')}`);
  }
  process.exit(1);
}

if (blocked && !allowBlocked) {
  console.error(`AI live: ${passed}/${report.cases.length} OK, ${blocked} zablokowanych limitem/obciazeniem. Raport: ${path.relative(root, reportPath)}`);
  for (const item of report.cases.filter(item => item.blocked)) {
    console.error(`- ${item.id}: ${item.errors.join('; ')}`);
  }
  process.exit(1);
}

console.log(`OK: AI live ${passed}/${report.cases.length} odpowiedzi poprawnych${blocked ? `, ${blocked} pominieto przez limit/obciazenie` : ''}. Raport: ${path.relative(root, reportPath)}`);

async function runCase(testCase, number, total) {
  const prompt = [
    'To jest wewnetrzny test wiedzy Asystenta MOW.',
    'Odpowiedz krotko, rzeczowo, po polsku, ze wskazaniem podstawy lub zrodla.',
    'Jezeli pytanie jest pulapka, rozroznij podobne pojecia i nie odpowiadaj z pamieci ogolnej.',
    '',
    `Pytanie ${number}/${total}: ${testCase.question}`
  ].join('\n');

  const payload = {
    clientTime: new Date().toISOString(),
    context: buildLiveContext(),
    messages: [{ role: 'user', content: prompt }]
  };

  const startedAt = Date.now();
  const attempts = [];
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (attempt > 0) await sleep(retryDelayMs * attempt);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      const answer = String(data.answer || data.error || '');
      attempts.push({ attempt: attempt + 1, status: res.status, answer: answer.slice(0, 240) });
      if (isRetryableStatus(res.status) && attempt < retries) continue;

      if (isBlockedByProvider(res.status, answer)) {
        return {
          id: testCase.id,
          question: testCase.question,
          expected: testCase.expected,
          source: testCase.source,
          status: res.status,
          durationMs: Date.now() - startedAt,
          attempts,
          ok: false,
          blocked: true,
          errors: [providerBlockReason(answer, res.status)],
          answer
        };
      }

      const errors = evaluateAnswer(testCase, answer, res.status);
      return {
        id: testCase.id,
        question: testCase.question,
        expected: testCase.expected,
        source: testCase.source,
        status: res.status,
        durationMs: Date.now() - startedAt,
        attempts,
        ok: errors.length === 0,
        blocked: false,
        errors,
        answer
      };
    } catch (err) {
      attempts.push({ attempt: attempt + 1, status: 0, error: err.message });
      if (attempt < retries) continue;
      return {
        id: testCase.id,
        question: testCase.question,
        expected: testCase.expected,
        source: testCase.source,
        status: 0,
        durationMs: Date.now() - startedAt,
        attempts,
        ok: false,
        blocked: false,
        errors: [`Blad polaczenia: ${err.message}`],
        answer: ''
      };
    }
  }

  return {
    id: testCase.id,
    question: testCase.question,
    expected: testCase.expected,
    source: testCase.source,
    status: 0,
    durationMs: Date.now() - startedAt,
    attempts,
    ok: false,
    blocked: false,
    errors: ['Nie wykonano testu po ponowieniach.'],
    answer: ''
  };
}

function isRetryableStatus(status) {
  return [429, 502, 503, 504].includes(Number(status));
}

function isBlockedByProvider(status, answer) {
  const text = normalize(answer);
  return isRetryableStatus(status) && (
    text.includes('limit') ||
    text.includes('quota') ||
    text.includes('resource_exhausted') ||
    text.includes('high demand') ||
    text.includes('duze zapotrzebowanie') ||
    text.includes('duzym obciazeniem') ||
    text.includes('przeciazen')
  );
}

function providerBlockReason(answer, status) {
  const text = normalize(answer);
  if (text.includes('quota') || text.includes('limit') || text.includes('resource_exhausted')) {
    return `Limit/quota dostawcy AI lub backendu, HTTP ${status}`;
  }
  if (text.includes('high demand') || text.includes('przeciazen') || text.includes('obciazen')) {
    return `Model chwilowo przeciazony, HTTP ${status}`;
  }
  return `Backend/model niedostepny, HTTP ${status}`;
}

function buildLiveContext() {
  const central = JSON.parse(fs.readFileSync(path.join(root, 'backend', 'knowledge', 'central-knowledge.json'), 'utf8'));
  return {
    role: 'mentor i asystent wychowawcy MOW nr 1 w Malborku',
    rule: 'Dokumenty MOW sa nadrzedne przy pytaniach o procedury. Gdy pytanie jest zbyt ogolne, asystent ma dopytac.',
    documents: [
      'Statut MOW nr 1 w Malborku',
      'Procedury MOW',
      'Regulamin stopni uspołecznienia',
      'Ustawa o wspieraniu i resocjalizacji nieletnich Dz.U. 2026 poz. 163',
      'Rozporzadzenie MEiN Dz.U. 2023 poz. 651',
      'Karta Nauczyciela Dz.U. 2026 poz. 515'
    ],
    legalBases: [
      'Karta Nauczyciela: art. 42 ust. 1 i art. 42 ust. 3; pensum wychowawcy MOW 24 godziny, czas pracy do 40 godzin.',
      'Ustawa o wspieraniu i resocjalizacji nieletnich: art. 7, 107, 111, 115, 121, 179, 180.',
      'Rozporzadzenie MEiN Dz.U. 2023 poz. 651: par. 10-15.'
    ],
    knowledgeBase: {
      today: new Date().toISOString().slice(0, 10),
      centralVersion: central.version,
      centralUpdatedAt: central.updatedAt,
      rule: 'Wpisy centralne i odpowiedzi wzorcowe sa zrodlem testowym. Przy konflikcie stosuj wpis centralny i nowsza date.',
      items: Array.isArray(central.items) ? central.items : []
    }
  };
}

function evaluateAnswer(testCase, answer, status) {
  const errors = [];
  const normalizedAnswer = normalize(answer);

  if (status < 200 || status >= 300) {
    errors.push(`HTTP ${status}`);
  }
  if (!answer.trim()) {
    errors.push('pusta odpowiedz');
  }

  const mustInclude = testCase.liveMustInclude || testCase.mustInclude || [];
  const mustNotInclude = testCase.liveMustNotInclude || testCase.mustNotInclude || [];

  for (const phrase of mustInclude) {
    if (!normalizedAnswer.includes(normalize(phrase))) {
      errors.push(`brak w odpowiedzi: "${phrase}"`);
    }
  }

  for (const group of testCase.liveMustIncludeAny || []) {
    const variants = Array.isArray(group) ? group : [group];
    if (!variants.some(phrase => normalizedAnswer.includes(normalize(phrase)))) {
      errors.push(`brak jednego z wariantow: ${variants.map(value => `"${value}"`).join(' / ')}`);
    }
  }

  for (const phrase of mustNotInclude) {
    if (normalizedAnswer.includes(normalize(phrase))) {
      errors.push(`odpowiedz zawiera zakazany fragment: "${phrase}"`);
    }
  }

  return errors;
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function redactUrl(value) {
  try {
    const parsed = new URL(value);
    parsed.search = '';
    return parsed.toString();
  } catch {
    return '(nieprawidlowy adres)';
  }
}
