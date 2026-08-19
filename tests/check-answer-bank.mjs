import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataJs = fs.readFileSync(path.join(root, 'assets/js/data-answer-bank.js'), 'utf8');
const routerJs = fs.readFileSync(path.join(root, 'assets/js/answer-bank.js'), 'utf8');
const proceduresJs = fs.readFileSync(path.join(root, 'assets/js/data-procedures.js'), 'utf8');
const knowledgeMd = fs.readFileSync(path.join(root, 'backend/knowledge/07_bank_odpowiedzi_mow_250.md'), 'utf8');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(dataJs, context, { filename: 'data-answer-bank.js' });
vm.runInContext(routerJs, context, { filename: 'answer-bank.js' });
vm.runInContext(`${proceduresJs}\nwindow.MOW_PROCEDURES_FOR_TEST = PROCS;`, context, { filename: 'data-procedures.js' });

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
  if (entry.updatedAt !== '2026-08-19') throw new Error(`Wpis ${entry.id} nie ma aktualnej daty audytu.`);
  const unnatural = entry.questions.find(question => /Co zrobić, gdy (czy|jak|kiedy|co|ile)\b/i.test(question));
  if (unnatural) throw new Error(`Wpis ${entry.id} zawiera sztuczny wariant pytania: ${unnatural}`);
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

const procedureTargets = {
  'p-agresja': 'bojka-agresja',
  'p-ucieczka': 'ucieczka-pierwsze-kroki',
  'p-narkotyki': 'podejrzenie-narkotykow',
  'p-samo': 'proba-samobojcza',
  'p-niebezp': 'niebezpieczny-przedmiot',
  'p-pozar': 'pozar',
  'p-wypadek': 'wypadek',
  'p-obca': 'osoba-obca',
  'p-krzywdzenie': 'standardy-zgloszenie',
  'p-kores': 'paczka-z-przedmiotem',
  'p-odwiedz': 'kontakt-z-rodzina',
  'p-cyber': 'cyberprzemoc',
  'p-nadzuz': 'wykorzystanie-seksualne',
  'p-kradziez': 'wymuszenie',
  'p-przepust': 'roznica-urlop-przepustka'
};

for (const procedure of context.window.MOW_PROCEDURES_FOR_TEST) {
  const match = context.window.resolveAnswerBankIntent(procedure.title);
  const target = procedureTargets[procedure.id];
  if (!target) throw new Error(`Brak oczekiwanego mapowania dla procedury ${procedure.id}.`);
  if (match?.type !== 'answer' || !match.entry.id.includes(target) || match.confidence < 0.9) {
    throw new Error(`Router nie łączy procedury ${procedure.id} z właściwą odpowiedzią banku.`);
  }
}

const auditedQueries = [
  ['Co to jest bank 250 odpowiedzi wzorcowych i rozpoznawania intencji w Asystencie MOW?', 'bank-odpowiedzi', /250.*25 grup/],
  ['Jak odwołać się od decyzji o stopniu uspołecznienia?', 'odwolanie-stopien', /3 dni.*7 dni/],
  ['Jak oceniać możliwość stopnia +2 lub +3?', 'stopien-plus-dwa', /21.*29/],
  ['Co oznacza stopień zerowy – adaptacyjny?', 'stopien-zero', /4 tygodnie/]
];

for (const [query, target, answerPattern] of auditedQueries) {
  const match = context.window.resolveAnswerBankIntent(query);
  if (match?.type !== 'answer' || !match.entry.id.includes(target) || !answerPattern.test(match.entry.answer)) {
    throw new Error(`Niepoprawna odpowiedź kontrolna dla pytania: ${query}`);
  }
}

if (!knowledgeMd.includes('## 250.')) throw new Error('Markdownowa baza wiedzy nie zawiera 250 wpisów.');

console.log(`OK: bank odpowiedzi ma ${bank.length} wpisów w ${categories.size} kategoriach i działa router intencji.`);
