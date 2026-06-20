const DIRECTOR_EMAIL = 'dgorski5@wp.pl';
const CURRENT_INFO_START_DATE = '2026-01-01';

function loadCurrentInfo() {
  try {
    const raw = localStorage.getItem(CURRENT_INFO_KEY);
    currentInfoItems = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(currentInfoItems)) currentInfoItems = [];
  } catch {
    currentInfoItems = [];
  }
  currentInfoItems = currentInfoItems.map(normalizeCurrentInfoItem).filter(Boolean);
  saveCurrentInfo(false);
  loadCurrentInfoSyncSettings();
  renderCurrentInfoList();
  autoSyncCurrentInfoMail();
}

function saveCurrentInfo(updateView = true) {
  currentInfoItems = sortCurrentInfo(currentInfoItems);
  localStorage.setItem(CURRENT_INFO_KEY, JSON.stringify(currentInfoItems));
  if (updateView) renderCurrentInfoList();
}

function normalizeCurrentInfoItem(item) {
  if (!item || typeof item !== 'object') return null;
  const body = String(item.body || item.content || '').trim();
  const title = String(item.title || '').trim() || buildCurrentInfoTitle(body);
  if (!title && !body) return null;
  const date = normalizeInfoDate(item.date || item.receivedAt || item.createdAt);
  return {
    id: String(item.id || `info-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    date,
    title: title.slice(0, 180),
    topic: String(item.topic || detectCurrentInfoTopic(title, body)).trim().slice(0, 100),
    source: String(item.source || DIRECTOR_EMAIL).trim().slice(0, 120),
    body: body.slice(0, 40_000),
    createdAt: String(item.createdAt || new Date().toISOString())
  };
}

function normalizeInfoDate(value) {
  const raw = String(value || '').trim();
  const iso = raw.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (iso) return iso < CURRENT_INFO_START_DATE ? CURRENT_INFO_START_DATE : iso;
  const polish = raw.match(/(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})/);
  if (polish) {
    const date = `${polish[3]}-${polish[2].padStart(2, '0')}-${polish[1].padStart(2, '0')}`;
    return date < CURRENT_INFO_START_DATE ? CURRENT_INFO_START_DATE : date;
  }
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) {
    const date = new Date(parsed).toISOString().slice(0, 10);
    return date < CURRENT_INFO_START_DATE ? CURRENT_INFO_START_DATE : date;
  }
  return new Date().toISOString().slice(0, 10);
}

function sortCurrentInfo(items) {
  return [...items].sort((a, b) => {
    const byDate = String(b.date).localeCompare(String(a.date));
    if (byDate) return byDate;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

function renderCurrentInfoList() {
  const list = document.getElementById('current-info-list');
  if (!list) return;
  const query = normalizeForCurrentInfoSearch(document.getElementById('current-info-search')?.value || '');
  const items = sortCurrentInfo(currentInfoItems).filter(item => {
    if (!query) return true;
    return normalizeForCurrentInfoSearch(`${item.date} ${item.title} ${item.topic} ${item.source} ${item.body}`).includes(query);
  });

  list.innerHTML = '';
  updateCurrentInfoCounter(items.length, currentInfoItems.length);
  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'current-info-empty';
    empty.textContent = currentInfoItems.length
      ? 'Brak wyników dla tego wyszukiwania.'
      : 'Brak zapisanych bieżących informacji.';
    list.appendChild(empty);
    return;
  }

  items.forEach(item => list.appendChild(createCurrentInfoRow(item)));
}

function createCurrentInfoRow(item) {
  const wrap = document.createElement('div');
  wrap.className = 'current-info-item';

  const row = document.createElement('div');
  row.className = 'current-info-row';

  const toggle = document.createElement('button');
  toggle.className = 'current-info-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.onclick = () => toggleCurrentInfoBody(item.id, toggle, body);

  const date = document.createElement('span');
  date.className = 'current-info-date';
  date.textContent = item.date;

  const title = document.createElement('span');
  title.className = 'current-info-title';
  title.textContent = item.title;

  const topic = document.createElement('span');
  topic.className = 'current-info-topic';
  topic.textContent = item.topic || 'informacja';

  toggle.append(date, title, topic);

  const del = document.createElement('button');
  del.className = 'current-info-delete';
  del.type = 'button';
  del.title = 'Usuń wiadomość';
  del.setAttribute('aria-label', 'Usuń wiadomość');
  del.textContent = '🗑';
  del.onclick = () => deleteCurrentInfo(item.id);

  row.append(toggle, del);

  const body = document.createElement('div');
  body.className = 'current-info-body';
  const meta = document.createElement('div');
  meta.className = 'current-info-meta';
  meta.textContent = `Źródło: ${item.source || DIRECTOR_EMAIL}`;
  const text = document.createElement('div');
  text.className = 'current-info-text';
  text.textContent = item.body || '(brak treści)';
  body.append(meta, text);

  wrap.append(row, body);
  return wrap;
}

function toggleCurrentInfoBody(id, toggle, body) {
  const isOpen = body.classList.toggle('open');
  toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function deleteCurrentInfo(id) {
  if (!confirm('Usunąć tę wiadomość z tego urządzenia?')) return;
  currentInfoItems = currentInfoItems.filter(item => String(item.id) !== String(id));
  saveCurrentInfo();
  setCurrentInfoStatus('Usunięto wiadomość z lokalnego archiwum.');
}

function saveCurrentInfoFromForm() {
  const dateEl = document.getElementById('current-info-date');
  const titleEl = document.getElementById('current-info-title');
  const topicEl = document.getElementById('current-info-topic');
  const bodyEl = document.getElementById('current-info-body-input');
  const sourceEl = document.getElementById('current-info-source');

  const item = normalizeCurrentInfoItem({
    date: dateEl.value,
    title: titleEl.value,
    topic: topicEl.value,
    source: sourceEl.value || DIRECTOR_EMAIL,
    body: bodyEl.value
  });
  if (!item) {
    setCurrentInfoStatus('Wklej treść albo tytuł wiadomości.');
    return;
  }
  if (isScheduleCurrentInfo(item)) {
    setCurrentInfoStatus('Ta wiadomość wygląda jak harmonogram dyżurów. Nie została zapisana w bieżących informacjach.');
    return;
  }

  currentInfoItems.push(item);
  saveCurrentInfo();
  clearCurrentInfoForm();
  setCurrentInfoStatus('Zapisano bieżącą informację.');
}

function clearCurrentInfoForm() {
  const today = new Date().toISOString().slice(0, 10);
  const fields = {
    'current-info-date': today,
    'current-info-title': '',
    'current-info-topic': '',
    'current-info-source': DIRECTOR_EMAIL,
    'current-info-body-input': ''
  };
  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
}

async function importCurrentInfoFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const text = await readFileText(file);
    fillCurrentInfoForm(parseCurrentInfoText(text, file.name));
    setCurrentInfoStatus('Wczytano plik do formularza. Sprawdź tytuł i zapisz.');
  } catch (err) {
    setCurrentInfoStatus(`Nie udało się wczytać wiadomości: ${err.message}`);
  } finally {
    input.value = '';
  }
}

function parseCurrentInfoText(text, fileName = '') {
  const subject = text.match(/^Subject:\s*(.+)$/im)?.[1]?.trim() || '';
  const from = text.match(/^From:\s*(.+)$/im)?.[1]?.trim() || DIRECTOR_EMAIL;
  const rawDate = text.match(/^Date:\s*(.+)$/im)?.[1]?.trim() || '';
  const cleaned = text
    .replace(/^From:.*$/gim, '')
    .replace(/^To:.*$/gim, '')
    .replace(/^Subject:.*$/gim, '')
    .replace(/^Date:.*$/gim, '')
    .trim();
  return {
    date: normalizeInfoDate(rawDate),
    title: subject || fileName.replace(/\.[^.]+$/, '') || buildCurrentInfoTitle(cleaned),
    topic: detectCurrentInfoTopic(subject, cleaned),
    source: from.includes(DIRECTOR_EMAIL) ? DIRECTOR_EMAIL : from,
    body: cleaned || text.trim()
  };
}

function fillCurrentInfoForm(item) {
  const values = {
    'current-info-date': normalizeInfoDate(item.date),
    'current-info-title': item.title || '',
    'current-info-topic': item.topic || '',
    'current-info-source': item.source || DIRECTOR_EMAIL,
    'current-info-body-input': item.body || ''
  };
  Object.entries(values).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
}

function buildCurrentInfoTitle(body = '') {
  const firstLine = String(body).split(/\n/).map(line => line.trim()).find(Boolean) || '';
  return firstLine.slice(0, 120) || 'Bieżąca informacja';
}

function detectCurrentInfoTopic(title = '', body = '') {
  const text = normalizeForCurrentInfoSearch(`${title} ${body}`);
  if (text.includes('telefon')) return 'telefony';
  if (text.includes('przepust') || text.includes('urlop')) return 'przepustki/urlopy';
  if (text.includes('wakac') || text.includes('feri')) return 'organizacja wolnego';
  if (text.includes('rada') || text.includes('zebr')) return 'zebranie';
  if (text.includes('regulamin') || text.includes('zarzadzen')) return 'regulamin/zarządzenie';
  return 'informacja';
}

function isScheduleCurrentInfo(item) {
  const text = normalizeForCurrentInfoSearch(`${item.title} ${item.topic} ${item.body}`);
  const scheduleWords = ['harmonogram', 'dyzur', 'grafik', 'plan pracy', 'zastepuje', 'nadgodzin'];
  return scheduleWords.some(word => text.includes(word)) && !text.includes('zarzadzen');
}

function updateCurrentInfoCounter(visible, total) {
  const el = document.getElementById('current-info-count');
  if (!el) return;
  el.textContent = total ? `Wpisy: ${visible}/${total}` : 'Wpisy: 0';
}

function setCurrentInfoStatus(text) {
  const el = document.getElementById('current-info-status');
  if (el) el.textContent = text;
}

function loadCurrentInfoSyncSettings() {
  const settings = getCurrentInfoSyncSettings();
  const tokenEl = document.getElementById('current-info-sync-token');
  const autoEl = document.getElementById('current-info-sync-auto');
  if (tokenEl) tokenEl.value = settings.token || '';
  if (autoEl) autoEl.checked = Boolean(settings.auto);
  setCurrentInfoSyncMeta(settings.lastSyncAt || '');
}

function getCurrentInfoSyncSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CURRENT_INFO_SYNC_KEY) || '{}');
    return {
      token: String(parsed.token || ''),
      auto: Boolean(parsed.auto),
      lastSyncAt: String(parsed.lastSyncAt || '')
    };
  } catch {
    return { token: '', auto: false, lastSyncAt: '' };
  }
}

function saveCurrentInfoSyncSettings(extra = {}) {
  const tokenEl = document.getElementById('current-info-sync-token');
  const autoEl = document.getElementById('current-info-sync-auto');
  const current = getCurrentInfoSyncSettings();
  const settings = {
    token: tokenEl ? tokenEl.value.trim() : current.token,
    auto: autoEl ? autoEl.checked : current.auto,
    lastSyncAt: current.lastSyncAt,
    ...extra
  };
  localStorage.setItem(CURRENT_INFO_SYNC_KEY, JSON.stringify(settings));
  setCurrentInfoSyncMeta(settings.lastSyncAt);
  setCurrentInfoStatus('Zapisano ustawienia synchronizacji.');
  return settings;
}

function setCurrentInfoSyncMeta(lastSyncAt = '') {
  const el = document.getElementById('current-info-sync-meta');
  if (!el) return;
  el.textContent = lastSyncAt
    ? `Ostatnia synchronizacja: ${new Date(lastSyncAt).toLocaleString('pl-PL')}`
    : 'Synchronizacja nie była jeszcze uruchomiona.';
}

async function autoSyncCurrentInfoMail() {
  const settings = getCurrentInfoSyncSettings();
  if (!settings.auto || !settings.token) return;
  const last = settings.lastSyncAt ? new Date(settings.lastSyncAt).getTime() : 0;
  const sixHours = 6 * 60 * 60 * 1000;
  if (last && Date.now() - last < sixHours) return;
  await syncCurrentInfoMail(false);
}

async function syncCurrentInfoMail(manual = true) {
  const settings = saveCurrentInfoSyncSettings({ lastSyncAt: getCurrentInfoSyncSettings().lastSyncAt });
  if (!settings.token) {
    setCurrentInfoStatus('Wpisz token synchronizacji poczty.');
    return;
  }
  try {
    setCurrentInfoStatus(manual ? 'Pobieram wiadomości z poczty...' : 'Automatycznie sprawdzam pocztę...');
    const response = await fetch(`${getAIBackendBaseUrl()}/api/current-info-mail`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: settings.token,
        since: CURRENT_INFO_START_DATE,
        limit: 800
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || `Błąd synchronizacji HTTP ${response.status}`);
    }
    const before = currentInfoItems.length;
    mergeCurrentInfoItems(data.items || []);
    const added = currentInfoItems.length - before;
    const lastSyncAt = new Date().toISOString();
    saveCurrentInfoSyncSettings({ lastSyncAt });
    const newest = data.newestDate ? ` Najnowsza wiadomość: ${data.newestDate}.` : '';
    setCurrentInfoStatus(`Synchronizacja zakończona. Nowe wpisy: ${added}. Pobrane z poczty: ${data.count || 0}.${newest}`);
  } catch (err) {
    setCurrentInfoStatus(`Nie udało się pobrać poczty: ${err.message}`);
  }
}

function mergeCurrentInfoItems(items = []) {
  const known = new Set(currentInfoItems.map(getCurrentInfoFingerprint));
  items.map(normalizeCurrentInfoItem).filter(Boolean).forEach(item => {
    if (isScheduleCurrentInfo(item)) return;
    const fingerprint = getCurrentInfoFingerprint(item);
    if (known.has(fingerprint)) return;
    known.add(fingerprint);
    currentInfoItems.push(item);
  });
  saveCurrentInfo();
}

function getCurrentInfoFingerprint(item) {
  return normalizeForCurrentInfoSearch(`${item.date}|${item.title}|${String(item.body || '').slice(0, 220)}`);
}

function getCurrentInfoContext() {
  return sortCurrentInfo(currentInfoItems)
    .slice(0, 40)
    .map(item => ({
      date: item.date,
      title: item.title,
      topic: item.topic,
      source: item.source,
      body: item.body.slice(0, 4000)
    }));
}

function askAIAboutCurrentInfo(id = '') {
  const item = id ? currentInfoItems.find(x => String(x.id) === String(id)) : null;
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const ta = document.getElementById('chat-input');
  ta.value = item
    ? `Zinterpretuj bieżącą informację od dyrekcji i powiedz, jakie ma znaczenie dla pracy wychowawcy.\n\nData: ${item.date}\nTytuł: ${item.title}\nDotyczy: ${item.topic}\nŹródło: ${item.source}\n\nTreść:\n${item.body.slice(0, 8000)}`
    : 'Uwzględnij zapisane bieżące informacje od dyrekcji. Wskaż, które informacje mogą mieć praktyczne znaczenie dla najbliższych dyżurów i jakie źródło należy podać.';
  autoResizeTA(ta);
  saveChatDraft();
  sendChat();
}

function normalizeForCurrentInfoSearch(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
