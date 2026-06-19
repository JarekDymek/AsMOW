/* ────────────────────────────────
   WEEKLY PLAN INTEGRATION
──────────────────────────────── */
function loadWeeklyPlanState() {
  try {
    const settings = JSON.parse(localStorage.getItem(WEEKLY_SETTINGS_KEY) || '{}');
    const backend = document.getElementById('weekly-backend-url');
    const token = document.getElementById('weekly-token');
    const educator = document.getElementById('weekly-educator');
    if (backend) backend.value = settings.backendUrl || '';
    if (token) token.value = settings.token || '';
    if (educator) educator.value = settings.educator || '';
  } catch {}
  try {
    const saved = JSON.parse(localStorage.getItem(WEEKLY_PLAN_KEY) || 'null');
    if (saved && saved.weeks) {
      weeklyPlan = saved;
      weeklyPlanMeta = saved.meta || null;
    }
  } catch {}
}

function saveWeeklySettings() {
  const settings = {
    backendUrl: document.getElementById('weekly-backend-url')?.value.trim() || '',
    token: document.getElementById('weekly-token')?.value.trim() || '',
    educator: document.getElementById('weekly-educator')?.value.trim() || ''
  };
  localStorage.setItem(WEEKLY_SETTINGS_KEY, JSON.stringify(settings));
  return settings;
}

function setWeeklyStatus(text) {
  const el = document.getElementById('weekly-status');
  if (el) el.textContent = text;
}

