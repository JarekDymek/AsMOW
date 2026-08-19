import fs from 'node:fs';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('index.html');
const procedures = read('assets/js/data-procedures.js');
const procedureUi = read('assets/js/procedures.js');
const levels = read('assets/js/data-social-levels.js');
const levelUi = read('assets/js/social-levels.js');
const laws = read('assets/js/data-laws.js');
const aiConfig = read('assets/js/ai-config.js');
const backend = read('backend/server.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const forceCard = html.match(/id="law-force-card"[\s\S]*?id="law-kb-form-card"/)?.[0] || '';
assert(forceCard.includes('art. 122'), 'Karta przymusu musi wskazywać art. 122.');
assert(forceCard.includes('siły fizycznej'), 'Karta przymusu musi opisywać ograniczenie właściwe dla MOW.');
assert(!forceCard.includes('pas obezwładniający'), 'Karta MOW nie może podpowiadać pasa obezwładniającego.');
assert(!forceCard.includes('izolowanie'), 'Karta MOW nie może podpowiadać izolowania jako środka.');

assert(!procedures.includes('wartość > 500'), 'Procedura kradzieży nie może zależeć od progu 500 zł.');
assert(!procedures.includes('Art. 12 Ustawy o Nieletnich'), 'Usunięto nieaktualną podstawę z procedury ochronnej.');
assert(!procedures.includes('Rozp. RM z 22.02.2011'), 'Usunięto nieaktualne rozporządzenie o przymusie.');
assert(procedures.includes('Nie przeszukuj osoby podejrzewanej'), 'Procedura kradzieży musi zakazywać samodzielnego przeszukania.');
assert(procedures.includes('pomoc specjalistyczna mają pierwszeństwo'), 'Procedura samouszkodzenia musi stawiać pomoc przed oceną zachowania.');
assert(procedures.includes('p-krzywdzenie'), 'Brakuje procedury krzywdzenia wychowanka.');
assert(procedures.includes('p-wypadek'), 'Brakuje procedury wypadku.');

assert(procedureUi.includes('🚨 NA JUŻ'), 'Szczegóły procedury muszą mieć warstwę NA JUŻ.');
assert(procedureUi.includes('Dalsze działania'), 'Szczegóły procedury muszą mieć rozwijaną warstwę dalszych działań.');
assert(procedureUi.includes('Tego nie rób'), 'Szczegóły procedury muszą pokazywać zakazane działania.');

assert(levels.includes('mode:"event"'), 'Stopnie ujemne muszą używać trybu zdarzeniowego.');
assert(levels.includes('mode:"all"'), 'Stopnie dodatnie muszą używać łącznej oceny kryteriów.');
assert(!levels.includes('rażące naruszenie porządku'), 'Usunięto kryterium niepotwierdzone w regulaminie.');
assert(!levels.includes('poważne naruszenie regulaminu'), 'Usunięto kryterium niepotwierdzone w regulaminie.');
assert(levelUi.includes('summarizeStopChecklist'), 'Brakuje lokalnego arkusza oceny kryteriów.');

assert(laws.includes('LAW_SOURCE_META'), 'Rejestr prawa musi zawierać metadane źródeł.');
assert(laws.includes('https://eli.gov.pl/eli/DU/2026/163/ogl'), 'Brakuje urzędowego źródła ustawy o nieletnich.');
assert(aiConfig.includes("scope = currentAIScope"), 'Kontekst AI musi być ograniczany zakresem zakładki.');
assert(backend.includes('"NA JUŻ"'), 'Backend musi wymuszać warstwową odpowiedź kryzysową.');
assert(backend.includes('.slice(0, 4)'), 'Backend powinien wybierać tylko najbardziej trafne pliki wiedzy.');

console.log('OK: warstwy bezpieczeństwa, źródła i ograniczenie kontekstu AI.');
