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
  if (typeof isTestMode === 'function' && isTestMode()) {
    const profile = getTestProfile();
    return {
      backendUrl: '',
      token: '',
      educator: profile.weeklyEducator || document.getElementById('weekly-educator')?.value.trim() || ''
    };
  }
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

async function fetchWeeklyPlan(options = {}) {
  const testMode = typeof isTestMode === 'function' && isTestMode();
  const settings = saveWeeklySettings();
  if (!testMode && !settings.backendUrl) {
    setWeeklyStatus('Wklej adres wdrożenia Apps Script z aplikacji Harmonogram-MOW. Powinien kończyć się na /exec.');
    return;
  }
  if (!testMode && !/\/exec(?:\?|$)/.test(settings.backendUrl)) {
    setWeeklyStatus('Ten adres nie wygląda jak wdrożenie Apps Script. Wklej link typu https://script.google.com/macros/s/.../exec, nie adres GitHub Pages ani edytora skryptu.');
    return;
  }
  const rescan = !!options.rescan && !testMode;
  setWeeklyStatus(rescan ? 'Skanuję pocztę generatora i pobieram plan...' : 'Pobieram plan tygodniowy...');
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), rescan ? 120000 : 25000);
    const res = await fetch(`${getAIBackendBaseUrl()}/api/weekly-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        targetUrl: testMode ? '' : settings.backendUrl,
        token: testMode ? '' : settings.token,
        testAccessToken: testMode ? getTestAccessToken() : '',
        educator: settings.educator,
        action: rescan ? 'scan' : 'dashboard'
      })
    });
    clearTimeout(timer);
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
    setWeeklyPlanFromPayload(payload.data || payload, rescan ? 'Przeskanowano i pobrano przez Render z Harmonogram-MOW' : 'Pobrano przez Render z Harmonogram-MOW');
  } catch (err) {
    const tokenHint = rescan ? 'Do skanowania potrzebny jest ADMIN_TOKEN.' : 'Sprawdź VIEW_TOKEN albo ADMIN_TOKEN.';
    setWeeklyStatus(`Nie udało się pobrać planu: ${err.name === 'AbortError' ? 'serwer odpowiada zbyt długo' : err.message}. Sprawdź, czy wkleiłeś adres /exec z Apps Script. ${tokenHint}`);
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
  setWeeklyStatus(`${sourceLabel}: zapisano ${weeklyPlan.weeks.length} tydz. dla: ${weeklyPlan.educator || weeklyPlan.calendarEducator || 'wychowawca'}. ${getWeeklyCoverageText(weeklyPlan)} ${getWeeklyAllWeeksText(weeklyPlan)} ${getWeeklyGeneratorDiagnostic(extracted)}`.trim());
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
  payload = repairWeeklyMojibake(payload);
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

function repairWeeklyMojibake(value) {
  if (typeof value === 'string') return repairWeeklyMojibakeText(value);
  if (Array.isArray(value)) return value.map(repairWeeklyMojibake);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairWeeklyMojibake(item)]));
  }
  return value;
}

function repairWeeklyMojibakeText(value = '') {
  return String(value)
    .replace(/\u00C4\u2026/g, '\u0105')
    .replace(/\u00C4\u2021/g, '\u0107')
    .replace(/\u00C4\u2122/g, '\u0119')
    .replace(/\u00C5\u201A/g, '\u0142')
    .replace(/\u00C5\u201E/g, '\u0144')
    .replace(/\u00C3\u00B3/g, '\u00F3')
    .replace(/\u00C5\u203A/g, '\u015B')
    .replace(/\u00C5\u015F/g, '\u017A')
    .replace(/\u00C5\u013D/g, '\u017C')
    .replace(/\u00C4\u201E/g, '\u0104')
    .replace(/\u00C4\u2020/g, '\u0106')
    .replace(/\u00C4\u02DC/g, '\u0118')
    .replace(/\u00C5\u0081/g, '\u0141')
    .replace(/\u00C5\u192/g, '\u0143')
    .replace(/\u00C3\u201C/g, '\u00D3')
    .replace(/\u00C5\u0161/g, '\u015A')
    .replace(/\u00C5\u00BB/g, '\u017B')
    .replace(/\u00C5\u00B9/g, '\u0179')
    .replace(/\u00E2\u20AC\u201C/g, '\u2013')
    .replace(/\u00E2\u20AC\u201D/g, '\u2014')
    .replace(/\u00E2\u2020\u2019/g, '\u2192')
    .replace(/\u00E2\u20AC\u00A2/g, '\u2022')
    .replace(/\u00E2\u20AC\u017E/g, '\u201E')
    .replace(/\u00E2\u20AC\u009D/g, '\u201D');
}

function getWeeklyGeneratorDiagnostic(payload = {}) {
  const version = payload.backendVersion ? ` Wersja generatora: ${payload.backendVersion}.` : '';
  if (Array.isArray(payload.dashboardWeekStarts)) {
    return `Generator widzi ${payload.dashboardWeekStarts.length} tyg.: ${payload.dashboardWeekStarts.join(', ')}.${version}`;
  }
  return `Uwaga: aktywny generator nie zwraca pola dashboardWeekStarts, więc może nadal działać stare wdrożenie Apps Script.${version}`;
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

function getWeeklyAllWeeksText(plan) {
  const labels = classifyWeeklyWeeks(plan.weeks || [])
    .map(week => {
      const range = week.range || [week.dateFrom, week.dateTo].filter(Boolean).join(' - ') || 'bez dat';
      return `${week.label || 'Tydzień'} ${range} (${week.relation || 'bez relacji'})`;
    });
  return labels.length ? `Odebrane tygodnie: ${labels.join('; ')}.` : '';
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