async function fetchWeeklyPlan() {
  const settings = saveWeeklySettings();
  if (!settings.backendUrl) {
    setWeeklyStatus('Wklej adres wdrożenia Apps Script z aplikacji Harmonogram-MOW. Powinien kończyć się na /exec.');
    return;
  }
  if (!/\/exec(?:\?|$)/.test(settings.backendUrl)) {
    setWeeklyStatus('Ten adres nie wygląda jak wdrożenie Apps Script. Wklej link typu https://script.google.com/macros/s/.../exec, nie adres GitHub Pages ani edytora skryptu.');
    return;
  }
  setWeeklyStatus('Pobieram plan tygodniowy...');
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    const res = await fetch(`${getAIBackendBaseUrl()}/api/weekly-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        targetUrl: settings.backendUrl,
        token: settings.token,
        educator: settings.educator
      })
    });
    clearTimeout(timer);
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
    setWeeklyPlanFromPayload(payload.data || payload, 'Pobrano przez Render z Harmonogram-MOW');
  } catch (err) {
    setWeeklyStatus(`Nie udało się pobrać planu: ${err.name === 'AbortError' ? 'serwer odpowiada zbyt długo' : err.message}. Sprawdź, czy wkleiłeś adres /exec z Apps Script oraz poprawny VIEW_TOKEN albo ADMIN_TOKEN.`);
  }
}

async function loadSampleWeeklyPlan() {
  setWeeklyStatus('Pobieram dane przykładowe...');
  try {
    const res = await fetch(WEEKLY_SAMPLE_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    setWeeklyPlanFromPayload(payload, 'Dane przykładowe');
  } catch (err) {
    setWeeklyStatus(`Nie udało się pobrać danych przykładowych: ${err.message}`);
  }
}

function setWeeklyPlanFromPayload(payload, sourceLabel) {
  const extracted = extractWeeklyDashboard(payload);
  if (extracted.ok === false) {
    setWeeklyStatus(`Generator Harmonogram-MOW zwrócił błąd: ${extracted.error || 'brak szczegółów'}. Sprawdź VIEW_TOKEN/ADMIN_TOKEN i czy link /exec jest z aktualnego wdrożenia.`);
    return;
  }
  const normalized = normalizeWeeklyPayload(extracted);
  if (!normalized.weeks.length) {
    const details = [
      extracted.status ? `status: ${extracted.status}` : '',
      extracted.action ? `akcja: ${extracted.action}` : '',
      extracted.appName ? `aplikacja: ${extracted.appName}` : '',
      extracted.error ? `błąd: ${extracted.error}` : ''
    ].filter(Boolean).join(', ');
    setWeeklyStatus(`Odpowiedź z generatora nie zawiera tygodniowego planu${details ? ` (${details})` : ''}. Sprawdź, czy generator ma już zeskanowane grafiki i czy token daje dostęp do widoku.`);
    return;
  }
  weeklyPlan = normalized;
  weeklyPlanMeta = { source: sourceLabel, loadedAt: new Date().toISOString() };
  weeklyPlan.meta = weeklyPlanMeta;
  localStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(weeklyPlan));
  renderWeeklyPlan();
  setWeeklyStatus(`${sourceLabel}: zapisano ${weeklyPlan.weeks.length} tydz. dla: ${weeklyPlan.educator || weeklyPlan.calendarEducator || 'wychowawca'}.`);
}

function extractWeeklyDashboard(payload) {
  if (!payload) return {};
  if (payload.ok === false) return payload;
  if (payload.data && (payload.data.weeks || payload.data.dashboard || payload.data.ok === false)) return extractWeeklyDashboard(payload.data);
  if (payload.dashboard) return extractWeeklyDashboard(payload.dashboard);
  if (payload.result) return extractWeeklyDashboard(payload.result);
  return payload;
}

function normalizeWeeklyPayload(payload) {
  const weeks = Array.isArray(payload.weeks) ? payload.weeks : [];
  return {
    updatedAt: payload.updatedAt || payload.generatedAt || '',
    educator: payload.educator || '',
    calendarEducator: payload.calendarEducator || '',
    alerts: Array.isArray(payload.alerts) ? payload.alerts : [],
    weeks: weeks.map(w => ({
      label: w.label || `Tydzień ${w.weekNumber || ''}`.trim(),
      range: w.range || [w.dateFrom, w.dateTo].filter(Boolean).join(' - '),
      summary: w.summary || {},
      days: Array.isArray(w.days) ? w.days : []
    }))
  };
}

function renderWeeklyPlan() {
  const el = document.getElementById('weekly-plan');
  if (!el) return;
  if (!weeklyPlan || !weeklyPlan.weeks || !weeklyPlan.weeks.length) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = weeklyPlan.weeks.slice(0, 6).map(week => `
    <div class="weekly-card">
      <div class="weekly-head">
        <span>${escapeHtml(week.label || 'Tydzień')}</span>
        <span>${escapeHtml(week.range || '')}</span>
      </div>
      <div class="weekly-status">
        Godziny: ${escapeHtml(week.summary?.totalHours ?? '0')} · Nadgodziny: ${escapeHtml(week.summary?.overtimeHours ?? '0')} · Weekend: ${escapeHtml(week.summary?.weekendHours ?? '0')}
      </div>
      ${(week.days || []).map(day => `
        <div class="weekly-day">
          <strong>${escapeHtml(day.name || '')} ${escapeHtml(day.date || '')}</strong>
          ${day.shifts && day.shifts.length
            ? day.shifts.map(formatWeeklyShift).join('')
            : '<span class="weekly-empty">Brak dyżuru</span>'}
        </div>
      `).join('')}
    </div>
  `).join('');
}

function formatWeeklyShift(shift) {
  const change = shift.replacesPerson
    ? ` · zastępuje: ${shift.replacesPerson}`
    : shift.replacedByPerson
      ? ` · zastępowany przez: ${shift.replacedByPerson}`
      : '';
  return `<span class="weekly-shift">${escapeHtml(shift.label || 'Dyżur')} ${escapeHtml(shift.hours || '')}${escapeHtml(change)}</span>`;
}

function weeklyPlanToText() {
  if (!weeklyPlan || !weeklyPlan.weeks) return '';
  const who = weeklyPlan.educator || weeklyPlan.calendarEducator || 'wychowawca';
  return [
    `Plan tygodniowy dla: ${who}`,
    weeklyPlan.updatedAt ? `Aktualizacja: ${weeklyPlan.updatedAt}` : '',
    ...weeklyPlan.weeks.map(week => [
      `\n${week.label || 'Tydzień'} ${week.range || ''}`,
      `Podsumowanie: godziny ${week.summary?.totalHours ?? 0}, nadgodziny ${week.summary?.overtimeHours ?? 0}, weekend ${week.summary?.weekendHours ?? 0}`,
      ...(week.days || []).map(day => {
        const shifts = day.shifts && day.shifts.length
          ? day.shifts.map(s => `${s.label || 'Dyżur'} ${s.hours || ''}${s.replacesPerson ? `, zastępuje ${s.replacesPerson}` : ''}${s.replacedByPerson ? `, zastępowany przez ${s.replacedByPerson}` : ''}`).join('; ')
          : 'brak dyżuru';
        return `${day.name || ''} ${day.date || ''}: ${shifts}`;
      })
    ].filter(Boolean).join('\n'))
  ].filter(Boolean).join('\n');
}

function askAIAboutWeeklyPlan() {
  if (!weeklyPlan || !weeklyPlan.weeks || !weeklyPlan.weeks.length) {
    setWeeklyStatus('Najpierw pobierz plan tygodniowy albo użyj danych przykładowych.');
    return;
  }
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const ta = document.getElementById('chat-input');
  ta.value = `Przeanalizuj mój plan tygodniowy pracy z Harmonogram-MOW. Podsumuj dyżury, nadgodziny, weekendy, ryzyka organizacyjne i wskaż pytania doprecyzowujące, jeśli czegoś brakuje.\n\n--- PLAN TYGODNIOWY ---\n${weeklyPlanToText().slice(0, 12000)}`;
  autoResizeTA(ta);
  saveChatDraft();
  sendChat();
}
