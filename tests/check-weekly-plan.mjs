import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({ console, Date });
vm.runInContext(fs.readFileSync(new URL('../assets/js/weekly-plan.js', import.meta.url), 'utf8'), context);
// Merge is tested independently of display formatting.
context.getWeeklyIdentity = week => week.dateFrom;
context.classifyWeeklyWeeks = weeks => weeks;
const meta = { schedulePolicyRevision: 'latest-document-per-week-v2', backendVersion: 'parser-v3' };
const week = { dateFrom: '2026-09-21', sourceVersion: 'same-document', days: [{ hoursDay: 99 }], authoritativeDocument: { id: 'doc4', sourceSentAt: '2026-09-18T12:00:00Z' } };
const plan = weeks => ({ educator: 'Dymek', meta: { ...meta }, weeks });
const corrected = { ...week, days: [{ hoursDay: 6 }] };
assert.equal(context.mergeStableWeeklyPlan(plan([week]), plan([corrected])).weeks[0].days[0].hoursDay, 6, 'Poprawiony odczyt tego samego dokumentu musi zastąpić błędny cache');
const reparsed = { ...corrected, sourceVersion: 'same-document-new-parser' };
assert.equal(context.mergeStableWeeklyPlan(plan([week]), plan([reparsed])).weeks[0].sourceVersion, reparsed.sourceVersion);
const older = { ...week, sourceVersion: 'old-file', authoritativeDocument: { id: 'old', sourceSentAt: '2026-09-17T12:00:00Z' } };
assert.equal(context.mergeStableWeeklyPlan(plan([corrected]), plan([older])).weeks[0].days[0].hoursDay, 6, 'Starszy dokument nie może nadpisać korekty');
const upgraded = plan([{ dateFrom: '2026-09-21', days: [], sourceVersion: '' }]);
upgraded.meta.backendVersion = 'parser-v4';
assert.equal(context.mergeStableWeeklyPlan(plan([week]), upgraded).weeks[0].sourceVersion, '', 'Nowy backend musi móc usunąć odrzucone źródło');
console.log('OK: poprawiony odczyt zastępuje cache, a starszy dokument nie nadpisuje korekty.');
