import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { simpleParser } from 'mailparser';
import { DIRECTOR_EMAIL, FORWARDER_EMAIL, ARCHIVE_DIRECTOR_EMAIL, resolveDirectorMail, canReadDirectorAttachment, directorMailFingerprint, searchDirectorMail } from './mail-source.js';
process.env.ASMOW_TEST_MODE = '1';
const { resolveCurrentInfoMailbox, collectImapAttachmentMetadata, buildBootstrapMetadataCandidate, formatBootstrapMailTimestamp, extractInternatWeekStart, selectLatestScheduleAttachments, chooseBootstrapMessageUids } = await import('./server.js');

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
assert.ok(resolveDirectorMail(direct, { from: 'stary-adres@example.com' }));
const archiveDirect = {
  ...single,
  from: { value: [{ address: ARCHIVE_DIRECTOR_EMAIL }] },
  date: new Date('2026-09-06T18:44:20Z'),
  text: 'Grafik internat 14-20 września'
};
assert.ok(resolveDirectorMail(archiveDirect));
const archiveTooLate = { ...archiveDirect, date: new Date('2026-09-17T10:00:00Z') };
assert.equal(resolveDirectorMail(archiveTooLate), null);
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
const searchResult = await searchDirectorMail({
  search: async query => {
    searches.push(query);
    return query.from === ARCHIVE_DIRECTOR_EMAIL ? [2, 3] : [1, 2];
  }
}, new Date());
assert.deepEqual(searches.map(query => query.from), [
  DIRECTOR_EMAIL,
  FORWARDER_EMAIL,
  ARCHIVE_DIRECTOR_EMAIL
]);
assert.ok(searches.every(query => !Object.prototype.hasOwnProperty.call(query, 'subject')));

searches = [];
await searchDirectorMail({
  search: async query => {
    searches.push(query);
    return [];
  }
}, new Date(), { from: 'stary-adres@example.com' });
assert.deepEqual(searches.map(query => query.from), [
  DIRECTOR_EMAIL,
  'stary-adres@example.com',
  FORWARDER_EMAIL,
  ARCHIVE_DIRECTOR_EMAIL
]);
assert.deepEqual(searchResult, [1, 2, 3]);

searches = [];
await searchDirectorMail({
  search: async query => {
    searches.push(query);
    return [];
  }
}, new Date(), { scheduleOnly: true });
assert.equal(searches.length, 3);
assert.ok(searches.every(query => query.subject === 'grafik'));
assert.deepEqual(searches.map(query => query.from), [
  DIRECTOR_EMAIL,
  FORWARDER_EMAIL,
  ARCHIVE_DIRECTOR_EMAIL
]);

assert.equal(
  await resolveCurrentInfoMailbox({
    list: async () => [
      { path: 'INBOX', specialUse: '\\Inbox' },
      { path: '[Gmail]/Wszystkie', specialUse: '\\All' }
    ]
  }, 'INBOX'),
  '[Gmail]/Wszystkie'
);
assert.equal(
  await resolveCurrentInfoMailbox({ list: async () => [{ path: 'INBOX' }] }, 'INBOX'),
  'INBOX'
);

const bodyStructure = {
  childNodes: [
    { type: 'text/plain' },
    {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      disposition: 'attachment',
      dispositionParameters: { filename: '4. 21- 27. 09.2026r..docx' }
    }
  ]
};
assert.deepEqual(
  collectImapAttachmentMetadata(bodyStructure).map(item => item.filename),
  ['4. 21- 27. 09.2026r..docx']
);
const metadataCandidate = buildBootstrapMetadataCandidate({
  uid: 101,
  internalDate: new Date('2026-09-21T08:00:00Z'),
  envelope: { subject: 'Grafik' },
  bodyStructure
});
assert.equal(metadataCandidate.uid, '101');
assert.equal(metadataCandidate.date, '2026-09-21');
assert.equal(metadataCandidate.sentAt.startsWith('2026-09-21'), true);
assert.equal(formatBootstrapMailTimestamp(new Date('2026-09-21T08:00:00Z')), '2026-09-21T10:00');
assert.deepEqual(metadataCandidate.attachments.map(item => item.filename), ['4. 21- 27. 09.2026r..docx']);

