import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

process.env.ASMOW_TEST_MODE = '1';
const { parseInternatScheduleHtml, buildActiveMailSchedule, getMailScheduleDocumentRevision } = await import('./server.js');

const context = vm.createContext({ console, Date });
vm.runInContext(fs.readFileSync(new URL('../assets/js/harmonogram.js', import.meta.url), 'utf8'), context);

const record = (employee, group, from = '06:00', to = '14:00', date = '2026-09-14') => ({
  date, sourceDay: date, employee, group, from, to
});

const base = {
  id: 'base',
  weekStart: '2026-09-14',
  sourceSentAt: '2026-09-06T20:44',
  sourceDate: '2026-09-06',
  sourceMailUid: '100',
  sourceAttachment: '3. 14-20.09.2026r..docx',
  sourceAttachmentId: 'base-att',
  scheduleKind: 'internat',
  hasCompleteWeek: true,
  isCorrection: false,
  ambiguous: false,
  records: [record('Dymek', 'VI'), record('Other', 'VII')]
};

const partialCorrection = {
  ...base,
  id: 'partial',
  sourceSentAt: '2026-09-15T09:48',
  sourceDate: '2026-09-15',
  sourceMailUid: '110',
  sourceAttachment: 'korekta-czesciowa.docx',
  sourceAttachmentId: 'partial-att',
  hasCompleteWeek: false,
  isCorrection: true,
  ambiguous: true,
  records: [record('Replacement', 'VI')],
  coveredScopes: [{ date: '2026-09-14', group: 'VI' }]
};

const fullCorrection = {
  ...base,
  id: 'full-correction',
  sourceSentAt: '2026-09-16T13:15',
  sourceDate: '2026-09-16',
  sourceMailUid: '120',
  sourceAttachment: '3. 14-20.09.2026r. (1).docx',
  sourceAttachmentId: 'full-att',
  hasCompleteWeek: true,
  isCorrection: true,
  ambiguous: false,
  records: [
    record('Dymek', 'VI', '18:00', '22:00', '2026-09-18'),
    record('New VII', 'VII')
  ]
};

const teamDocument = {
  ...fullCorrection,
  id: 'team-newer',
  sourceSentAt: '2026-09-17T13:35',
  sourceMailUid: '130',
  sourceAttachment: 'Grafik Zespolu.docx',
  sourceAttachmentId: 'team-att',
  scheduleKind: 'team',
  records: [record('Dymek', 'TEAM', '00:00', '23:00')]
};

// Frontendowy indeks Asystenta: zawsze dokładnie jeden najnowszy dokument internatu.
let active = context.buildActiveInternatSchedule([base, partialCorrection], base.weekStart);
assert.deepEqual(Array.from(active.records, r => r.employee), ['Replacement']);
assert.equal(active.requiresVerification, true);
assert.deepEqual(Array.from(active.sources, s => s.id), ['partial']);

active = context.buildActiveInternatSchedule([base, partialCorrection, fullCorrection], base.weekStart);
assert.deepEqual(Array.from(active.records, r => r.employee).sort(), ['Dymek', 'New VII']);
assert.deepEqual(Array.from(active.sources, s => s.id), ['full-correction']);
assert.equal(active.requiresVerification, false);

active = context.buildActiveInternatSchedule([base, fullCorrection, teamDocument], base.weekStart);
assert.deepEqual(Array.from(active.sources, s => s.id), ['full-correction']);
assert.ok(active.records.every(r => r.group !== 'TEAM'));

// Backend Render: identyczna polityka.
let mailActive = buildActiveMailSchedule([base, partialCorrection], base.weekStart);
assert.deepEqual(mailActive.records.map(r => r.employee), ['Replacement']);
assert.equal(mailActive.requiresVerification, true);
assert.deepEqual(mailActive.sources.map(s => s.id), ['partial']);

mailActive = buildActiveMailSchedule([base, partialCorrection, fullCorrection, teamDocument], base.weekStart);
assert.deepEqual(
  mailActive.records.map(r => [r.employee, r.group, r.from, r.to]).sort(),
  [
    ['Dymek', 'VI', '18:00', '22:00'],
    ['New VII', 'VII', '06:00', '14:00']
  ].sort()
);
assert.deepEqual(mailActive.sources.map(s => s.id), ['full-correction']);
assert.ok(mailActive.sourceVersion);

