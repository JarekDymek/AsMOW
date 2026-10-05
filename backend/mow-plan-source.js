export const MOW_SOURCE = 'mow-moj-plan-v1';
export const MOW_UNAVAILABLE = 'Nie udało się pobrać aktualnych danych z MOW — Mój Plan.';

// User access is checked by the existing AsMOW route before calling this adapter.
// This credential is exclusively server-to-server, never returned in DTOs.
export function createMowPlanSource({ baseUrl = process.env.MOW_PLAN_API_URL, secret = process.env.MOW_ASYSTENT_INTEGRATION_SECRET, fetchImpl = fetch, timeoutMs = 12000 } = {}) {
  async function read(path) {
    try {
      const base = new URL(baseUrl || '');
      const localDev = process.env.NODE_ENV === 'development' && base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname);
      if ((!localDev && base.protocol !== 'https:') || base.username || base.password || !secret || secret.length < 32) throw new Error('configuration');
      const response = await fetchImpl(new URL(path, base.origin), { headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' },
        redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) throw new Error('upstream');
      const result = await response.json();
      if (result.sourceType !== MOW_SOURCE) throw new Error('contract');
      return result;
    } catch {
      const error = new Error(MOW_UNAVAILABLE); error.status = 503; throw error;
    }
  }
  async function plan(educator = '') {
    const result = await read(`/api/asystent/plan?educator=${encodeURIComponent(String(educator).slice(0, 120))}`);
    if (!Array.isArray(result.weeks) || result.weeks.some(w => !w.activeScheduleVersion?.active || !w.activeScheduleVersion?.verified || !Array.isArray(w.shifts))) {
      const error = new Error(MOW_UNAVAILABLE); error.status = 503; throw error;
    }
    return { ...result, scheduleDocuments: result.weeks.map(w => ({
      id: w.sourceVersion, weekStart: w.weekStart, sourceType: MOW_SOURCE, active: true, verified: true,
      sourceTitle: 'MOW — Mój Plan', sourceMailUid: '', sourceAttachment: w.sourceFilename,
      sourceDate: w.activeScheduleVersion.sentAt.slice(0, 10), sourceSentAt: w.activeScheduleVersion.sentAt,
      scheduleKind: 'internat', hasCompleteWeek: true,
      records: w.shifts.map(s => ({ ...s, from: s.start, to: s.end, weekStart: w.weekStart }))
    })) };
  }
  async function info() {
    const messages = [];
    let offset = 0;
    do {
      const page = await read(`/api/asystent/info?offset=${offset}`);
      if (!Array.isArray(page.messages)) { const e = new Error(MOW_UNAVAILABLE); e.status = 503; throw e; }
      messages.push(...page.messages);
      if (!page.hasMore) break;
      if (page.nextOffset !== offset + 50 || offset >= 100000) { const e = new Error(MOW_UNAVAILABLE); e.status = 503; throw e; }
      offset = page.nextOffset;
    } while (true);
    return { ok: true, sourceType: MOW_SOURCE, mailSourceRevision: MOW_SOURCE, count: messages.length,
      newestDate: messages[0]?.sentAt?.slice(0, 10) || '',
      items: messages.map(m => ({ id: `mow:${m.id}`, mailUid: m.id, mailFingerprint: `mow:${m.id}`,
        sourceType: MOW_SOURCE, date: m.sentAt.slice(0, 10), title: m.subject,
        source: m.sender, topic: m.categories.map(c => ({ SCHEDULE: 'Grafik', SCHEDULE_CORRECTION: 'Korekta', SUBSTITUTION: 'Zastępstwo', NIGHT_SHIFT: 'Nocka', LEAVE_ABSENCE: 'Nieobecność', MEETING: 'Spotkanie', PEDAGOGICAL_COUNCIL: 'Rada pedagogiczna', DIAGNOSIS: 'Diagnoza', TRAINING: 'Szkolenie', DEADLINE: 'Termin', DOCUMENTATION: 'Dokumentacja', SUPPLIES_LOGISTICS: 'Zaopatrzenie', TRIP_EVENT: 'Wyjazd / wydarzenie', SCHOOL: 'Szkoła', BOARDING_GROUP: 'Internat', ORGANIZATIONAL: 'Organizacja', OTHER: 'Informacja' }[c] || 'Informacja')).join(', ') || 'informacja', categories: m.categories,
        summary: m.summary, extractedTerms: m.extractedTerms, actions: m.actions,
        body: [m.summary, ...(Array.isArray(m.extractedTerms) ? m.extractedTerms.map(t => typeof t === 'string' ? t : JSON.stringify(t)) : []),
          ...m.actions.map(a => `${a.title}${a.date ? ` · ${a.date}` : ''}${a.start ? ` ${a.start}${a.end ? '–' + a.end : ''}` : ''}${a.deadline ? ` · termin: ${a.deadline}` : ''} · ${{pending:'do wykonania',done:'wykonane',cancelled:'anulowane'}[a.status] || 'do sprawdzenia'}${a.needsReview ? ' · wymaga sprawdzenia' : ''}`)].filter(Boolean).join('\n'),
        attachments: m.attachmentNames.map(name => ({ id: name, name })) })) };
  }
  async function attachment(message, name, preview = true) {
    return read(`/api/asystent/attachment?message=${encodeURIComponent(message)}&name=${encodeURIComponent(name)}&preview=${preview ? '1' : '0'}`);
  }
  return { plan, info, attachment, read };
}
