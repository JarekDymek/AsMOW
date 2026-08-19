process.env.ASMOW_TEST_MODE = '1';

const {
  dedupeLegalCandidates,
  normalizeLegalAct
} = await import('../backend/legal-updates.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const normalized = normalizeLegalAct({
  ELI: 'DU/2026/163',
  displayAddress: 'Dz.U. 2026 poz. 163',
  title: 'Tekst jednolity ustawy',
  status: 'obowiązujący',
  inForce: 'IN_FORCE',
  changeDate: '2026-02-17T09:52:31',
  promulgation: '2026-02-12'
}, '1');

assert(normalized.key === '1', 'Monitorowany akt powinien zachować klucz interfejsu.');
assert(normalized.url === 'https://eli.gov.pl/eli/DU/2026/163/ogl', 'Adres źródła musi prowadzić do urzędowego ELI.');
assert(normalized.inForce === 'IN_FORCE', 'Status obowiązywania powinien zostać zachowany.');

const invalid = normalizeLegalAct({ ELI: 'https://example.com/not-eli' });
assert(invalid.url === '', 'Nieprawidłowy identyfikator nie może tworzyć zewnętrznego odsyłacza.');

const unique = dedupeLegalCandidates([
  normalized,
  { ...normalized, title: 'Duplikat' },
  normalizeLegalAct({ ELI: 'DU/2026/820', promulgation: '2026-06-30' })
]);
assert(unique.length === 2, 'Lista publikacji powinna usuwać duplikaty ELI.');
assert(unique[0].eli === 'DU/2026/820', 'Najnowsza publikacja powinna być pierwsza.');

console.log('OK: kontrola źródeł ELI normalizuje, filtruje i porządkuje akty.');
