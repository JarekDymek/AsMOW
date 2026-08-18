/* ────────────────────────────────
   HARMONOGRAM
──────────────────────────────── */
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
    isCorrection: Boolean(item.isCorrection),
    ambiguous: Boolean(item.ambiguous),
    warning: String(item.warning || '').slice(0, 300),
    records
  };
}

function queryInternatSchedule() {
  const input = document.getElementById('internat-schedule-question');
  const result = document.getElementById('internat-schedule-result');
  if (!input || !result) return;

  const answer = getInternatScheduleAnswer(input.value, loadInternatScheduleIndex(), new Date());
  result.style.display = 'block';
  result.replaceChildren();

  if (answer.status !== 'ok') {
    result.textContent = answer.status === 'ambiguous'
      ? 'Niewystarczające dane do jednoznacznej odpowiedzi — sprawdź grafik źródłowy.'
      : 'Brak danych dla tej osoby w aktualnie zaindeksowanym grafiku.';
    if (answer.source) appendInternatScheduleSource(result, answer.source);
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
  appendInternatScheduleSource(result, answer.source);
}

function getInternatScheduleAnswer(query, index, now = new Date()) {
  const queryTokens = getInternatScheduleQueryTokens(query);
  const weekStart = getInternatWeekStart(now);
  const weekDocuments = (Array.isArray(index) ? index : [])
    .map(normalizeInternatScheduleDocument)
    .filter(item => item && item.weekStart === weekStart)
    .sort(compareInternatScheduleDocuments);

  if (!queryTokens.length || !weekDocuments.length) return { status: 'missing' };

  const newest = weekDocuments[0];
  const currentDocuments = weekDocuments.filter(item => isSameInternatScheduleMail(item, newest));
  const employeeNames = [...new Set(currentDocuments.flatMap(item => item.records.map(record => record.employee)))];
  const matches = employeeNames.filter(name => internatScheduleNameMatches(name, queryTokens));
  const source = newest;

  if (matches.length !== 1) {
    const uncertain = matches.length > 1 || currentDocuments.some(item => item.ambiguous || item.isCorrection);
    return { status: uncertain ? 'ambiguous' : 'missing', source };
  }

  const employee = matches[0];
  const employeeDocuments = currentDocuments
    .filter(item => item.records.some(record => record.employee === employee))
    .sort(compareInternatScheduleDocuments);
  const selected = employeeDocuments[0];
  if (!selected || selected.ambiguous) return { status: 'ambiguous', source: selected || source };

  const seen = new Set();
  const records = selected.records
    .filter(record => record.employee === employee)
    .filter(record => {
      const key = `${record.date}|${record.from}|${record.to}|${record.group}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => `${a.date} ${a.from}`.localeCompare(`${b.date} ${b.from}`));

  return records.length
    ? { status: 'ok', employee, records, source: selected }
    : { status: selected.isCorrection ? 'ambiguous' : 'missing', source: selected };
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

function isSameInternatScheduleMail(a, b) {
  if (a.sourceMailUid || b.sourceMailUid) return a.sourceMailUid === b.sourceMailUid;
  return a.sourceDate === b.sourceDate && a.sourceTitle === b.sourceTitle;
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

function appendInternatScheduleSource(container, source) {
  if (!source) return;
  const label = document.createElement('div');
  label.style.marginTop = '8px';
  label.textContent = `Źródło: ${source.sourceTitle || source.sourceAttachment || 'grafik z poczty'}`;
  container.appendChild(label);

  if (!source.sourceMailUid) return;
  const button = document.createElement('button');
  button.className = 'btn sec';
  button.type = 'button';
  button.style.marginTop = '6px';
  button.textContent = 'Pokaż źródło';
  button.onclick = () => showInternatScheduleSource(source.sourceMailUid, source.sourceAttachment);
  container.appendChild(button);
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