assert.deepEqual(
  chooseBootstrapMessageUids([
    {
      uid: '100',
      date: '2026-09-20',
      sentAt: '2026-09-20T12:00',
      title: 'Grafik',
      attachments: [{ filename: '3. 14- 20. 09.2026r..docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }]
    },
    {
      uid: '101',
      date: '2026-09-21',
      sentAt: '2026-09-21T08:00',
      title: 'Grafik',
      attachments: [{ filename: '4. 21- 27. 09.2026r..docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }]
    },
    {
      uid: '102',
      date: '2026-09-21',
      sentAt: '2026-09-21T09:00',
      title: 'Grafik na kolejny tydzień',
      attachments: [{ filename: '5. 28.09. - 04.10.2026r..docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }]
    }
  ], '2026-09-21'),
  ['101']
);

assert.equal(extractInternatWeekStart('3. 14- 20. 09.2026r..docx'), '2026-09-14');
assert.equal(extractInternatWeekStart('3. 14- 20. 09.2026r. (1).docx'), '2026-09-14');
assert.equal(extractInternatWeekStart('4. 21- 27. 09.2026r..docx'), '2026-09-21');

const wordMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const mkScheduleCandidate = (filename, title, sourceSentAt, uid) => ({
  parsed: { attachments: [{ filename, contentType: wordMime }] },
  item: { title, sourceSentAt, date: sourceSentAt.slice(0, 10), mailUid: uid }
});
const latestForSep14 = selectLatestScheduleAttachments([
  mkScheduleCandidate('3. 14- 20. 09.2026r..docx', 'Grafik internat 14-20 września', '2026-09-06T20:44', '202600'),
  mkScheduleCandidate('3. 14- 20. 09.2026r..docx', 'Fwd: Korekta grafiku na kolejny tydzień', '2026-09-15T09:48', '202700'),
  mkScheduleCandidate('3. 14- 20. 09.2026r. (1).docx', 'korekta grafiku na bieżący tydzień Gr 7', '2026-09-16T13:15', '202800')
]);
assert.equal(latestForSep14.length, 1);
assert.equal(latestForSep14[0].weekStart, '2026-09-14');
assert.equal(latestForSep14[0].filename, '3. 14- 20. 09.2026r. (1).docx');
assert.equal(latestForSep14[0].sourceSentAt, '2026-09-16T13:15');

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
sandbox.saveCurrentInfoSyncSettings({ sourceRevision: 'director-canonical-v4' });
sandbox.saveCurrentInfoSyncSettings();
assert.equal(sandbox.getCurrentInfoSyncSettings().sourceRevision, 'director-canonical-v4');
sandbox.isTestMode = () => true;
sandbox.saveCurrentInfoSyncSettings();
assert.equal(sandbox.getCurrentInfoSyncSettings().sourceRevision, 'director-canonical-v4');
console.log('OK: forwarding, exact senders, attachment access, deduplication, all attachments and sync migration.');

// An old backend response must not advance the migration checkpoint.
memory.clear();
sandbox.getTestAccessToken = () => 'unit-test';
sandbox.getAIBackendBaseUrl = () => '';
sandbox.fetch = async () => ({ ok: true, json: async () => ({ ok: true, items: [] }) });
const oldBackendResult = await sandbox.syncCurrentInfoMail(false);
assert.equal(oldBackendResult.ok, false);
assert.equal(sandbox.getCurrentInfoSyncSettings().lastSyncAt, '');
assert.notEqual(sandbox.getCurrentInfoSyncSettings().sourceRevision, 'director-canonical-v4');
