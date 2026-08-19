/* ────────────────────────────────
   HARMONOGRAM
──────────────────────────────── */
let internatScheduleReindexPromise = null;

function mergeInternatScheduleDocuments(documents = []) {
  const index = loadInternatScheduleIndex();
  let changed = 0;

  documents.map(normalizeInternatScheduleDocument).filter(Boolean).forEach(documentItem => {
    const existingIndex = index.findIndex(item => item.id === documentItem.id);
    if (existingIndex >= 0) index[existingIndex] = documentItem;
    else index.push(documentItem);
    changed += 1;
  });

  try {
    localStorage.setItem(INTERNAT_SCHEDULE_INDEX_KEY, JSON.stringify(index));
  } catch {
    setCurrentInfoStatus('Poczta została pobrana, ale na urządzeniu zabrakło miejsca na lokalny indeks grafików.');
  }
  refreshInternatScheduleStatus();
  return changed;
}

function loadInternatScheduleIndex() {
  try {
    const parsed = JSON.parse(localStorage.getItem(INTERNAT_SCHEDULE_INDEX_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeInternatScheduleDocument).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function normalizeInternatScheduleDocument(item) {
  if (!item || typeof item !== 'object') return null;
  const weekStart = /^\d{4}-\d{2}-\d{2}$/.test(String(item.weekStart || '')) ? String(item.weekStart) : '';
  const sourceMailUid = String(item.sourceMailUid || '');
  const sourceAttachment = String(item.sourceAttachment || '').slice(0, 180);
  const id = String(item.id || `${sourceMailUid}:${item.sourceAttachmentId || sourceAttachment}`);
  if (!id) return null;

  const records = (Array.isArray(item.records) ? item.records : []).map(record => {
    const date = String(record?.date || '');
    const employee = String(record?.employee || '').trim();
    const from = String(record?.from || '');
    const to = String(record?.to || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !employee || !/^\d{2}:\d{2}$/.test(from) || !/^\d{2}:\d{2}$/.test(to)) return null;
    return {
      date,
      employee: employee.slice(0, 120),
      group: String(record.group || '').trim().slice(0, 80),
      from,
      to,
      weekStart: String(record.weekStart || weekStart),
      sourceMailUid,
      sourceTitle: String(item.sourceTitle || record.sourceTitle || '').slice(0, 180),
      sourceAttachment,
      sourceDate: String(item.sourceDate || record.sourceDate || '')
    };
  }).filter(Boolean);

  return {
    id,
    weekStart,
    sourceMailUid,
    sourceTitle: String(item.sourceTitle || '').slice(0, 180),
    sourceAttachment,
    sourceAttachmentId: String(item.sourceAttachmentId || ''),
    sourceAttachmentOrder: Number(item.sourceAttachmentOrder || 0),
    sourceDate: String(item.sourceDate || ''),
    indexedAt: String(item.indexedAt || new Date().toISOString()),
    scheduleKind: classifyInternatScheduleKind(item.scheduleKind, `${item.sourceTitle || ''} ${sourceAttachment}`),
    isCorrection: Boolean(item.isCorrection),
    ambiguous: Boolean(item.ambiguous),
    warning: String(item.warning || '').slice(0, 300),
    records
  };
}

function classifyInternatScheduleKind(value, sourceHint = '') {
  if (value === 'internat' || value === 'team') return value;
  const normalized = normalizeInternatScheduleText(sourceHint);
  if (/\bzespol/.test(normalized)) return 'team';
  if (/\binternat/.test(normalized)) return 'internat';
  return 'unknown';
}

async function queryInternatSchedule() {
  const input = document.getElementById('internat-schedule-question');
  const result = document.getElementById('internat-schedule-result');
  if (!input || !result) return;

  result.style.display = 'block';
  result.replaceChildren();
  let index = loadInternatScheduleIndex();
  if (!hasInternatScheduleCurrentWeek(index, new Date())) {
    result.textContent = 'Indeks grafiku jest pusty — trwa synchronizacja...';
    await ensureInternatScheduleIndex();
    index = loadInternatScheduleIndex();
  }

  const answer = getInternatScheduleAnswer(input.value, index, new Date());
  const backendStatus = getInternatScheduleBackendStatus();

  if (answer.status !== 'ok') {
    if (answer.status === 'ambiguous') {
      result.textContent = 'Znaleziono kilka pasujących osób albo dane korekty są niejednoznaczne — doprecyzuj nazwisko i sprawdź grafik źródłowy.';
    } else if (backendStatus === 'incompatible') {
      result.textContent = 'Indeks grafików nie jest dostępny — backend wymaga aktualizacji lub ponownego wdrożenia.';
    } else {
      result.textContent = 'Brak danych dla tej osoby w aktualnym grafiku.';
    }
    appendInternatScheduleSources(result, answer.sources || answer.source);
    return;
  }

  const heading = document.createElement('div');
  heading.style.fontWeight = '900';
  heading.style.marginBottom = '6px';
  heading.textContent = `${answer.employee} — bieżący tydzień`;
  result.appendChild(heading);

  answer.records.forEach(record => {
    const line = document.createElement('div');
    line.textContent = `${formatInternatScheduleDate(record.date)} — ${record.from}–${record.to}${record.group ? ` — ${formatInternatScheduleGroup(record.group)}` : ''}`;
    result.appendChild(line);
  });
  if (answer.requiresVerification) {
    const warning = document.createElement('div');
    warning.style.marginTop = '8px';
    warning.textContent = 'Część danych pochodzi z niepełnej korekty — sprawdź wskazane źródło.';
    result.appendChild(warning);
  }
  appendInternatScheduleSources(result, answer.sources || answer.source);
}

function getInternatScheduleAnswer(query, index, now = new Date()) {
  const queryTokens = getInternatScheduleQueryTokens(query);
  const active = buildActiveInternatSchedule(index, now);
  if (!queryTokens.length || !active.documents.length) return { status: 'missing', sources: active.sources };

  const employeeByKey = new Map();
  active.records.forEach(record => {
    const key = normalizeInternatScheduleText(record.employee);
    if (!employeeByKey.has(key)) employeeByKey.set(key, record.employee);
  });
  const employeeNames = [...employeeByKey.values()];
  const matches = employeeNames.filter(name => internatScheduleNameMatches(name, queryTokens));

  if (matches.length !== 1) {
    return {
      status: matches.length > 1 ? 'ambiguous' : 'missing',
      sources: active.sources,
      requiresVerification: active.requiresVerification
    };
  }

  const employee = matches[0];
  const employeeKey = normalizeInternatScheduleText(employee);
  const seen = new Set();
  const records = active.records
    .filter(record => normalizeInternatScheduleText(record.employee) === employeeKey)
    .filter(record => {
      const key = `${record.date}|${record.from}|${record.to}|${record.group}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => `${a.date} ${a.from}`.localeCompare(`${b.date} ${b.from}`));

  const sourceIds = new Set(records.map(record => record.sourceDocumentId).filter(Boolean));
  active.contributors.forEach(documentItem => {
    const concernsEmployee = documentItem.records.some(record => normalizeInternatScheduleText(record.employee) === employeeKey);
    if (concernsEmployee || (documentItem.isCorrection && documentItem.ambiguous && !documentItem.records.length)) {
      sourceIds.add(documentItem.id);
    }
  });
  const sources = active.documents.filter(documentItem => sourceIds.has(documentItem.id));

  return records.length
    ? { status: 'ok', employee, records, sources, requiresVerification: active.requiresVerification }
    : { status: 'missing', sources: active.sources, requiresVerification: active.requiresVerification };
}

function buildActiveInternatSchedule(index, now = new Date()) {
  const weekStart = getInternatWeekStart(now);
  const documents = (Array.isArray(index) ? index : [])
    .map(normalizeInternatScheduleDocument)
    .filter(item => item && item.weekStart === weekStart)
    .sort(compareInternatScheduleDocuments);
  const records = [];
  const contributors = [];
  let requiresVerification = false;

  ['internat', 'team', 'unknown'].forEach(scheduleKind => {
    const kindDocuments = documents.filter(item => item.scheduleKind === scheduleKind);
    if (!kindDocuments.length) return;
    const base = kindDocuments.find(item => !item.isCorrection) || null;
    let kindRecords = base
      ? base.records.map(record => ({ ...record, sourceDocumentId: base.id }))
      : [];
    if (base) contributors.push(base);
    if (base?.ambiguous) requiresVerification = true;

    const corrections = kindDocuments
      .filter(item => item.isCorrection && (!base || compareInternatScheduleDocuments(item, base) <= 0))
      .sort((a, b) => compareInternatScheduleDocuments(b, a));
    corrections.forEach(correction => {
      const applied = applyInternatScheduleCorrection(kindRecords, correction);
      kindRecords = applied.records;
      if (applied.used || correction.ambiguous) contributors.push(correction);
      if (correction.ambiguous || applied.uncertain) requiresVerification = true;
    });

    if (!base && corrections.length) requiresVerification = true;
    records.push(...kindRecords);
  });

  return {
    weekStart,
    documents,
    records,
    contributors: uniqueInternatScheduleDocuments(contributors),
    sources: uniqueInternatScheduleDocuments(contributors.length ? contributors : documents),
    requiresVerification
  };
}

function applyInternatScheduleCorrection(existingRecords, correction) {
  const records = [...existingRecords];
  const groups = new Map();
  correction.records.forEach(record => {
    const key = `${record.date}|${normalizeInternatScheduleText(record.employee)}|${normalizeInternatScheduleText(record.group)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...record, sourceDocumentId: correction.id });
  });
  let uncertain = false;

  groups.forEach(correctionRecords => {
    const sample = correctionRecords[0];
    const samePersonAndDate = records
      .map((record, index) => ({ record, index }))
      .filter(item => item.record.date === sample.date
        && normalizeInternatScheduleText(item.record.employee) === normalizeInternatScheduleText(sample.employee));
    const sameGroup = sample.group
      ? samePersonAndDate.filter(item => normalizeInternatScheduleText(item.record.group) === normalizeInternatScheduleText(sample.group))
      : [];
    const replace = sameGroup.length ? sameGroup : samePersonAndDate.length === 1 ? samePersonAndDate : [];
    if (samePersonAndDate.length > 1 && !sameGroup.length) uncertain = true;
    [...replace].sort((a, b) => b.index - a.index).forEach(item => records.splice(item.index, 1));
    records.push(...correctionRecords);
  });

  return { records, used: correction.records.length > 0, uncertain };
}

function uniqueInternatScheduleDocuments(documents) {
  const seen = new Set();
  return documents.filter(item => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function hasInternatScheduleCurrentWeek(index, now = new Date()) {
  const weekStart = getInternatWeekStart(now);
  return (Array.isArray(index) ? index : [])
    .map(normalizeInternatScheduleDocument)
    .some(item => item?.weekStart === weekStart);
}

function getInternatScheduleBackendStatus() {
  try {
    return localStorage.getItem(INTERNAT_SCHEDULE_BACKEND_STATUS_KEY) || 'unknown';
  } catch {
    return 'unknown';
  }
}

function setInternatScheduleBackendStatus(status) {
  const value = status === 'incompatible' ? 'incompatible' : 'compatible';
  try {
    localStorage.setItem(INTERNAT_SCHEDULE_BACKEND_STATUS_KEY, value);
  } catch {
    // Status jest pomocniczy; brak miejsca nie może blokować synchronizacji poczty.
  }
  refreshInternatScheduleStatus();
}

async function ensureInternatScheduleIndex() {
  const now = new Date();
  const weekStart = getInternatWeekStart(now);
  const index = loadInternatScheduleIndex();
  if (hasInternatScheduleCurrentWeek(index, now)) {
    refreshInternatScheduleStatus(now);
    return false;
  }

  if (internatScheduleReindexPromise) return internatScheduleReindexPromise;
  const marker = `${weekStart}:index-v4`;
  try {
    if (localStorage.getItem(INTERNAT_SCHEDULE_REINDEX_KEY) === marker
      || sessionStorage.getItem(INTERNAT_SCHEDULE_REINDEX_KEY) === marker) {
      refreshInternatScheduleStatus(now);
      return false;
    }
  } catch {
    // Ochrona sesyjna jest opcjonalna; blokada w pamięci nadal zapobiega pętli.
  }

  const settings = getCurrentInfoSyncSettings();
  const testAccessToken = typeof getTestAccessToken === 'function' ? getTestAccessToken() : '';
  if (!settings.token && !testAccessToken) {
    setInternatScheduleStatus('Indeks grafiku jest pusty — zapisz token poczty w zakładce INF, aby pobrać załączniki.');
    return false;
  }

  try {
    sessionStorage.setItem(INTERNAT_SCHEDULE_REINDEX_KEY, marker);
  } catch {
    // Brak sessionStorage nie blokuje jednorazowej próby w bieżącym widoku.
  }
  setInternatScheduleStatus('Indeks grafiku jest pusty — sprawdzam grafiki z ostatnich 6 tygodni...');
  internatScheduleReindexPromise = (async () => {
    const syncResult = await syncCurrentInfoMail(false, { since: getInternatScheduleReindexSince(now) });
    if (syncResult?.ok && syncResult.scheduleIndexSupported) {
      try {
        localStorage.setItem(INTERNAT_SCHEDULE_REINDEX_KEY, marker);
      } catch {
        // Przy braku miejsca znacznik pozostanie tylko w bieżącej sesji.
      }
    }
    refreshInternatScheduleStatus(now);
    return Boolean(syncResult?.ok && syncResult.scheduleIndexSupported);
  })();
  try {
    return await internatScheduleReindexPromise;
  } finally {
    internatScheduleReindexPromise = null;
  }
}

function getInternatScheduleReindexSince(now = new Date()) {
  const date = now instanceof Date ? new Date(now) : new Date(now);
  if (Number.isNaN(date.getTime())) return CURRENT_INFO_START_DATE;
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - 42);
  return formatInternatIsoDate(date);
}

function refreshInternatScheduleStatus(now = new Date()) {
  const backendStatus = getInternatScheduleBackendStatus();
  const index = loadInternatScheduleIndex();
  const active = buildActiveInternatSchedule(index, now);
  if (active.documents.length) {
    setInternatScheduleStatus(`Grafiki: ${active.documents.length} ${active.documents.length === 1 ? 'dokument' : 'dokumenty'} · ${active.records.length} wpisów · tydzień ${formatInternatScheduleWeek(active.weekStart)}`);
    return;
  }
  if (backendStatus === 'incompatible') {
    setInternatScheduleStatus('Backend nie zwraca danych indeksu grafików — wymaga aktualizacji lub ponownego wdrożenia.');
    return;
  }
  const indexedWeeks = [...new Set(index.map(item => item.weekStart).filter(Boolean))].sort().slice(-6);
  if (indexedWeeks.length) {
    setInternatScheduleStatus(`Brak grafiku dla tygodnia ${formatInternatScheduleWeek(active.weekStart)}. Zaindeksowane początki tygodni: ${indexedWeeks.join(', ')}.`);
    return;
  }
  setInternatScheduleStatus(internatScheduleReindexPromise
    ? 'Indeks grafiku jest pusty — trwa synchronizacja...'
    : 'Brak zaindeksowanego grafiku dla bieżącego tygodnia.');
}

function setInternatScheduleStatus(text) {
  const status = document.getElementById('internat-schedule-index-status');
  if (status) status.textContent = text;
}

function formatInternatScheduleWeek(weekStart) {
  const start = new Date(`${weekStart}T12:00:00`);
  if (Number.isNaN(start.getTime())) return weekStart;
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startText = start.getMonth() === end.getMonth()
    ? String(start.getDate()).padStart(2, '0')
    : start.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
  const endText = end.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
  return `${startText}–${endText}`;
}

function getInternatScheduleQueryTokens(value) {
  const stopWords = new Set([
    'czy', 'grafik', 'harmonogram', 'jak', 'jaki', 'jakie', 'kiedy', 'ma', 'pokaz', 'pracuje',
    'pracy', 'sprawdz', 'ten', 'tym', 'tydzien', 'tygodniu', 'w', 'wychowawca', 'wychowawcy'
  ]);
  return normalizeInternatScheduleText(value)
    .split(/[^a-z0-9-]+/)
    .filter(token => token.length > 2 && !stopWords.has(token))
    .map(normalizeInternatScheduleNameToken);
}

function internatScheduleNameMatches(employee, queryTokens) {
  const nameTokens = normalizeInternatScheduleText(employee)
    .split(/[^a-z0-9-]+/)
    .filter(Boolean)
    .map(normalizeInternatScheduleNameToken);
  return queryTokens.every(queryToken => nameTokens.includes(queryToken));
}

function normalizeInternatScheduleNameToken(token) {
  if (token.length > 6 && token.endsWith('ego')) return token.slice(0, -3);
  return token;
}

function normalizeInternatScheduleText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l');
}

function getInternatWeekStart(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  date.setHours(12, 0, 0, 0);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return formatInternatIsoDate(date);
}

function formatInternatIsoDate(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function compareInternatScheduleDocuments(a, b) {
  const byDate = String(b.sourceDate || '').localeCompare(String(a.sourceDate || ''));
  if (byDate) return byDate;
  const byUid = Number(b.sourceMailUid || 0) - Number(a.sourceMailUid || 0);
  if (byUid) return byUid;
  const byAttachment = Number(b.sourceAttachmentOrder || 0) - Number(a.sourceAttachmentOrder || 0);
  if (byAttachment) return byAttachment;
  return String(b.indexedAt || '').localeCompare(String(a.indexedAt || ''));
}

function formatInternatScheduleDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  const text = date.toLocaleDateString('pl-PL', { weekday: 'long', day: '2-digit', month: '2-digit' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatInternatScheduleGroup(group) {
  const value = String(group || '').trim();
  return /^gr(?:upa)?\.?\s/i.test(value) ? value.replace(/^gr\.?\s/i, 'grupa ') : `grupa ${value}`;
}

function appendInternatScheduleSources(container, value) {
  const sources = uniqueInternatScheduleDocuments(Array.isArray(value) ? value : value ? [value] : []);
  sources.forEach((source, index) => {
    const label = document.createElement('div');
    label.style.marginTop = index ? '4px' : '8px';
    const title = source.sourceTitle || 'grafik z poczty';
    label.textContent = `Źródło: ${title}${source.sourceAttachment ? ` — ${source.sourceAttachment}` : ''}`;
    container.appendChild(label);

    if (!source.sourceMailUid) return;
    const button = document.createElement('button');
    button.className = 'btn sec';
    button.type = 'button';
    button.style.marginTop = '6px';
    button.textContent = 'Pokaż źródło';
    button.onclick = () => showInternatScheduleSource(source.sourceMailUid, source.sourceAttachment);
    container.appendChild(button);
  });
}

function showInternatScheduleSource(mailUid, attachmentName = '') {
  const item = currentInfoItems.find(entry => String(entry.mailUid || '') === String(mailUid));
  if (!item) {
    const result = document.getElementById('internat-schedule-result');
    if (result) result.append(' Nie znaleziono tego maila w lokalnym archiwum INF. Pobierz pocztę ponownie.');
    return;
  }

  const search = document.getElementById('current-info-search');
  if (search) search.value = '';
  nav('s-info', document.querySelector('.nav-btn[onclick*="s-info"]'));
  renderCurrentInfoList();
  const row = [...document.querySelectorAll('.current-info-item')]
    .find(element => element.dataset.mailUid === String(mailUid));
  const toggle = row?.querySelector('.current-info-toggle');
  const body = row?.querySelector('.current-info-body');
  if (toggle && body && !body.classList.contains('open')) toggleCurrentInfoBody(item.id, toggle, body);
  row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setCurrentInfoStatus(`Źródło grafiku: ${item.title}${attachmentName ? ` — ${attachmentName}` : ''}.`);
}

async function handleHarmFile(input) {
  const file = input.files[0];
  if (!file) return;
  harmFileName = file.name;
  try {
    harmAttachment = await fileToAttachment(file);
    harmContent = harmAttachment.text || '';
    showHarmFile(file, harmAttachment);
    renderHarmPreview(harmAttachment);
    if (harmContent) extractHarmNames();
    else document.getElementById('harm-pills').innerHTML = '';
  } catch (err) {
    appendMsg('err', 'Błąd odczytu pliku harmonogramu.');
  }
}

function showHarmFile(file, attachment = null) {
  const size = file.size < 1024 ? `${file.size} B` : `${(file.size/1024).toFixed(1)} KB`;
  document.getElementById('harm-file-list').innerHTML = `
    <div class="file-item">
      <span class="fi-icon">${attachment && isImageAttachment(attachment) ? '🖼' : '📋'}</span>
      <span class="fi-name">${file.name}</span>
      <span class="fi-size">${size}</span>
      <button class="fi-del" onclick="removeHarmFile()">✕</button>
    </div>`;
  document.getElementById('harm-loaded').style.display = 'block';
  document.getElementById('harm-result').style.display = 'none';
}

function removeHarmFile() {
  harmContent = null;
  harmFileName = null;
  harmAttachment = null;
  document.getElementById('harm-file-list').innerHTML = '';
  document.getElementById('harm-preview').style.display = 'none';
  document.getElementById('harm-preview').innerHTML = '';
  document.getElementById('harm-loaded').style.display = 'none';
  document.getElementById('harm-file-input').value = '';
}

function renderHarmPreview(attachment) {
  const el = document.getElementById('harm-preview');
  if (!el || !attachment) return;
  if (isImageAttachment(attachment) && attachment.dataUrl) {
    el.style.display = 'block';
    el.innerHTML = `
      <img src="${attachment.dataUrl}" alt="Screen harmonogramu" onclick="openImageViewer('${attachment.dataUrl}')">
      <button class="btn sec" style="width:100%;margin-top:8px" onclick="openImageViewer('${attachment.dataUrl}')">🔍 Powiększ screen</button>
    `;
    return;
  }
  el.style.display = 'none';
  el.innerHTML = '';
}

function extractHarmNames() {
  if (!harmContent) return;
  // Wyodrębnij unikalne słowa wyglądające jak nazwiska (z dużej litery, min 4 znaki)
  const lines = harmContent.split(/[\n\r]+/);
  const names = new Set();
  lines.forEach(line => {
    // szukaj wzorców: Imię Nazwisko lub Nazwisko
    const matches = line.match(/[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{3,}(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{3,})?/g);
    if (matches) matches.forEach(m => names.add(m.trim()));
  });
  // Pokaż max 8 jako pills
  const pills = [...names].slice(0, 8);
  document.getElementById('harm-pills').innerHTML =
    pills.map(n => `<button class="pill" onclick="document.getElementById('wych-input').value='${n.replace(/'/g,"\\'")}'; queryHarm()">👤 ${n}</button>`).join('');
}

function queryHarm() {
  const name = document.getElementById('wych-input').value.trim();
  if (!name) return;
  if (!harmContent) {
    const resultEl = document.getElementById('harm-result');
    const bodyEl   = document.getElementById('harm-result-body');
    resultEl.style.display = 'block';
    bodyEl.textContent = 'Ten format harmonogramu najlepiej przeanalizuje AI. Kliknij „Zapytaj AI o harmonogram”.';
    return;
  }

  const lines = harmContent.split(/[\n\r]+/);
  const nameLower = name.toLowerCase();

  // Znajdź wszystkie linie zawierające dane imię/nazwisko
  const matches = lines.filter(l => l.toLowerCase().includes(nameLower));

  const resultEl = document.getElementById('harm-result');
  const bodyEl   = document.getElementById('harm-result-body');
  resultEl.style.display = 'block';

  if (!matches.length) {
    bodyEl.textContent = `Nie znaleziono żadnych wpisów dla: "${name}"\n\nSprawdź pisownię lub wyszukaj inną osobę.`;
    return;
  }

  bodyEl.textContent = `WYNIKI DLA: ${name.toUpperCase()}\n` +
    `Znalezione wpisy (${matches.length}):\n\n` +
    matches.join('\n');
}

async function sendHarmToAI() {
  if (!harmContent && !harmAttachment) return;
  const name = document.getElementById('wych-input').value.trim();

  nav('s-ai', document.querySelector('.nav-btn:last-child'));

  const question = name
    ? `Na podstawie załączonego harmonogramu podsumuj dyżury i plan pracy dla wychowawcy: ${name}. Jeżeli dane są nieczytelne, dopytaj o brakujący fragment.\n\n--- HARMONOGRAM TEKSTOWY ---\n${(harmContent || '').slice(0, 5000)}`
    : `Przeanalizuj załączony harmonogram internatu i podsumuj go. Jeżeli pytanie jest zbyt ogólne albo dane są nieczytelne, zadaj pytanie doprecyzowujące.\n\n--- HARMONOGRAM TEKSTOWY ---\n${(harmContent || '').slice(0, 5000)}`;

  if (harmAttachment) {
    aiAttachments = [harmAttachment];
    renderAIAttachments();
  }
  document.getElementById('chat-input').value = question;
  await sendChat();
}

function openImageViewer(src) {
  imageZoom = 1;
  const viewer = document.getElementById('image-viewer');
  const img = document.getElementById('image-viewer-img');
  img.src = src;
  img.style.setProperty('--zoom', imageZoom);
  viewer.classList.add('open');
}

function closeImageViewer(e) {
  const viewer = document.getElementById('image-viewer');
  if (!e || e.target === viewer) viewer.classList.remove('open');
}

function zoomImage(delta) {
  imageZoom = Math.max(0.75, Math.min(3, imageZoom + delta));
  document.getElementById('image-viewer-img').style.setProperty('--zoom', imageZoom);
}
