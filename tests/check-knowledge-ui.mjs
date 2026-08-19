import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const central = JSON.parse(fs.readFileSync(path.join(root, 'backend/knowledge/central-knowledge.json'), 'utf8'));
const listJs = fs.readFileSync(path.join(root, 'assets/js/knowledge-list.js'), 'utf8');
const contextJs = fs.readFileSync(path.join(root, 'assets/js/knowledge-context.js'), 'utf8');

if (central.version !== '2026-08-19.2') throw new Error('Centralna baza wiedzy ma nieaktualną wersję.');
if (!Array.isArray(central.items) || central.items.length < 9) throw new Error('Centralna baza wiedzy jest niekompletna.');

const bankItem = central.items.find(item => item.id === 'bank-odpowiedzi-mow-250-intencje');
if (!bankItem || !/250 krótkich.*25 grupach/.test(bankItem.content)) {
  throw new Error('Wpis o banku 250 odpowiedzi nie wyjaśnia jego roli użytkownikowi.');
}

const visibleFields = central.items.flatMap(item => [item.title, item.source]).join(' ');
for (const fragment of ['Pierwszenstwo', 'Bezpieczenstwo', 'oswiat', 'wyciag', 'pozniejsz']) {
  if (visibleFields.includes(fragment)) throw new Error(`Widoczne pola centralnej bazy zawierają tekst bez polskich znaków: ${fragment}`);
}

for (const marker of ['Centralne źródła i zasady MOW', 'Kontrola jakości odpowiedzi', 'Własne wpisy na tym urządzeniu', 'Co tu jest zapisane?']) {
  if (!listJs.includes(marker)) throw new Error(`Lista wiedzy nie zawiera objaśnienia: ${marker}`);
}

if (!contextJs.includes('formatKnowledgeExplanation')) throw new Error('Brak lokalnego objaśniania wpisów bazy wiedzy.');
if (!contextJs.includes('nie jest automatycznie zatwierdzony dla całego MOW')) {
  throw new Error('Lokalne wpisy nie mają ostrzeżenia o zakresie obowiązywania.');
}

console.log('OK: baza wiedzy ma polskie znaki, czytelne grupy i lokalne objaśnienia wpisów.');