// Ta sama wiadomość/ten sam załącznik musi mieć identyczną wersję nawet,
 // jeśli zmieni się implementacja parsera i rekordy zostaną odczytane inaczej.
 const sameSourceDifferentParse = {
   ...fullCorrection,
   records: [record('Inny wynik parsera', 'VI', '01:00', '02:00')]
 };
 assert.equal(
   getMailScheduleDocumentRevision(fullCorrection),
   getMailScheduleDocumentRevision(sameSourceDifferentParse)
 );
 const newAttachment = { ...fullCorrection, id: 'full-correction-new-file', sourceAttachmentId: 'new-att' };
 assert.notEqual(
   getMailScheduleDocumentRevision(fullCorrection),
   getMailScheduleDocumentRevision(newAttachment)
 );

// Kolejność tablicy wejściowej nie może wpływać na wynik.
const shuffled = buildActiveMailSchedule([teamDocument, fullCorrection, base, partialCorrection], base.weekStart);
assert.deepEqual(shuffled.records, mailActive.records);
assert.equal(shuffled.sourceVersion, mailActive.sourceVersion);

// Jeżeli najnowszy dokument jest pusty/nieczytelny, nie wolno przywracać starszego grafiku.
const brokenLatest = {
  ...fullCorrection,
  id: 'broken-latest',
  sourceSentAt: '2026-09-18T10:00',
  sourceMailUid: '140',
  sourceAttachment: 'korekta-uszkodzona.docx',
  sourceAttachmentId: 'broken-att',
  hasCompleteWeek: false,
  ambiguous: true,
  records: []
};
const broken = buildActiveMailSchedule([base, fullCorrection, brokenLatest], base.weekStart);
assert.deepEqual(broken.records, []);
assert.deepEqual(broken.sources.map(s => s.id), ['broken-latest']);
assert.equal(broken.requiresVerification, true);

const parsed = parseInternatScheduleHtml(
  '<p>INTERNAT 14.09 - 20.09.2026</p><table><tr><td>Gr</td><td>PONIEDZIAŁEK 14.09.</td></tr><tr><td>VI</td><td>wolne</td></tr></table>'
);
assert.ok(parsed.coveredScopes.some(s => s.date === '2026-09-14' && s.group === 'VI'));
assert.equal(parsed.records.length, 0);

const schoolLabels = parseInternatScheduleHtml(
  '<p>INTERNAT 14.09 - 20.09.2026</p><table><tr><td>Gr</td><td>PONIEDZIAŁEK 14.09.</td></tr><tr><td><p>VI</p><p>Kl. 5</p></td><td>6:00–14:00<p>Dymek</p></td></tr><tr><td>IV<br>I Br</td><td>14:00–22:00<p>Kowalska</p></td></tr></table>'
);
assert.ok(schoolLabels.records.some(r => r.group === 'VI' && r.employee === 'Dymek'));
assert.ok(schoolLabels.records.some(r => r.group === 'IV' && r.employee === 'Kowalska'));

// Grafik w Asystencie musi korzystać tylko z Render; żadnego Apps Script ani lokalnej odbudowy jako fallback.
const weeklySource = fs.readFileSync(new URL('../assets/js/weekly-plan.js', import.meta.url), 'utf8');
const fetchStart = weeklySource.indexOf('async function fetchWeeklyPlan(options = {})');
const fetchEnd = weeklySource.indexOf('\nasync function rebuildWeeklyPlanFromMail', fetchStart);
assert.ok(fetchStart >= 0 && fetchEnd > fetchStart);
const fetchBody = weeklySource.slice(fetchStart, fetchEnd);
assert.match(fetchBody, /fetchMailScheduleDashboard/);
assert.doesNotMatch(fetchBody, /\/api\/weekly-plan/);
assert.doesNotMatch(fetchBody, /Apps Script fallback/);
assert.doesNotMatch(fetchBody, /syncCurrentInfoMail/);

const setStart = weeklySource.indexOf('function setWeeklyPlanFromPayload');
const setEnd = weeklySource.indexOf('\nfunction ', setStart + 20);
const setBody = weeklySource.slice(setStart, setEnd);
assert.doesNotMatch(setBody, /mergeWeeklyPlans\(weeklyPlan/);

console.log('OK: jeden najnowszy dokument internatu na tydzień, bez scalania, bez Apps Script fallback i bez zależności od kolejności skanu.');
