import crypto from 'node:crypto';

export const DIRECTOR_EMAIL = 'dariusz.gorski@mowmalbork.pl';
export const FORWARDER_EMAIL = 'dymek.jaroslaw@mowmalbork.pl';
export const ARCHIVE_DIRECTOR_EMAIL = 'dgorski5@wp.pl';
const ARCHIVE_SENDER_HASH = 'b76c6571d958be756b5f772b2eda7afe342d63aba6682e35e20bd67f6d470c3e';
const ARCHIVE_BEFORE = Date.parse('2026-09-16T00:00:00Z');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function headerAddress(value = '') {
  const text = String(value).trim();
  const bracketed = text.match(/<([^<>\s]+@[^<>\s]+)>\s*$/);
  return (bracketed?.[1] || (/^[^\s<>@]+@[^\s<>@]+$/.test(text) ? text : '')).toLowerCase();
}

function isArchivedDirectorAddress(address, dateValue) {
  const addressHash = hash(String(address || '').toLowerCase());
  const time = new Date(dateValue || 0).getTime();
  return addressHash === ARCHIVE_SENDER_HASH && Number.isFinite(time) && time < ARCHIVE_BEFORE;
}

function plainBody(parsed) {
  return String(parsed.text || String(parsed.html || '')
    .replace(/<br\s*\/?>|<\/div>|<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'));
}

function localMailTimestamp(date) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date).replace(' ', 'T');
}

function forwardedDate(value) {
  const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  const polish = value.match(/(\d{1,2})\s+(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|paź|lis|gru)\S*\s+(20\d{2})/i);
  if (polish) return `${polish[3]}-${String(months.indexOf(polish[2].toLowerCase()) + 1).padStart(2, '0')}-${polish[1].padStart(2, '0')}`;
  const time = Date.parse(value);
  return Number.isNaN(time) ? '' : new Date(time).toISOString().slice(0, 10);
}

export function resolveDirectorMail(parsed, config = {}) {
  const director = (config.from || DIRECTOR_EMAIL).toLowerCase();
  const forwarder = (config.forwarder || FORWARDER_EMAIL).toLowerCase();
  const senders = parsed.from?.value || [];
  if (senders.length !== 1) return null;
  const sender = String(senders[0].address || '').toLowerCase();
  const body = plainBody(parsed).replace(/\r\n/g, '\n');
  if (sender === director) return { source: director, body, forwardedBy: '', originalDate: '', originalSentAt: parsed.date ? localMailTimestamp(parsed.date) : '' };
  if (isArchivedDirectorAddress(sender, parsed.date)) {
    return { source: director, body, forwardedBy: '', originalDate: '', originalSentAt: parsed.date ? localMailTimestamp(parsed.date) : '' };
  }
  if (sender !== forwarder) return null;

  const lines = body.split('\n').map(line => line.replace(/^\s*(?:>\s*)+/, '').trim());
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(?:Od|From):\s*(.+)$/i);
    if (!match) continue;
    const address = headerAddress(match[1]);
    if (address === forwarder) continue;
    const dateIndex = lines.findIndex((line, j) => j > i && j <= i + 3 && /^(?:Date|Data|Sent|Wysłano):/i.test(line));
    if (dateIndex < 0) return null;
    const originalDate = forwardedDate(lines[dateIndex].replace(/^[^:]+:\s*/, ''));
    const originalDateValue = originalDate ? originalDate + 'T00:00:00Z' : '';
    if (address !== director && !isArchivedDirectorAddress(address, originalDateValue)) return null;
    let start = dateIndex + 1;
    while (start < lines.length && /^(?:(?:Subject|Temat|To|Do|Cc|DW):|\s*$)/i.test(lines[start])) start++;
    return {
      source: director, forwardedBy: sender,
      originalDate,
      originalSentAt: originalDate ? originalDate + 'T' + (lines[dateIndex].match(/(?:o\s+|\s)(\d{1,2}:\d{2})/)?.[1] || '00:00').padStart(5, '0') : '',
      body: lines.slice(start).join('\n').trim()
    };
  }
  return null;
}

export function canReadDirectorAttachment(parsed, message, config = {}) {
  if (resolveDirectorMail(parsed, config)) return true;
  const senders = parsed.from?.value || [];
  const received = new Date(message.internalDate).getTime();
  return senders.length === 1 && isArchivedDirectorAddress(senders[0].address, received);
}

export function directorMailFingerprint(parsed, resolved) {
  const title = String(parsed.subject || '').replace(/^(?:(?:fwd?|odp|re):\s*)+/i, '').trim();
  const attachments = (parsed.attachments || []).map(item =>
    `${item.filename || ''}:${hash(Buffer.from(item.content || ''))}`).sort();
  const date = resolved.originalDate || (parsed.date ? new Date(parsed.date).toISOString().slice(0, 10) : '');
  return hash(JSON.stringify([resolved.source, date, title, resolved.body.replace(/\s+/g, ' ').trim(), attachments]));
}

export async function searchDirectorMail(client, since, config = {}) {
  const query = {
    since,
    or: [
      { from: config.from || DIRECTOR_EMAIL },
      { from: config.forwarder || FORWARDER_EMAIL },
      { from: ARCHIVE_DIRECTOR_EMAIL }
    ]
  };
  try {
    return await client.search(query, { uid: true });
  } catch (err) {
    if (!/command failed|search|bad|no/i.test(`${err.message || ''} ${err.responseText || ''}`)) throw err;
    return client.search({ since }, { uid: true });
  }
}
