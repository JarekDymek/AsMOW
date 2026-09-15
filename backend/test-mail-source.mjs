import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { simpleParser } from 'mailparser';
import { DIRECTOR_EMAIL, FORWARDER_EMAIL, resolveDirectorMail, canReadDirectorAttachment, directorMailFingerprint, searchDirectorMail } from './mail-source.js';

const original = `Od: Dariusz Górski <${DIRECTOR_EMAIL}>\nDate: pt., 11 wrz 2026 o 15:10\nPozdrawiam`;
const forwarded = text => ({
  from: { value: [{ address: FORWARDER_EMAIL }] }, subject: 'Fwd: Korekta grafiku',
  date: new Date('2026-09-15T07:48:00Z'), text,
  attachments: [{ filename: 'grafik.docx', content: Buffer.from('schedule') }]
});
const single = forwarded(original);
const nested = forwarded(`---------- Forwarded message ---------\nOd: Jarosław Dymek <${FORWARDER_EMAIL}>\nDate: wt., 15 wrz 2026 o 09:47\n\n${original}`);
const resolved = resolveDirectorMail(nested);
assert.equal(resolved.source, DIRECTOR_EMAIL);
assert.equal(resolved.originalDate, '2026-09-11');
assert.equal(resolved.forwardedBy, FORWARDER_EMAIL);
assert.equal(directorMailFingerprint(single, resolveDirectorMail(single)), directorMailFingerprint(nested, resolved));
const changed = forwarded(original);
changed.attachments[0].content = Buffer.from('corrected schedule');
assert.notEqual(directorMailFingerprint(changed, resolved), directorMailFingerprint(nested, resolved));
assert.ok(canReadDirectorAttachment(nested, { internalDate: new Date() }));
const direct = { ...single, from: { value: [{ address: DIRECTOR_EMAIL }] }, text: 'Pozdrawiam' };
assert.ok(resolveDirectorMail(direct));
for (const parsed of [
  { ...single, from: { value: [{ address: 'stranger@example.org', name: DIRECTOR_EMAIL }] } },
  { ...single, from: { value: [{ address: `${FORWARDER_EMAIL}.evil.org` }] } },
  forwarded(`Wspomniany adres: ${DIRECTOR_EMAIL}`),
  forwarded(`Od: ${DIRECTOR_EMAIL}\nBrak daty`),
  forwarded(`Od: <${DIRECTOR_EMAIL}.evil.org>\nDate: 2026-09-11`),
  forwarded(`Od: Other <other@example.org>\nDate: 2026-09-11\n${original}`)
]) {
  assert.equal(resolveDirectorMail(parsed), null);
  assert.equal(canReadDirectorAttachment(parsed, { internalDate: new Date() }), false);
}
const html = { ...single, text: '', html: original.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') };
assert.equal(resolveDirectorMail(html).source, DIRECTOR_EMAIL);
const parsedMime = await simpleParser(`From: <${FORWARDER_EMAIL}>\r\nSubject: Fwd: Grafik\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${original}`);
assert.ok(resolveDirectorMail(parsedMime));
let searches = [];
await searchDirectorMail({ search: async query => { searches.push(query); return [1, 2]; } }, new Date());
assert.deepEqual(searches[0].or, [{ from: DIRECTOR_EMAIL }, { from: FORWARDER_EMAIL }]);

// Exercise the real frontend merge and migration settings without touching user data.
const memory = new Map();
const sandbox = { localStorage: { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) },
  document: { getElementById: () => null }, CURRENT_INFO_SYNC_KEY: 'sync', CURRENT_INFO_KEY: 'info',
  currentInfoItems: [], isTestMode: () => false };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL('../assets/js/current-info.js', import.meta.url), 'utf8'), sandbox);
sandbox.renderCurrentInfoList = () => {};
sandbox.setCurrentInfoStatus = () => {};
sandbox.normalizeForCurrentInfoSearch = value => value.toLowerCase();
const item = { id: 'a', mailUid: '10', mailFingerprint: 'same-original', title: 'Grafik', topic: 'grafik', body: 'Treść', date: '2026-09-11', attachments: Array.from({ length: 20 }, (_, i) => ({ id: String(i), name: `file-${i}.docx` })) };
sandbox.mergeCurrentInfoItems([item, { ...item, id: 'b', mailUid: '11' }]);
assert.equal(sandbox.currentInfoItems.length, 1);
assert.equal(sandbox.currentInfoItems[0].attachments.length, 20);
sandbox.saveCurrentInfoSyncSettings({ sourceRevision: 'director-forwarding-v1' });
sandbox.saveCurrentInfoSyncSettings();
assert.equal(sandbox.getCurrentInfoSyncSettings().sourceRevision, 'director-forwarding-v1');
sandbox.isTestMode = () => true;
sandbox.saveCurrentInfoSyncSettings();
assert.equal(sandbox.getCurrentInfoSyncSettings().sourceRevision, 'director-forwarding-v1');
console.log('OK: forwarding, exact senders, attachment access, deduplication, all attachments and sync migration.');
