/* ────────────────────────────────
   RENDER LAWS
──────────────────────────────── */
function renderLaws() {
  const el = document.getElementById('law-list-render');
  if (!el) return;
  el.innerHTML = LAWS.map(l => {
    const meta = LAW_SOURCE_META[l.n] || {};
    const content = `<span class="law-num">${l.n}.</span>
      <span class="law-text">${escapeHtml(l.t)}</span>
      <span class="law-meta"><strong>${escapeHtml(meta.status || 'źródło wewnętrzne')}</strong>${meta.reviewedAt ? ` · sprawdzono ${escapeHtml(meta.reviewedAt)}` : ''}</span>`;
    return meta.url
      ? `<a class="law-item law-item-link" href="${escapeHtml(meta.url)}" target="_blank" rel="noopener noreferrer">${content}<span class="law-open">Otwórz źródło ↗</span></a>`
      : `<div class="law-item">${content}</div>`;
  }).join('');
  renderLegalUpdateSnapshot(loadLegalUpdateSnapshot());
}

const LEGAL_STATUS_STORE_KEY = 'mow_legal_status_v1';
const LEGAL_STATUS_REFRESH_MS = 24 * 60 * 60 * 1000;
let legalStatusBusy = false;

function maybeRefreshLegalUpdates() {
  const snapshot = loadLegalUpdateSnapshot();
  const checkedAt = Date.parse(snapshot?.checkedAt || '');
  if (!navigator.onLine || legalStatusBusy || (Number.isFinite(checkedAt) && Date.now() - checkedAt < LEGAL_STATUS_REFRESH_MS)) return;
  refreshLegalUpdates(false);
}

async function refreshLegalUpdates(manual = false) {
  if (legalStatusBusy) return;
  const status = document.getElementById('law-live-status');
  const button = document.getElementById('law-live-button');
  const previous = loadLegalUpdateSnapshot();
  legalStatusBusy = true;
  if (button) button.disabled = true;
  if (status) {
    status.className = 'law-live-status is-working';
    status.textContent = 'Sprawdzam urzędowe metadane ELI…';
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const response = await fetch(`${getAIBackendBaseUrl()}/api/legal-updates`, {
      cache: 'no-store',
      signal: ctrl.signal,
      headers: { accept: 'application/json' }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) throw new Error('Backend wymaga wdrożenia wersji 1.3.0 lub nowszej.');
      throw new Error(data.error || `Backend zwrócił HTTP ${response.status}.`);
    }
    const snapshot = {
      ...data,
      baselineCreated: !Array.isArray(previous?.tracked),
      clientChanges: compareLegalSnapshots(previous, data)
    };
    localStorage.setItem(LEGAL_STATUS_STORE_KEY, JSON.stringify(snapshot));
    renderLegalUpdateSnapshot(snapshot);
  } catch (err) {
    renderLegalUpdateSnapshot(previous);
    if (status) {
      status.className = 'law-live-status is-warn';
      status.textContent = err.name === 'AbortError'
        ? 'Sprawdzanie trwało zbyt długo. Zachowano ostatni dostępny wynik.'
        : `Nie udało się sprawdzić ELI: ${err.message}`;
    }
    if (manual && !previous) {
      const results = document.getElementById('law-live-results');
      if (results) results.innerHTML = '<div class="law-live-note">Możesz nadal otwierać każde urzędowe źródło z listy poniżej.</div>';
    }
  } finally {
    clearTimeout(timer);
    legalStatusBusy = false;
    if (button) button.disabled = false;
  }
}

function loadLegalUpdateSnapshot() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEGAL_STATUS_STORE_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function compareLegalSnapshots(previous, current) {
  if (!Array.isArray(previous?.tracked) || !Array.isArray(current?.tracked)) return [];
  const oldByEli = new Map(previous.tracked.map(item => [item.eli, item]));
  return current.tracked.filter(item => {
    const old = oldByEli.get(item.eli);
    return old && legalActFingerprint(old) !== legalActFingerprint(item);
  }).map(item => ({
    eli: item.eli,
    displayAddress: item.displayAddress,
    title: item.title,
    url: item.url
  }));
}

