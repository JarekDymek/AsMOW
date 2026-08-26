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

const multiShiftHtml = `
  <p>INTERNAT</p><p>17.08 - 23.08.2026r.</p><p>51.</p>
  <table>
    <tr><td>Gr</td><td>PONIEDZIAŁEK 17.08.</td><td>WTOREK 18.08.</td><td>ŚRODA 19.08.</td>
      <td>CZWARTEK 20.08.</td><td>PIĄTEK 21.08.</td><td>SOBOTA 22.08.</td><td>NIEDZIELA 23.08.</td><td>NAZWISKO WYCHOWAWCY</td></tr>
    <tr><td>GRUPA A</td>
      <td><p>6<sup>00</sup>-14<sup>00</sup></p><p>Kozdęba</p><p>14<sup>00</sup>-17<sup>00</sup></p><p>Pawłowski</p><p>17<sup>00</sup>-22<sup>00</sup></p><p>Szaruga</p></td>
      <td><p>6<sup>00</sup>-8<sup>00</sup></p><p>Ochadek</p><p>8<sup>00</sup>-10<sup>00</sup></p><p>Górski</p><p>10<sup>00</sup>-13<sup>00</sup></p><p>Kozdęba</p></td>
      <td></td><td></td><td><p>19<sup>00</sup>-22<sup>00</sup></p><p>Kozdęba</p></td><td></td><td></td>
      <td><p>1. Ochadek - 26</p><p>2. Kozdęba - 26</p><p>3. Pawłowski - 26</p></td></tr>
    <tr><td>NOC</td>
      <td><p>24<sup>00</sup>-6<sup>00</sup></p><p>Dembiński</p><p>22<sup>00</sup>-6<sup>00</sup></p><p>Ochadek</p></td>
      <td><p>22<sup>00</sup>-6<sup>00</sup></p><p>Ochadek</p></td><td></td><td></td><td></td><td></td><td><p>22<sup>00</sup>-24<sup>00</sup></p><p>Pawłowski</p></td>
      <td>Zemlik - 06.08.-03.09.2026r. wolne</td></tr>
  </table>`;
const multiShift = parseInternatScheduleHtml(multiShiftHtml, {
  sourceAttachment: '51. 17- 23.08.2026r.docx'
});
assert.deepEqual(
  multiShift.records
    .filter(record => record.employee === 'Kozdęba')
    .map(record => ({ date: record.date, from: record.from, to: record.to, group: record.group })),
  [
    { date: '2026-08-17', from: '06:00', to: '14:00', group: 'A' },
    { date: '2026-08-18', from: '10:00', to: '13:00', group: 'A' },
    { date: '2026-08-21', from: '19:00', to: '22:00', group: 'A' }
  ]
);
assert.ok(multiShift.records.some(record => record.employee === 'Górski' && record.date === '2026-08-18'));
assert.ok(multiShift.records.some(record => record.employee === 'Dembiński' && record.date === '2026-08-17' && record.from === '00:00'));
assert.ok(multiShift.records.some(record => record.employee === 'Dembiński' && record.group === 'NOC'));

const schoolYearNames = ['Dembiński', 'Ochociński', 'Kowalska', 'Kuligowska', 'Mostowy', 'Pawłowski', 'Polkowski', 'Potaczała'];
const schoolYearRows = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((group, index) => `
  <tr><td>${group}</td>
    <td><p>6<sup>00</sup>-14<sup>00</sup></p><p>${schoolYearNames[index]}</p></td>
    <td>${group === 'VI' ? '<p>14<sup>30</sup>-22<sup>00</sup></p><p>Dymek</p>' : 'wolne'}</td>
    <td>wolne</td><td>wolne</td><td>wolne</td><td>wolne</td><td>wolne</td>
    <td><p>Dymek 54 h</p><p>600-1400 wpis zestawienia bez przypisanego dnia</p></td></tr>`).join('');
const schoolYearHtml = `
  <p>Godziny pracy wychowawców internatu</p>
  <p>w okresie 31.08 - 06.09.2026r.</p>
  <table>
    <tr><td>Gr</td><td>PONIEDZIAŁEK 31.08.</td><td>WTOREK 01.09.</td><td>ŚRODA 02.09.</td>
      <td>CZWARTEK 03.09.</td><td>PIĄTEK 04.09.</td><td>SOBOTA 05.09.</td><td>NIEDZIELA 06.09.</td><td>ZESTAWIENIE</td></tr>
    ${schoolYearRows}
    <tr><td>NOC</td>
      <td><p>22<sup>00</sup>-24<sup>00</sup></p><p>Głowacki</p></td>
      <td><p>22<sup>00</sup>-6<sup>00</sup></p><p>Ochociński</p></td>
      <td></td><td></td><td></td><td></td><td></td><td>Dymek 54 h</td></tr>
  </table>`;
const schoolYear = parseInternatScheduleHtml(schoolYearHtml, {
  sourceAttachment: '1. 31.08.-06.09.2026r..docx'
});
assert.equal(schoolYear.weekStart, '2026-08-31');
assert.equal(schoolYear.hasCompleteWeek, true);
assert.equal(schoolYear.ambiguous, false);
assert.deepEqual(
  schoolYear.records.filter(record => record.employee === 'Dymek').map(record => ({ date: record.date, from: record.from, to: record.to, group: record.group })),
  [{ date: '2026-09-01', from: '14:30', to: '22:00', group: 'VI' }]
);
assert.ok(schoolYear.records.some(record => record.employee === 'Głowacki' && record.group === 'NOC'));

const invalidLongDayHtml = `
  <p>Godziny pracy wychowawców internatu</p><p>31.08 - 06.09.2026r.</p>
  <table><tr><td>Gr</td><td>PONIEDZIAŁEK 31.08.</td></tr>
  <tr><td>VI</td><td><p>0-16 Dymek</p><p>16-24 Dymek</p><p>0-2 Dymek</p></td></tr></table>`;
const invalidLongDay = parseInternatScheduleHtml(invalidLongDayHtml, { sourceAttachment: '1. 31.08.-06.09.2026r..docx' });
assert.equal(invalidLongDay.ambiguous, true);
assert.match(invalidLongDay.warning, /ponad 24 godziny/);

assert.equal(decodeInternatHtmlCell('7<sup>00</sup>-15<sup>30</sup>'), '7:00-15:30');
assert.deepEqual(extractInternatEmployeeCandidates('Dariusz\nGórski\n24 h'), ['Dariusz Górski']);
assert.deepEqual(
  extractInternatEmployeeCandidates('Dembiński 07:00-15:00\nChlebowski 15:00-22:00'),
  ['Dembiński', 'Chlebowski']
);

console.log('OK: parser grafików rozpoznaje tryb wakacyjny i szkolny, waliduje godziny oraz odrzuca grafik innego zespołu.');
