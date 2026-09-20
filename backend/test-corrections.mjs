import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
process.env.ASMOW_TEST_MODE = '1';
const { parseInternatScheduleHtml, buildActiveMailSchedule } = await import('./server.js');
const context = vm.createContext({ console, Date });
vm.runInContext(fs.readFileSync(new URL('../assets/js/harmonogram.js', import.meta.url), 'utf8'), context);
const record = (employee, group, from = '06:00', to = '14:00') => ({ date: '2026-09-14', employee, group, from, to });
const base = { id: 'base', weekStart: '2026-09-14', sourceSentAt: '2026-09-10T15:00', sourceDate: '2026-09-10', sourceMailUid: '999', scheduleKind: 'internat', records: [record('Dymek', 'VI'), record('Other', 'VII')] };
const correction = { id: 'new', weekStart: base.weekStart, sourceSentAt: '2026-09-11T15:10', sourceDate: '2026-09-11', sourceMailUid: '2', isCorrection: true, scheduleKind: 'unknown', records: [record('Replacement', 'VI')], coveredScopes: [{ date: '2026-09-14', group: 'VI' }] };
let active = context.buildActiveInternatSchedule([base, correction], base.weekStart);
assert.deepEqual(Array.from(active.records, r => r.employee).sort(), ['Other', 'Replacement']);
const dayOff = { ...correction, id: 'off', sourceSentAt: '2026-09-11T16:00', sourceMailUid: '1', records: [] };
active = context.buildActiveInternatSchedule([base, correction, dayOff], base.weekStart);
assert.deepEqual(Array.from(active.records, r => r.employee), ['Other']);
const restoredNewBase = { ...base, id: 'later', sourceSentAt: '2026-09-12T10:00', sourceDate: '2026-09-12' };
active = context.buildActiveInternatSchedule([base, correction, restoredNewBase], base.weekStart);
assert.ok(active.records.some(r => r.employee === 'Dymek'));
const partial = { ...correction, coveredScopes: [{ date: '2026-09-14', employee: 'Dymek', group: '' }], records: [] };
active = context.buildActiveInternatSchedule([base, partial], base.weekStart);
assert.deepEqual(Array.from(active.records, r => r.employee), ['Other']);

// Backend Render: najnowszy pełny dokument jest migawką całego tygodnia,
// więc nie wolno mieszać go ze starszą pełną wersją.
const fullBase = {
  ...base,
  id: 'full-base',
  hasCompleteWeek: true,
  isCorrection: false,
  sourceSentAt: '2026-09-06T20:44',
  records: [record('Dymek', 'VI'), record('Old VII', 'VII')]
};
const fullCorrection = {
  ...base,
  id: 'full-correction',
  hasCompleteWeek: true,
  isCorrection: true,
  sourceSentAt: '2026-09-16T13:15',
  records: [record('Dymek', 'VI', '18:00', '22:00'), record('New VII', 'VII')]
};
let mailActive = buildActiveMailSchedule([fullBase, fullCorrection], base.weekStart);
assert.deepEqual(
  mailActive.records.map(r => [r.employee, r.group, r.from, r.to]).sort(),
  [
    ['Dymek', 'VI', '18:00', '22:00'],
    ['New VII', 'VII', '06:00', '14:00']
  ].sort()
);
assert.deepEqual(mailActive.sources.map(source => source.id), ['full-correction']);

const parsed = parseInternatScheduleHtml('<p>INTERNAT 14.09 - 20.09.2026</p><table><tr><td>Gr</td><td>PONIEDZIAŁEK 14.09.</td></tr><tr><td>VI</td><td>wolne</td></tr></table>');
assert.ok(parsed.coveredScopes.some(s => s.date === '2026-09-14' && s.group === 'VI'));
assert.equal(parsed.records.length, 0);
const schoolLabels = parseInternatScheduleHtml('<p>INTERNAT 14.09 - 20.09.2026</p><table><tr><td>Gr</td><td>PONIEDZIAŁEK 14.09.</td></tr><tr><td><p>VI</p><p>Kl. 5</p></td><td>6:00–14:00<p>Dymek</p></td></tr><tr><td>IV<br>I Br</td><td>14:00–22:00<p>Kowalska</p></td></tr></table>');
assert.ok(schoolLabels.records.some(r => r.group === 'VI' && r.employee === 'Dymek'));
assert.ok(schoolLabels.records.some(r => r.group === 'IV' && r.employee === 'Kowalska'));
assert.ok(schoolLabels.coveredScopes.every(s => !s.employee));
console.log('OK: newer corrections replace people and days off, preserve other groups and use original chronology.');

const weeklySource = fs.readFileSync(new URL('../assets/js/weekly-plan.js', import.meta.url), 'utf8');
const fetchStart = weeklySource.indexOf('async function fetchWeeklyPlan(options = {})');
const fetchEnd = weeklySource.indexOf('\nfunction rebuildWeeklyPlanFromMail', fetchStart);
assert.ok(fetchStart >= 0 && fetchEnd > fetchStart);
const fetchBody = weeklySource.slice(fetchStart, fetchEnd);
assert.match(fetchBody, /fetchMailScheduleDashboard/);
assert.doesNotMatch(fetchBody, /syncCurrentInfoMail/);
assert.ok(fetchBody.indexOf('fetchMailScheduleDashboard') < fetchBody.indexOf('/api/weekly-plan'));
console.log('OK: weekly view uses Render mail dashboard first and only then Apps Script fallback.');