function legalActFingerprint(item = {}) {
  return [item.status, item.inForce, item.changeDate, item.promulgation]
    .map(value => String(value || ''))
    .join('|');
}

function renderLegalUpdateSnapshot(snapshot) {
  const status = document.getElementById('law-live-status');
  const results = document.getElementById('law-live-results');
  if (!status || !results) return;
  if (!snapshot) {
    status.className = 'law-live-status';
    status.textContent = 'Jeszcze nie sprawdzono źródeł online.';
    results.innerHTML = '';
    return;
  }

  const checked = formatLegalDateTime(snapshot.checkedAt);
  const tracked = Array.isArray(snapshot.tracked) ? snapshot.tracked : [];
  const changed = Array.isArray(snapshot.clientChanges) ? snapshot.clientChanges : [];
  const inactive = tracked.filter(item => item.inForce === 'NOT_IN_FORCE' || /uchylon|nieobowiąz/i.test(item.status));
  const trackedElis = new Set(tracked.map(item => item.eli));
  const candidates = (Array.isArray(snapshot.candidates) ? snapshot.candidates : [])
    .filter(item => item?.eli && !trackedElis.has(item.eli))
    .slice(0, 8);
  const needsAttention = changed.length || inactive.length || snapshot.partial;

  status.className = `law-live-status ${needsAttention ? 'is-warn' : 'is-ok'}`;
  status.textContent = `${checked}: sprawdzono ${tracked.length} monitorowanych aktów${snapshot.cached ? ' (wynik z pamięci backendu)' : ''}.`;

  const alerts = [];
  if (changed.length) alerts.push(`<div class="law-live-alert"><strong>Wykryto zmianę metadanych: ${changed.length}.</strong> Otwórz źródło i zweryfikuj wpływ na praktykę MOW.</div>`);
  if (inactive.length) alerts.push(`<div class="law-live-alert is-danger"><strong>Akt wymaga pilnej kontroli statusu: ${inactive.length}.</strong> Nie opieraj odpowiedzi na nieobowiązującym tekście.</div>`);
  if (snapshot.partial) alerts.push('<div class="law-live-alert">Kontrola była częściowa. Część odpowiedzi ELI nie dotarła; ponów sprawdzenie później.</div>');
  if (!alerts.length) alerts.push(snapshot.baselineCreated
    ? '<div class="law-live-ok">Zapisano pierwszy punkt odniesienia. Kolejne kontrole pokażą zmianę statusu lub metadanych.</div>'
    : '<div class="law-live-ok">Nie wykryto zmiany statusu ani metadanych względem poprzedniej kontroli.</div>');

  results.innerHTML = `${alerts.join('')}
    ${renderLegalChanges(changed)}
    <details class="law-candidates">
      <summary>Nowe publikacje do oceny <span>${candidates.length}</span></summary>
      <div class="law-candidate-list">
        ${candidates.length ? candidates.map(renderLegalCandidate).join('') : '<div class="law-live-note">ELI nie zwróciło nowych publikacji poza monitorowanymi aktami.</div>'}
      </div>
    </details>
    <div class="law-live-note">To kontrola techniczna, nie interpretacja prawa. O znaczeniu zmiany decyduje treść aktu, data wejścia w życie i zgodność dokumentów MOW.</div>`;
}

function renderLegalChanges(items) {
  if (!items.length) return '';
  return `<div class="law-change-list">${items.map(item => `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(item.displayAddress || item.eli)}</strong><span>${escapeHtml(item.title)}</span></a>`).join('')}</div>`;
}

function renderLegalCandidate(item) {
  return `<a class="law-candidate" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
    <strong>${escapeHtml(item.displayAddress || item.eli)}</strong>
    <span>${escapeHtml(item.title)}</span>
    <small>${escapeHtml(item.promulgation || 'brak daty')} · ${escapeHtml(item.status || 'sprawdź status')}</small>
  </a>`;
}

function formatLegalDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Ostatnia kontrola'
    : date.toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
}
