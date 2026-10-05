import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createMowPlanSource, MOW_SOURCE, MOW_UNAVAILABLE } from './mow-plan-source.js';
const secret = 'test-only-'.repeat(8);
const options = { baseUrl: 'https://mow-moj-plan.vercel.app', secret };

test('HTTP routes authenticate before reading Mój Plan, protect responses and keep the old proxy retired', async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  process.env.ASMOW_TEST_MODE = '1';
  process.env.CURRENT_INFO_SYNC_TOKEN = 'test-user-token';
  process.env.MOW_PLAN_API_URL = options.baseUrl;
  process.env.MOW_ASYSTENT_INTEGRATION_SECRET = secret;
  let reads = 0;
  let unavailable = false;
  globalThis.fetch = async (url, init) => {
    reads++;
    assert.equal(new URL(url).origin, options.baseUrl);
    assert.equal(init.headers.Authorization, `Bearer ${secret}`);
    if (unavailable) throw new Error('upstream test outage');
    return Response.json({ sourceType: MOW_SOURCE, weeks: [], generatedAt: '2026-10-05T12:00:00Z' });
  };
  const { server } = await import('./server.js');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}`;
  const post = (path, payload) => originalFetch(endpoint + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  try {
    const retired = await post('/api/weekly-plan', { token: 'test-user-token' });
    assert.equal(retired.status, 410);
    assert.equal((await retired.json()).code, 'HARMONOGRAM_MOW_RETIRED');
    const denied = await post('/api/schedule-dashboard', { token: 'wrong' });
    assert.equal(denied.status, 403);
    assert.equal(reads, 0);
    assert.equal(denied.headers.get('cache-control'), 'private, no-store');
    const plan = await post('/api/schedule-dashboard', { token: 'test-user-token' });
    assert.equal(plan.status, 200);
    assert.equal(plan.headers.get('cache-control'), 'private, no-store');
    assert.equal((await plan.json()).data.sourceType, MOW_SOURCE);
    assert.equal(reads, 1);
    unavailable = true;
    const failed = await post('/api/schedule-dashboard', { token: 'test-user-token' });
    assert.equal(failed.status, 503);
    assert.equal((await failed.json()).error, MOW_UNAVAILABLE);
    assert.equal(reads, 2);
  } finally {
    await new Promise(resolve => server.close(resolve));
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
  }
});
test('server adapter preserves the authoritative shift, correction and all employees', async () => {
  let called;
  const shift = { employee: 'Nowak', date: '2026-09-30', start: '22:00', end: '06:00', endDate: '2026-10-01', group: 'III', night: true, substitution: true, replacedEmployee: 'Kowalski', sourceVersion: 'new', verified: true };
  const source = createMowPlanSource({ ...options, fetchImpl: async (url, init) => {
    called = String(url); assert.equal(init.headers.Authorization, `Bearer ${secret}`);
    assert.equal(init.redirect, 'error');
    return Response.json({ sourceType: MOW_SOURCE, weeks: [{ weekStart: '2026-09-28', sourceVersion: 'new', sourceFilename: 'korekta.docx', activeScheduleVersion: { active: true, verified: true, sentAt: '2026-09-29T12:00:00Z' }, shifts: [shift] }] });
  } });
  const plan = await source.plan('Nowak');
  assert.match(called, /api\/asystent\/plan\?educator=Nowak/);
  assert.deepEqual(plan.weeks[0].shifts[0], shift);
  assert.equal(plan.scheduleDocuments[0].records[0].endDate, '2026-10-01');
  assert.equal(JSON.stringify(plan).includes(secret), false);
});
test('failure and timeout yield only a Polish error, with no fallback request', async () => {
  for (const fetchImpl of [async () => { throw new Error('ECONNREFUSED'); }, async () => Response.json({}, { status: 500 }), async () => { throw new DOMException('Failed to fetch', 'TimeoutError'); }]) {
    let count = 0;
    const source = createMowPlanSource({ ...options, fetchImpl: (...args) => { count++; return fetchImpl(...args); } });
    await assert.rejects(source.plan(), { message: MOW_UNAVAILABLE, status: 503 });
    assert.equal(count, 1);
  }
});
test('missing secret fails closed before network access', async () => {
  let called = false;
  const source = createMowPlanSource({ ...options, secret: '', fetchImpl: async () => { called = true; } });
  await assert.rejects(source.plan(), { message: MOW_UNAVAILABLE }); assert.equal(called, false);
});
test('Info uses indexed summaries and ready actions, paginates history without mailbox/parser', async () => {
  const calls = [];
  const source = createMowPlanSource({ ...options, fetchImpl: async url => {
    calls.push(String(url));
    const offset = Number(new URL(url).searchParams.get('offset'));
    return Response.json({ sourceType: MOW_SOURCE, hasMore: offset === 0, nextOffset: offset + 50,
      messages: [{ id: String(offset), sentAt: '2026-09-30T12:00:00Z', subject: 'Zebranie', sender: 'dgorski5@wp.pl', summary: 'Proszę przybyć.',
        categories: ['MEETING'], extractedTerms: ['2026-10-05'], attachmentNames: ['zebranie.pdf'], actions: [{ title: 'Zebranie', date: '2026-10-05', start: '14:00', end: '15:00', status: 'pending', needsReview: true }] }] });
  } });
  const info = await source.info();
  assert.equal(info.items.length, 2); assert.equal(calls.length, 2);
  assert.equal(info.items[0].summary, 'Proszę przybyć.');
  assert.match(info.items[0].body, /2026-10-05 14:00–15:00/);
  assert.match(info.items[0].body, /wymaga sprawdzenia/);
  assert.equal(info.items[0].attachments[0].name, 'zebranie.pdf');
});

function weeklyUI() {
  const writes = new Map();
  const context = vm.createContext({ console, Date, AbortSignal,
    localStorage: { setItem: (key, value) => writes.set(key, value) },
    WEEKLY_PLAN_KEY: 'test-plan', weeklyPlan: null, weeklyPlanMeta: null });
  vm.runInContext(fs.readFileSync(new URL('../assets/js/weekly-plan.js', import.meta.url), 'utf8'), context);
  context.normalizeWeeklyPayload = p => p;
  context.renderWeeklyPlan = () => {};
  context.getWeeklyCoverageText = context.getWeeklyAllWeeksText = context.getWeeklyGeneratorDiagnostic = () => '';
  context.setWeeklyStatus = text => { context.status = text; };
  return context;
}
test('weekly cards display the date range supplied by the integration contract', () => {
  const context = weeklyUI();
  const week = context.normalizeWeeklyWeek({ weekStart: '2026-09-28', weekEnd: '2026-10-04', days: [] });
  assert.equal(week.range, '2026-09-28 - 2026-10-04');
});
test('UI trusts incoming active version even when local cache has a later timestamp; no local correction choice', () => {
  const context = weeklyUI();
  context.weeklyPlan = { weeks: [{ sourceVersion: 'cached', authoritativeDocument: { sourceSentAt: '2099-01-01' } }] };
  const ready = { schedulePolicyRevision: MOW_SOURCE, sourceType: MOW_SOURCE, weeks: [{ sourceVersion: 'server-active', authoritativeDocument: { sourceSentAt: '2026-09-29' } }] };
  context.setWeeklyPlanFromPayload(ready, 'MOW — Mój Plan');
  assert.equal(context.weeklyPlan.weeks[0].sourceVersion, 'server-active');
  context.setWeeklyPlanFromPayload({ ...ready, weeks: [] }, 'MOW — Mój Plan');
  assert.equal(context.weeklyPlan.weeks.length, 0, 'Ambiguous/no-active source must not retain a locally selected correction');
});
test('UI failure preserves the last snapshot and labels it in Polish without an old-source retry', async () => {
  const context = weeklyUI();
  const cached = { weeks: [{ sourceVersion: 'last-good' }] };
  context.weeklyPlan = cached;
  context.saveWeeklySettings = () => ({ educator: 'Nowak' });
  context.getCurrentInfoSyncSettings = () => ({ token: 'user-test-access' });
  context.getTestAccessToken = () => '';
  let calls = 0;
  context.fetchCurrentInfoBackend = async () => { calls++; throw new Error('ECONNREFUSED / Failed to fetch'); };
  assert.equal(await context.fetchWeeklyPlan(), false);
  assert.equal(calls, 1); assert.equal(context.weeklyPlan, cached);
  assert.match(context.status, /Nie udało się pobrać aktualnych danych z MOW — Mój Plan/);
  assert.match(context.status, /zapisane dane lokalne/);
  assert.doesNotMatch(context.status, /ECONNREFUSED|Failed to fetch|Internal Server Error/);
});
test('backend startup and active routes never invoke the retired mailbox/source', () => {
  const server = fs.readFileSync(new URL('./server.js', import.meta.url), 'utf8');
  const start = server.indexOf("if (process.env.ASMOW_TEST_MODE !== '1')");
  const startup = server.slice(start, server.indexOf('async function prewarmCanonicalScheduleCache', start));
  assert.doesNotMatch(startup, /probeCurrentInfoMailConnection\(|prewarmCanonicalScheduleCache\(/);
  const routes = server.slice(server.indexOf('const server = http.createServer'), start);
  assert.doesNotMatch(routes, /deprecatedFetch|fetchMailScheduleDashboardCached|script\.google\.com/);
  assert.match(routes, /const dashboard = await fetchWeeklyPlan\(payload\)/);
});
