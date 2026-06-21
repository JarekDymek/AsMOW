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
  const normalized = mergeWeeklyPlans(weeklyPlan, normalizeWeeklyPayload(extracted));
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
  setWeeklyStatus(`${sourceLabel}: zapisano ${weeklyPlan.weeks.length} tydz. dla: ${weeklyPlan.educator || weeklyPlan.calendarEducator || 'wychowawca'}. ${getWeeklyCoverageText(weeklyPlan)}`);
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
  const history = Array.isArray(payload.history) ? payload.history : [];
  const normalizedWeeks = [
    ...weeks.map(normalizeWeeklyWeek),
    ...history.map(normalizeWeeklyHistoryWeek)
  ];
  const normalized = {
    updatedAt: payload.updatedAt || payload.generatedAt || '',
    educator: payload.educator || '',
    calendarEducator: payload.calendarEducator || '',
    alerts: Array.isArray(payload.alerts) ? payload.alerts : [],
    weeks: normalizedWeeks
  };
  normalized.weeks = classifyWeeklyWeeks(normalized.weeks);
  return normalized;
}

function normalizeWeeklyWeek(w = {}) {
  return {
    label: w.label || `Tydzień ${w.weekNumber || ''}`.trim(),
    range: w.range || [w.dateFrom, w.dateTo].filter(Boolean).join(' - '),
    weekNumber: w.weekNumber || '',
    dateFrom: w.dateFrom || w.weekStart || '',
    dateTo: w.dateTo || w.weekEnd || '',
    summary: w.summary || {
      totalHours: w.totalHours ?? 0,
      overtimeHours: w.overtimeHours ?? 0,
      weekendHours: w.weekendHours ?? 0
    },
    days: Array.isArray(w.days) ? w.days : [],
    sourceFilename: w.sourceFilename || w.source || '',
    partialFromHistory: !!w.partialFromHistory
  };
}

function normalizeWeeklyHistoryWeek(w = {}) {
  return normalizeWeeklyWeek({
    ...w,
    label: w.label || `Tydzień ${w.weekNumber || ''}`.trim(),
    dateFrom: w.dateFrom || w.weekStart || '',
    dateTo: w.dateTo || w.weekEnd || '',
    summary: {
      totalHours: w.totalHours ?? 0,
      overtimeHours: w.overtimeHours ?? 0,
      weekendHours: w.weekendHours ?? 0
    },
    days: [],
    partialFromHistory: true
  });
}

function mergeWeeklyPlans(existing, incoming) {
  if (!incoming || !Array.isArray(incoming.weeks)) return incoming || { weeks: [] };
  const map = new Map();
  const addWeeks = weeks => (weeks || []).forEach(week => {
    const key = getWeeklyIdentity(week);
    if (!key) return;
    const previous = map.get(key);
    if (previous && !previous.partialFromHistory && week.partialFromHistory) return;
    map.set(key, { ...week });
  });
  addWeeks(existing?.weeks);
  addWeeks(incoming.weeks);
  return {
    ...incoming,
    weeks: classifyWeeklyWeeks([...map.values()])
  };
}

function getWeeklyIdentity(week) {
  const parsed = getWeekDateRange(week);
  if (parsed.start && parsed.end) return `${toDateKey(parsed.start)}_${toDateKey(parsed.end)}`;
  return `${week.label || ''}_${week.range || ''}`;
}

function classifyWeeklyWeeks(weeks = []) {
  const today = startOfDay(new Date());
  const sorted = [...weeks].map(week => {
    const range = getWeekDateRange(week);
    return {
      ...week,
      startDate: range.start ? toDateKey(range.start) : '',
      endDate: range.end ? toDateKey(range.end) : ''
    };
  }).sort(compareWeeklyWeeks);

  const futureWeeks = sorted.filter(week => {
    const range = getWeekDateRange(week);
    return range.start && range.start > today;
  });
  const pastWeeks = sorted.filter(week => {
    const range = getWeekDateRange(week);
    return range.end && range.end < today;
  });
  const latestPastKey = pastWeeks.length ? getWeeklyIdentity(pastWeeks[pastWeeks.length - 1]) : '';

  return sorted.map(week => {
    const range = getWeekDateRange(week);
    const identity = getWeeklyIdentity(week);
    let relation = 'tydzień';
    if (range.start && range.end && range.start <= today && range.end >= today) {
      relation = 'bieżący tydzień';
    } else if (identity && identity === latestPastKey) {
      relation = 'poprzedni tydzień';
    } else if (range.end && range.end < today) {
      relation = 'archiwalny tydzień';
    } else if (range.start && range.start > today) {
      const futureIndex = futureWeeks.findIndex(item => getWeeklyIdentity(item) === identity);
      relation = futureIndex === 0 ? 'następny tydzień' : futureIndex === 1 ? 'kolejny tydzień' : `za ${futureIndex + 1} tygodnie`;
    }
    return { ...week, relation };
  });
}

function compareWeeklyWeeks(a, b) {
  const ar = getWeekDateRange(a);
  const br = getWeekDateRange(b);
  if (ar.start && br.start) return ar.start - br.start;
  return String(a.label || a.range || '').localeCompare(String(b.label || b.range || ''));
}

