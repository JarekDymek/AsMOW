import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

process.env.ASMOW_TEST_MODE = '1';
const { parseInternatScheduleHtml, buildActiveMailSchedule, getMailScheduleDocumentRevision, getScheduleBootstrapSince, settleWithin, selectLatestScheduleAttachments } = await import('./server.js');

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
const makeScheduleCandidate = (title, filename, sourceSentAt, mailUid) => ({
  item: { title, sourceSentAt, date: sourceSentAt.slice(0, 10), mailUid: String(mailUid) },
  parsed: {
    attachments: [{
      filename,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      content: Buffer.from('test')
    }]
  }
});

const selectedRealistic = selectLatestScheduleAttachments([
  makeScheduleCandidate('Grafik internat 14-20 września', '3. 14-20.09.2026r..docx', '2026-09-06T18:44', 100),
  makeScheduleCandidate('korekta grafiku na bieżący tydzień Gr 7', '3. 14-20.09.2026r. (1).docx', '2026-09-16T13:15', 120),
  makeScheduleCandidate('Grafik zespołu 14-20.09.2026r.', 'grafik zespół 14-20.09.2026r..docx', '2026-09-17T08:00', 130),
  makeScheduleCandidate('Grafik internat 21-28 września 2026r.', '4. 21-27.09.2026r..docx', '2026-09-18T12:00', 140)
]);
assert.equal(selectedRealistic.length, 2);
assert.equal(selectedRealistic[0].weekStart, '2026-09-14');
assert.equal(selectedRealistic[0].sourceMailUid, '120');
assert.match(selectedRealistic[0].filename, /14-20/);
assert.equal(selectedRealistic[1].weekStart, '2026-09-21');
assert.equal(selectedRealistic[1].sourceMailUid, '140');
assert.ok(selectedRealistic.every(entry => entry.scheduleKind !== 'team'));

const serverSource = fs.readFileSync(new URL('./server.js', import.meta.url), 'utf8');
assert.doesNotMatch(
  serverSource,
  /if\s*\(existing\?\.promise\)\s*return\s+existing\.promise/,
  'Żądanie użytkownika nie może blokować się na pełnym skanie cache.'
);
assert.match(serverSource, /SCHEDULE_DASHBOARD_CACHE_MS\s*=\s*15\s*\*\s*60_000/);
assert.match(serverSource, /getOrStartScheduleBootstrap/);
assert.match(serverSource, /startScheduleDashboardRefresh/);
assert.match(serverSource, /settleWithin\(refreshPromise,\s*SCHEDULE_FORCE_REFRESH_WAIT_MS\)/);

const slowResult = await settleWithin(new Promise(resolve => setTimeout(() => resolve('late'), 80)), 10);
assert.equal(slowResult.done, false);
const fastResult = await settleWithin(Promise.resolve('ok'), 100);
assert.equal(fastResult.done, true);
assert.equal(fastResult.value, 'ok');

const bootstrapSince = getScheduleBootstrapSince();
assert.match(bootstrapSince, /^\d{4}-\d{2}-\d{2}$/);

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
