import assert from 'node:assert/strict';

process.env.ASMOW_TEST_MODE = '1';

const {
  decodeInternatHtmlCell,
  extractInternatEmployeeCandidates,
  parseInternatScheduleHtml
} = await import('./server.js');

const diagnosticHtml = `
  <p>Godziny pracy zespołu diagnostyczno – terapeutycznego</p>
  <p>w okresie 17.08 - 23.08.2026r.</p>
  <table><tr><td></td><td>Poniedziałek</td></tr>
  <tr><td><p>Iwona</p><p>Wojtuszkiewicz</p><p>40 h</p></td><td>7<sup>00</sup>-15<sup>00</sup></td></tr></table>`;
const diagnostic = parseInternatScheduleHtml(diagnosticHtml, {
  sourceAttachment: '51. 17- 23.08.2026r.docx'
});
assert.equal(diagnostic.weekStart, '2026-08-17');
assert.equal(diagnostic.ignored, true);
assert.equal(diagnostic.records.length, 0);

const internatHtml = `
  <p>Godziny pracy wychowawców internatu</p>
  <p>w okresie 17.08 - 23.08.2026r.</p>
  <table><tr><td></td><td>Poniedziałek</td><td>Wtorek</td></tr>
  <tr><td><p>Dariusz</p><p>Górski</p><p>24 h</p></td>
  <td><p>Gr. VI 7<sup>00</sup>-15<sup>00</sup></p></td><td>wolne</td></tr></table>`;
const internat = parseInternatScheduleHtml(internatHtml, {
  sourceAttachment: '51. 17- 23.08.2026r.docx'
});
assert.equal(internat.ignored, false);
assert.deepEqual(internat.records.map(record => ({
  employee: record.employee,
  date: record.date,
  from: record.from,
  to: record.to,
  group: record.group
})), [{
  employee: 'Dariusz Górski',
  date: '2026-08-17',
  from: '07:00',
  to: '15:00',
  group: 'VI'
}]);

assert.equal(decodeInternatHtmlCell('7<sup>00</sup>-15<sup>30</sup>'), '7:00-15:30');
assert.deepEqual(extractInternatEmployeeCandidates('Dariusz\nGórski\n24 h'), ['Dariusz Górski']);
assert.deepEqual(
  extractInternatEmployeeCandidates('Dembiński 07:00-15:00\nChlebowski 15:00-22:00'),
  ['Dembiński', 'Chlebowski']
);

console.log('OK: parser grafików rozpoznaje zapis indeksowy i odrzuca grafik innego zespołu.');
