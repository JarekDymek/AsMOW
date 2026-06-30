import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataJs = fs.readFileSync(path.join(root, 'assets/js/data-answer-bank.js'), 'utf8');
const routerJs = fs.readFileSync(path.join(root, 'assets/js/answer-bank.js'), 'utf8');
const knowledgeMd = fs.readFileSync(path.join(root, 'backend/knowledge/07_bank_odpowiedzi_mow_250.md'), 'utf8');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(dataJs, context, { filename: 'data-answer-bank.js' });
vm.runInContext(routerJs, context, { filename: 'answer-bank.js' });

const bank = context.window.MOW_ANSWER_BANK;
if (!Array.isArray(bank)) throw new Error('MOW_ANSWER_BANK nie jest tablicą.');
if (bank.length !== 250) throw new Error(`Bank powinien mieć 250 odpowiedzi, ma ${bank.length}.`);

const ids = new Set();
const categories = new Map();
for (const entry of bank) {
  for (const field of ['id', 'category', 'categoryKey', 'intent', 'answer', 'action', 'askIfUnclear', 'doNotAnswer', 'priority', 'risk', 'updatedAt']) {
    if (!entry[field]) throw new Error(`Wpis ${entry.id || '(brak id)'} nie ma pola ${field}.`);
  }
  if (ids.has(entry.id)) throw new Error(`Duplikat id: ${entry.id}`);
  ids.add(entry.id);
  if (!Array.isArray(entry.questions) || entry.questions.length < 2) throw new Error(`Wpis ${entry.id} ma za mało pytań.`);
  if (!Array.isArray(entry.variants) || entry.variants.length < 3) throw new Error(`Wpis ${entry.id} ma za mało wariantów.`);
  if (!Array.isArray(entry.keywords) || entry.keywords.length < 3) throw new Error(`Wpis ${entry.id} ma za mało słów-kluczy.`);
  if (!Array.isArray(entry.sources) || !entry.sources.length) throw new Error(`Wpis ${entry.id} nie ma źródeł.`);
  categories.set(entry.categoryKey, (categories.get(entry.categoryKey) || 0) + 1);
}

if (categories.size !== 25) throw new Error(`Bank powinien mieć 25 kategorii, ma ${categories.size}.`);
for (const [category, count] of categories) {
  if (count !== 10) throw new Error(`Kategoria ${category} powinna mieć 10 wpisów, ma ${count}.`);
}

const pensum = bank.find(entry => entry.id.includes('pensum-wychowawcy-mow'));
if (!pensum) throw new Error('Brak wpisu o pensum wychowawcy MOW.');
if (!/24/.test(pensum.answer)) throw new Error('Wpis o pensum nie zawiera 24 godzin.');
if (/pensum[^.]{0,60}40 godzin/i.test(pensum.answer)) throw new Error('Wpis o pensum sugeruje błędne 40 godzin pensum.');

const requiredTerms = ['ucieczka', 'urlop', 'przepustka', 'art 107', 'dane osobowe', 'przymus', 'pożar', 'opinia'];
for (const term of requiredTerms) {
  const normalized = context.window.normalizeAnswerBankText(term);
  const found = bank.some(entry => context.window.normalizeAnswerBankText([
    entry.intent,
    entry.answer,
    entry.action,
    ...(entry.keywords || [])
  ].join(' ')).includes(normalized));
  if (!found) throw new Error(`Bank nie zawiera wymaganego tematu: ${term}`);
}

const pensumMatch = context.window.resolveAnswerBankIntent('Ile godzin etatu ma wychowawca w MOW?');
if (pensumMatch?.type !== 'answer' || !pensumMatch.entry.id.includes('pensum-wychowawcy-mow')) {
  throw new Error('Router intencji nie rozpoznał pytania o pensum wychowawcy MOW.');
}

const broadMatch = context.window.resolveAnswerBankIntent('urlop');
if (broadMatch?.type !== 'clarify') {
  throw new Error('Router powinien dopytać przy zbyt ogólnym pytaniu: urlop.');
}

if (!knowledgeMd.includes('## 250.')) throw new Error('Markdownowa baza wiedzy nie zawiera 250 wpisów.');

console.log(`OK: bank odpowiedzi ma ${bank.length} wpisów w ${categories.size} kategoriach i działa router intencji.`);