function getWeekDateRange(week) {
  const from = parseWeeklyDate(week.dateFrom) || parseFirstDateFromRange(week.range);
  const to = parseWeeklyDate(week.dateTo) || parseLastDateFromRange(week.range, from);
  const days = Array.isArray(week.days) ? week.days : [];
  const dayDates = days.map(day => parseWeeklyDate(day.date, from?.getFullYear())).filter(Boolean);
  const start = from || dayDates[0] || null;
  const end = to || dayDates[dayDates.length - 1] || null;
  return {
    start: start ? startOfDay(start) : null,
    end: end ? startOfDay(end) : null
  };
}

function parseFirstDateFromRange(range = '') {
  const dates = parseDatesFromText(range);
  return dates[0] || null;
}

function parseLastDateFromRange(range = '', firstDate = null) {
  const dates = parseDatesFromText(range, firstDate?.getFullYear());
  if (!dates.length) return null;
  const last = dates[dates.length - 1];
  if (firstDate && last < firstDate) last.setFullYear(firstDate.getFullYear() + 1);
  return last;
}

function parseDatesFromText(text = '', fallbackYear = new Date().getFullYear()) {
  const matches = [...String(text).matchAll(/(\d{1,2})[.\-/](\d{1,2})(?:[.\-/](\d{2,4}))?/g)];
  return matches.map(match => parseWeeklyDate(match[0], fallbackYear)).filter(Boolean);
}

function parseWeeklyDate(value = '', fallbackYear = new Date().getFullYear()) {
  const text = String(value || '').trim();
  if (!text) return null;
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const dotted = text.match(/(\d{1,2})[.\-/](\d{1,2})(?:[.\-/](\d{2,4}))?/);
  if (!dotted) return null;
  const day = Number(dotted[1]);
  const month = Number(dotted[2]);
  const rawYear = dotted[3] ? Number(dotted[3]) : fallbackYear;
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeeklyCoverageText(plan) {
  const labels = classifyWeeklyWeeks(plan.weeks || [])
    .filter(week => ['poprzedni tydzień', 'bieżący tydzień', 'następny tydzień', 'kolejny tydzień'].includes(week.relation) || /^za \d+ tygodnie$/.test(week.relation || ''))
    .map(week => `${week.relation}: ${week.label || week.range || 'tydzień'}`);
  return labels.length ? `Dostępne: ${labels.join(', ')}.` : '';
}

function renderWeeklyPlan() {
  const el = document.getElementById('weekly-plan');
  if (!el) return;
  if (!weeklyPlan || !weeklyPlan.weeks || !weeklyPlan.weeks.length) {
    el.innerHTML = '';
    return;
  }
  const weeks = classifyWeeklyWeeks(weeklyPlan.weeks || []).filter(shouldShowWeeklyWeek);
  el.innerHTML = weeks.slice(0, 8).map((week, index) => {
    const panelId = `weekly-week-${index}`;
    const summary = `Godziny: ${escapeHtml(week.summary?.totalHours ?? '0')} · Nadgodziny: ${escapeHtml(week.summary?.overtimeHours ?? '0')} · Weekend: ${escapeHtml(week.summary?.weekendHours ?? '0')}`;
    return `
      <div class="weekly-card">
        <button class="section-toggle weekly-toggle" type="button" data-accordion-target="${panelId}" onclick="toggleAccordion('${panelId}')">
          <span class="st-main"><span>${escapeHtml(week.label || 'Tydzień')} <em class="weekly-relation">${escapeHtml(week.relation || 'tydzień')}</em></span><small>${summary}</small></span>
          <span class="weekly-range">${escapeHtml(week.range || '')}</span>
          <span class="st-state">Rozwiń</span>
        </button>
        <div class="weekly-body collapsible-card accordion-panel" id="${panelId}">
          ${week.partialFromHistory ? `
            <div class="weekly-day weekly-day--notice">
              <strong>Wykryto grafik w historii generatora</strong>
              <span class="weekly-empty">Aktywne wdrożenie Apps Script nie zwraca jeszcze szczegółów tego tygodnia. Po aktualizacji backendu pojawią się dni i dyżury.</span>
              ${week.sourceFilename ? `<span class="weekly-empty">Źródło: ${escapeHtml(week.sourceFilename)}</span>` : ''}
            </div>
          ` : ''}
          ${(week.days || []).map(day => `
            <div class="weekly-day">
              <strong>${escapeHtml(day.name || '')} ${escapeHtml(day.date || '')}</strong>
              ${day.shifts && day.shifts.length
                ? day.shifts.map(formatWeeklyShift).join('')
                : '<span class="weekly-empty">Brak dyżuru</span>'}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
  setupAccordions(el);
}

function shouldShowWeeklyWeek(week) {
  return ['poprzedni tydzień', 'bieżący tydzień', 'następny tydzień', 'kolejny tydzień', 'dalszy tydzień'].includes(week.relation || '')
    || /^za \d+ tygodnie$/.test(week.relation || '');
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
    ...classifyWeeklyWeeks(weeklyPlan.weeks).map(week => [
      `\n${week.label || 'Tydzień'} (${week.relation || 'tydzień'}) ${week.range || ''}`,
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
