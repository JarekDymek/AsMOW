import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

process.env.ASMOW_TEST_MODE = '1';


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

// Runtime frontend accepts only the active, verified snapshot selected by Mój Plan.
const ready = { ...fullCorrection, sourceType: 'mow-moj-plan-v1', active: true, verified: true };
let active = context.buildActiveInternatSchedule([base, partialCorrection, ready, teamDocument], base.weekStart);
assert.deepEqual(Array.from(active.records, r => r.employee).sort(), ['Dymek', 'New VII']);
assert.deepEqual(Array.from(active.sources, s => s.id), ['full-correction']);
assert.equal(active.requiresVerification, false);
assert.equal(context.buildActiveInternatSchedule([base, partialCorrection], base.weekStart).records.length, 0);
assert.equal(context.buildActiveInternatSchedule([{...ready, verified: false}], base.weekStart).records.length, 0);
assert.equal(context.buildActiveInternatSchedule([ready, {...ready, id:'ambiguous'}], base.weekStart).records.length, 0);

console.log('OK: frontend przyjmuje wyłącznie zweryfikowany aktywny grafik Mój Plan.');
