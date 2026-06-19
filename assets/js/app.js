/* Application logic; data constants are loaded from assets/js/data.js */
/* ────────────────────────────────
   STATE
──────────────────────────────── */
let chatHistory = [];
let harmContent = null;
let harmFileName = null;
let speechRecognition = null;
let isListening = false;
let aiAttachments = [];
let harmAttachment = null;
let lastFailedChat = null;
let imageZoom = 1;
let weeklyPlan = null;
let weeklyPlanMeta = null;
let knowledgeItems = [];
let dayScheduleCollapsed = localStorage.getItem('mow_day_schedule_collapsed_v1') === '1';
const CHAT_DRAFT_KEY = 'mow_chat_draft_v2';
const WEEKLY_SETTINGS_KEY = 'mow_weekly_settings_v1';
const WEEKLY_PLAN_KEY = 'mow_weekly_plan_v1';
const KNOWLEDGE_KEY = 'mow_knowledge_base_v1';
const WEEKLY_SAMPLE_URL = 'https://jarekdymek.github.io/Harmonogram-MOW/data/sample-weeks.json';

/* ────────────────────────────────
   INIT
──────────────────────────────── */
function init() {
  renderSchedule();
  renderQuickGrid();
  renderProcs();
  renderStopnie();
  renderLaws();
  renderChatPills();
  loadChatHistory();
  loadChatDraft();
  loadWeeklyPlanState();
  renderWeeklyPlan();
  loadKnowledgeBase();
  renderKnowledgeList();
  loadNotes();
  startClock();
  setupWorkSafeguards();
  setupInstall();
  checkOnline();
  setInterval(checkOnline, 15000);
}

/* ────────────────────────────────
   CLOCK
──────────────────────────────── */
function startClock() {
  tick(); setInterval(tick, 10000);
}
function tick() {
  const now = new Date();
  document.getElementById('live-clock').textContent =
    now.toLocaleTimeString('pl', {hour:'2-digit', minute:'2-digit'});
  const DAYS = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
  const MO = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  document.getElementById('live-date').textContent =
    `${DAYS[now.getDay()]}, ${now.getDate()} ${MO[now.getMonth()]} ${now.getFullYear()}`;
  highlightSlot(now);
}

function toMin(t) {
  const [h,m] = t.split(':').map(Number); return h*60+m;
}
function highlightSlot(now) {
  const cur = now.getHours()*60 + now.getMinutes();
  let found = null;
  for (const s of SCHEDULE) {
    let start = toMin(s.t), end = toMin(s.e);
    if (end < start) end += 1440;
    let c = cur;
    if (end < start && c < start) c += 1440;
    if (c >= start && c < end) { found = s; break; }
  }
  document.getElementById('curr-act').textContent = found ? found.l : '–';
  document.querySelectorAll('.sched-item').forEach(el => el.classList.remove('now'));
  if (found) {
    const el = document.querySelector(`.sched-item[data-t="${found.t}"]`);
    if (el) el.classList.add('now');
  }
}

/* ────────────────────────────────
   RENDER SCHEDULE
──────────────────────────────── */
function renderSchedule() {
  document.getElementById('sched-list').innerHTML =
    SCHEDULE.map(s => `
      <div class="sched-item" data-t="${s.t}">
        <div class="sched-time">${s.t}–${s.e}</div>
        <div>
          <div class="sched-label">${s.l}</div>
          <div class="sched-tip">${s.tip}</div>
        </div>
      </div>`).join('');
  applyDayScheduleState();
}

function toggleDaySchedule() {
  dayScheduleCollapsed = !dayScheduleCollapsed;
  localStorage.setItem('mow_day_schedule_collapsed_v1', dayScheduleCollapsed ? '1' : '0');
  applyDayScheduleState();
}

function applyDayScheduleState() {
  const card = document.getElementById('day-schedule-card');
  const state = document.getElementById('day-schedule-state');
  if (!card || !state) return;
  card.classList.toggle('collapsed', dayScheduleCollapsed);
  state.textContent = dayScheduleCollapsed ? 'Rozwiń' : 'Zwiń';
}

/* ────────────────────────────────
   RENDER QUICK GRID
──────────────────────────────── */
function renderQuickGrid() {
  document.getElementById('quick-grid').innerHTML =
    QUICK_ACTIONS.map(a => `
      <button class="qbtn ${a.cls}" onclick="${a.proc ? `openDetail('${a.proc}')` : `nav('${a.screen}', document.querySelector('.nav-btn:nth-child(${a.screen==='s-stop'?3:5})'))` }">
        <span class="qi">${a.icon}</span>
        <span class="ql">${a.label}</span>
      </button>`).join('');
}

/* ────────────────────────────────
   RENDER PROCEDURES
──────────────────────────────── */
function renderProcs() {
  PROCS.forEach(p => {
    const el = document.createElement('div');
    el.className = `proc-item ${p.sev}`;
    el.dataset.id = p.id;
    el.dataset.search = (p.title+' '+p.sub).toLowerCase();
    el.innerHTML = `
      <span class="proc-icon">${p.icon}</span>
      <div style="flex:1;min-width:0">
        <div class="proc-title">${p.title}</div>
        <div class="proc-sub">${p.sub}</div>
      </div>
      <span class="proc-arrow">›</span>`;
    el.addEventListener('click', () => openDetail(p.id));
    const container = p.cat==='crisis' ? 'pl-crisis' : p.cat==='safety' ? 'pl-safety' : 'pl-other';
    document.getElementById(container).appendChild(el);
  });
}

function filterProcs(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('.proc-item').forEach(el => {
    el.style.display = (!q || el.dataset.search.includes(q)) ? '' : 'none';
  });
}

/* ────────────────────────────────
   RENDER STOPNIE
──────────────────────────────── */
function renderStopnie() {
  STOPNIE.forEach(s => {
    const el = document.createElement('div');
    el.className = `st-card ${s.cls}`;
    el.innerHTML = `
      <div class="st-title">Stopień ${s.lvl}</div>
      <div class="st-kies">💰 Kieszonkowe: ${s.kies}</div>
      <div class="st-crit"><ul>${s.crit.map(c=>`<li>${c}</li>`).join('')}</ul></div>`;
    el.addEventListener('click', () => openStopien(s));
    document.getElementById(s.lvl.startsWith('–') ? 'st-neg' : 'st-pos').appendChild(el);
  });
}

function openStopien(s) {
  document.getElementById('det-title').textContent = `Stopień ${s.lvl}`;
  document.getElementById('det-source').textContent = 'Regulamin Stopni Uspołecznienia – Załącznik nr 7 do Statutu MOW';
  document.getElementById('det-body').innerHTML = `
    <div class="abox info"><span class="ai">💰</span><div><strong>Kieszonkowe: ${s.kies}</strong></div></div>
    <p class="sec-title">✅ Kryteria (wszystkie muszą być spełnione)</p>
    ${s.crit.map((c,i)=>`<div class="step"><div class="step-num">${i+1}</div><div class="step-text">${c}</div></div>`).join('')}
    <p class="sec-title">🎁 Nagrody i przywileje</p>
    ${s.przyw.map(p=>`<div style="padding:7px 0;border-bottom:1px solid var(--border);font-size:.85rem">• ${p}</div>`).join('')}`;
  document.getElementById('detail-view').classList.add('open');
}

/* ────────────────────────────────
   RENDER LAWS
──────────────────────────────── */
function renderLaws() {
  const el = document.getElementById('law-list-render');
  if (!el) return;
  el.innerHTML = LAWS.map(l =>
    `<div class="law-item"><span class="law-num">${l.n}.</span> ${l.t}</div>`
  ).join('');
}

/* ────────────────────────────────
   RENDER CHAT PILLS
──────────────────────────────── */
function renderChatPills() {
  document.getElementById('chat-pills').innerHTML =
    CHAT_PILLS.map(p => `<button class="pill" onclick="setQuestion('${p.replace(/'/g,"\\'")}')">💬 ${p}</button>`).join('');
}

function askAIFromTab(scope, inputId) {
  const input = document.getElementById(inputId);
  const text = input ? input.value.trim() : '';
  const prefixes = {
    procedury: 'Pytanie z zakładki PROCEDURY. Odpowiedz według dokumentów i procedur MOW nr 1 w Malborku. Jeśli opis jest zbyt ogólny, najpierw dopytaj o brakujące fakty.',
    stopnie: 'Pytanie z zakładki STOPNIE USPOŁECZNIENIA. Odpowiedz według regulaminu stopni MOW. Oddziel ocenę zachowania od propozycji rozmowy wychowawczej.',
    prawo: 'Pytanie z zakładki PRAWO. Wskaż podstawę prawną lub dokument MOW, a gdy nie masz pewności, zaznacz to i dopytaj.'
  };
  const question = `${prefixes[scope] || 'Pytanie do AI.'}\n\nPytanie użytkownika: ${text || 'Potrzebuję krótkiej konsultacji w tym obszarze.'}`;
  if (input) input.value = '';
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const ta = document.getElementById('chat-input');
  ta.value = question;
  autoResizeTA(ta);
  saveChatDraft();
  sendChat();
}

/* ────────────────────────────────
   NAVIGATION
──────────────────────────────── */
function nav(screenId, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

/* ────────────────────────────────
   DETAIL VIEW
──────────────────────────────── */
function openDetail(id) {
  const proc = PROCS.find(p => p.id === id);
  if (!proc) return;
  document.getElementById('det-title').textContent = `${proc.icon} ${proc.title}`;
  document.getElementById('det-source').textContent = `Źródło: ${proc.src}`;
  let html = '';
  if (proc.alert) {
    const icons = {danger:'🚨', warn:'⚠️', info:'ℹ️', ok:'✅'};
    html += `<div class="abox ${proc.alert.t}"><span class="ai">${icons[proc.alert.t]||'ℹ️'}</span><div>${proc.alert.txt}</div></div>`;
  }
  html += `<p class="sec-title">📋 Kroki postępowania</p>`;
  html += proc.steps.map((s,i) =>
    `<div class="step"><div class="step-num">${i+1}</div><div class="step-text">${s}</div></div>`).join('');
  if (proc.extra) html += proc.extra;
  document.getElementById('det-body').innerHTML = html;
  document.getElementById('detail-view').classList.add('open');
}

function closeDetail() {
  document.getElementById('detail-view').classList.remove('open');
}

/* ────────────────────────────────
   NOTATNIK (notes stored in localStorage)
──────────────────────────────── */
function loadNotes() { renderNotesList(); }

function saveNote() {
  const ta = document.getElementById('note-input');
  const txt = ta.value.trim();
  if (!txt) return;
  const notes = getNotes();
  notes.unshift({ id: Date.now(), txt, date: new Date().toLocaleString('pl') });
  localStorage.setItem('mow_notes_v2', JSON.stringify(notes));
  ta.value = '';
  renderNotesList();
}

function getNotes() {
  try { return JSON.parse(localStorage.getItem('mow_notes_v2') || '[]'); } catch { return []; }
}

function deleteNote(id) {
  localStorage.setItem('mow_notes_v2', JSON.stringify(getNotes().filter(n => n.id !== id)));
  renderNotesList();
}

function renderNotesList() {
  const el = document.getElementById('notes-list');
  if (!el) return;
  const notes = getNotes();
  el.innerHTML = notes.length
    ? `<p class="sec-title">📁 Zapisane notatki (${notes.length})</p>` +
      notes.map(n => `
        <div class="note-card">
          <div class="note-meta">📅 ${n.date}</div>
          <div class="note-content">${n.txt.replace(/\n/g,'<br>')}</div>
          <button class="note-del" onclick="deleteNote(${n.id})">✕</button>
        </div>`).join('')
    : '<p style="text-align:center;color:var(--muted);font-size:.85rem;padding:20px 0">Brak notatek</p>';
}

/* ────────────────────────────────
   AI CHAT
──────────────────────────────── */
const SYSTEM_PROMPT = `Jesteś asystentem wychowawcy pracującego w Młodzieżowym Ośrodku Wychowawczym nr 1 im. Tadeusza Kościuszki w Malborku. Pomagasz w:
- procedurach postępowania (bójki, ucieczki, narkotyki, próby samobójcze, pożar itp.)
- stopniach uspołecznienia wychowanków (poziomy –2, –1, 0, +1, +2, +3)
- prawie oświatowym i przepisach dotyczących MOW
- technikach wychowawczych i resocjalizacyjnych
- dokumentowaniu zdarzeń

Odpowiadaj po polsku, zwięźle i praktycznie. Używaj list i nagłówków. Gdy chodzi o sytuacje kryzysowe – podkreślaj najważniejsze kroki. Podstawy prawne: UPN (Dz.U. 2022 poz. 1082), Rozp. MEN 2011, Rozp. RM 2011, Statut MOW.`;

function setQuestion(q) {
  const ta = document.getElementById('chat-input');
  ta.value = q;
  autoResizeTA(ta);
  ta.focus();
}

function autoResizeTA(ta) {
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
}

function chatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
}

function clearChat() {
  if (!confirm('Wyczyścić historię rozmowy AI na tym urządzeniu?')) return;
  chatHistory = [];
  localStorage.removeItem('mow_chat_history_v2');
  localStorage.removeItem(CHAT_DRAFT_KEY);
  const win = document.getElementById('chat-window');
  win.innerHTML = '<div class="msg ai">Historia wyczyszczona. Zadaj nowe pytanie!</div>';
}

const DEFAULT_AI_BACKEND_URL = 'https://asmow.onrender.com/api/chat';
const AI_BACKEND_URL = localStorage.getItem('mow_ai_backend_url') || DEFAULT_AI_BACKEND_URL;
const CHAT_STORE_KEY = 'mow_chat_history_v2';
const MOW_DOCUMENTS = [
  'STATUT-M.O.W.pdf',
  'Reg.stopni uspołecznienia.pdf',
  'Procedury, niebezpieczne przedmioty, odwiedziny i korespondencja dotycząca wychowanków MOW w Malborku (2).pdf',
  'STANDARDY-OCHRONY-MALOLETNICH.pdf',
  'Poradnik dla wychowawców w Młodzieżowym Ośrodku Wychowawczym nr 1 w Malborku.docx.pdf',
  'Ustawa z dnia 9 czerwca 2022 r. o wspieraniu i resocjalizacji nieletnich (Dz.U. z 2022 r. poz. 1700) Wybrane zagadnienia.pdf'
];

async function checkOnline() {
  const dot = document.getElementById('ai-dot');
  const txt = document.getElementById('ai-status-txt');
  if (!navigator.onLine) {
    dot.className = 'dot offline';
    txt.textContent = 'Brak połączenia - AI niedostępne';
    return;
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(getAIHealthUrl(), { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    dot.className = 'dot ' + (res.ok ? 'online' : 'offline');
    txt.textContent = res.ok ? 'Połączono - asystent AI dostępny' : 'Backend AI nie odpowiada poprawnie';
  } catch {
    dot.className = 'dot offline';
    txt.textContent = 'Brak połączenia z backendem AI';
  }
}

function getAIHealthUrl() {
  const url = new URL(AI_BACKEND_URL, window.location.href);
  url.pathname = url.pathname.replace(/\/api\/chat\/?$/, '/health');
  return url.toString();
}

function getAIBackendBaseUrl() {
  const url = new URL(AI_BACKEND_URL, window.location.href);
  url.pathname = url.pathname.replace(/\/api\/chat\/?$/, '');
  return url.toString().replace(/\/$/, '');
}

async function sendChat() {
  const ta = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const q = ta.value.trim();
  if (!q && !aiAttachments.length) return;
  const attachmentsToSend = aiAttachments.slice();
  ta.value = '';
  ta.style.height = 'auto';
  localStorage.removeItem(CHAT_DRAFT_KEY);
  aiAttachments = [];
  renderAIAttachments();
  if (sendBtn) sendBtn.disabled = true;

  const userContent = q || 'Przeanalizuj załączone pliki.';
  appendMsg('user', userContent);
  chatHistory.push({ role: 'user', content: userContent });
  saveChatHistory();
  lastFailedChat = {
    question: q,
    attachments: attachmentsToSend,
    history: chatHistory.slice(-18)
  };

  const loading = appendMsg('loading', 'Szukam odpowiedzi w dokumentach i rozmowie...');
  let timer = null;

  try {
    const ctrl = new AbortController();
    timer = setTimeout(() => ctrl.abort(), 90000);
    const res = await fetch(AI_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        messages: chatHistory.slice(-18),
        attachments: attachmentsToSend,
        context: buildAssistantContext(),
        clientTime: new Date().toISOString()
      })
    });
    clearTimeout(timer);

    loading.remove();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (err.code === 'OPENAI_QUOTA') {
        throw new Error(err.error || 'Konto OpenAI nie ma dostępnych środków albo osiągnęło limit wydatków.');
      }
      if (err.code === 'GEMINI_QUOTA') {
        throw new Error(err.error || 'Gemini API osiągnęło darmowy limit zapytań. Spróbuj później albo sprawdź limity w Google AI Studio.');
      }
      if (err.code === 'GEMINI_KEY_MISSING') {
        throw new Error(err.error || 'Brakuje klucza Gemini w ustawieniach Render.');
      }
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const answer = data.answer || data.message || data.content || '(brak odpowiedzi)';
    chatHistory.push({ role: 'assistant', content: answer });
    saveChatHistory();
    lastFailedChat = null;
    appendMsg('ai', answer, data.sources || []);

  } catch (err) {
    if (timer) clearTimeout(timer);
    loading.remove();
    if (!navigator.onLine) {
      appendMsg('err', 'Brak połączenia z Internetem. Sprawdź zasięg sieci.', [], { retry: true });
    } else if (err.name === 'AbortError') {
      appendMsg('err', 'Serwer AI odpowiada zbyt długo. Naciśnij „Powtórz”, żeby ponowić pytanie.', [], { retry: true });
    } else {
      appendMsg('err', `Nie mogę połączyć się z asystentem AI: ${err.message}`, [], { retry: true });
    }
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

function buildAssistantContext() {
  return {
    role: 'mentor i asystent wychowawcy MOW nr 1 w Malborku',
    rule: 'Dokumenty MOW są nadrzędne przy pytaniach o procedury postępowania. Gdy pytanie jest zbyt ogólne, asystent ma dopytać o kontekst.',
    documents: MOW_DOCUMENTS,
    procedures: PROCS.map(p => ({
      title: stripHtml(p.title),
      description: stripHtml(p.sub),
      source: stripHtml(p.src),
      steps: p.steps.map(stripHtml),
      alert: p.alert ? stripHtml(p.alert.txt) : ''
    })),
    socializationLevels: STOPNIE.map(s => ({
      level: stripHtml(s.lvl),
      pocketMoney: stripHtml(s.kies),
      criteria: s.crit.map(stripHtml),
      privileges: s.przyw.map(stripHtml)
    })),
    legalBases: LAWS.map(l => stripHtml(l.t)),
    weeklyPlan: weeklyPlan ? weeklyPlanToText().slice(0, 12000) : '',
    knowledgeBase: getKnowledgeContext()
  };
}

function saveChatDraft() {
  const ta = document.getElementById('chat-input');
  if (!ta) return;
  const value = ta.value.trim();
  if (value) localStorage.setItem(CHAT_DRAFT_KEY, value);
  else localStorage.removeItem(CHAT_DRAFT_KEY);
}

function loadChatDraft() {
  const draft = localStorage.getItem(CHAT_DRAFT_KEY);
  if (!draft) return;
  const ta = document.getElementById('chat-input');
  if (!ta || ta.value.trim()) return;
  ta.value = draft;
  autoResizeTA(ta);
}

function setupWorkSafeguards() {
  window.addEventListener('beforeunload', e => {
    const draft = document.getElementById('chat-input')?.value.trim();
    const kbDraft = document.getElementById('kb-content')?.value.trim();
    if (draft || aiAttachments.length || kbDraft) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

function loadChatHistory() {
  try {
    chatHistory = JSON.parse(localStorage.getItem(CHAT_STORE_KEY) || '[]')
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-18);
  } catch {
    chatHistory = [];
  }
  if (!chatHistory.length) return;
  const win = document.getElementById('chat-window');
  win.innerHTML = '<div class="msg ai">Kontynuuję poprzedni wątek. Możesz dopytać albo wyczyścić historię.</div>';
  chatHistory.forEach(m => appendMsg(m.role === 'user' ? 'user' : 'ai', m.content));
}

function saveChatHistory() {
  localStorage.setItem(CHAT_STORE_KEY, JSON.stringify(chatHistory.slice(-18)));
}

function appendMsg(type, text, sources = [], options = {}) {
  const win = document.getElementById('chat-window');
  const el = document.createElement('div');
  el.className = `msg ${type}`;
  el.innerHTML = formatChatText(text);
  if (sources.length) {
    const src = document.createElement('div');
    src.style.marginTop = '8px';
    src.style.fontSize = '.72rem';
    src.style.color = 'var(--muted)';
    src.innerHTML = '<strong>Źródła:</strong> ' + sources.map(escapeHtml).join('; ');
    el.appendChild(src);
  }
  if (options.retry) {
    const btn = document.createElement('button');
    btn.className = 'retry-btn';
    btn.type = 'button';
    btn.textContent = 'Powtórz';
    btn.onclick = retryLastChat;
    el.appendChild(btn);
  }
  win.appendChild(el);
  win.scrollTop = win.scrollHeight;
  return el;
}

async function retryLastChat() {
  if (!lastFailedChat) return;
  chatHistory = lastFailedChat.history.slice(0, -1);
  aiAttachments = lastFailedChat.attachments || [];
  document.getElementById('chat-input').value = lastFailedChat.question || '';
  renderAIAttachments();
  await sendChat();
}

async function handleAIFileInput(input) {
  const files = [...input.files].slice(0, 6);
  if (!files.length) return;
  try {
    const items = await Promise.all(files.map(fileToAttachment));
    aiAttachments.push(...items);
    renderAIAttachments();
  } catch (err) {
    appendMsg('err', err.message || 'Nie udało się dodać pliku.');
  } finally {
    input.value = '';
  }
}

function renderAIAttachments() {
  const el = document.getElementById('ai-attachments');
  if (!el) return;
  el.innerHTML = aiAttachments.map((a, i) => `
    <span class="attach-chip">
      ${isImageAttachment(a) ? '🖼' : '📄'} ${escapeHtml(a.name)}
      <button type="button" onclick="removeAIAttachment(${i})">×</button>
    </span>
  `).join('');
}

function removeAIAttachment(index) {
  aiAttachments.splice(index, 1);
  renderAIAttachments();
}

function formatChatText(text) {
  return escapeHtml(String(text || ''))
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function stripHtml(value) {
  const box = document.createElement('div');
  box.innerHTML = String(value || '');
  return box.textContent.replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    appendMsg('err', 'Ta przeglądarka nie obsługuje dyktowania głosowego. Użyj Chrome albo Edge na telefonie lub komputerze.');
    return;
  }
  if (isListening && speechRecognition) {
    speechRecognition.stop();
    return;
  }
  speechRecognition = new SpeechRecognition();
  speechRecognition.lang = 'pl-PL';
  speechRecognition.interimResults = true;
  speechRecognition.continuous = false;
  speechRecognition.onstart = () => setVoiceState(true);
  speechRecognition.onend = () => setVoiceState(false);
  speechRecognition.onerror = e => {
    setVoiceState(false);
    appendMsg('err', `Nie udało się rozpoznać mowy: ${e.error || 'błąd mikrofonu'}`);
  };
  speechRecognition.onresult = e => {
    let finalText = '';
    let interimText = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += transcript;
      else interimText += transcript;
    }
    const ta = document.getElementById('chat-input');
    ta.value = (finalText || interimText).trim();
    autoResizeTA(ta);
    if (finalText.trim()) ta.focus();
  };
  speechRecognition.start();
}

function setVoiceState(active) {
  isListening = active;
  const btn = document.getElementById('voice-btn');
  if (!btn) return;
  btn.classList.toggle('listening', active);
  btn.title = active ? 'Zatrzymaj dyktowanie' : 'Dyktuj pytanie';
}

async function fileToAttachment(file) {
  const textLike = /\.(txt|csv|tsv)$/i.test(file.name) || /^text\//i.test(file.type);
  if (textLike) {
    return {
      name: file.name,
      mimeType: file.type || 'text/plain',
      text: await readFileText(file)
    };
  }
  const dataUrl = await readFileDataUrl(file);
  const dataBase64 = dataUrl.split(',')[1] || '';
  return {
    name: file.name,
    mimeType: file.type || guessMimeType(file.name),
    dataBase64,
    dataUrl
  };
}

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(String(e.target.result || ''));
    reader.onerror = () => reject(new Error('Błąd odczytu pliku.'));
    reader.readAsText(file, 'UTF-8');
  });
}

function readFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(String(e.target.result || ''));
    reader.onerror = () => reject(new Error('Błąd odczytu pliku.'));
    reader.readAsDataURL(file);
  });
}

function guessMimeType(name) {
  if (/\.docx$/i.test(name)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (/\.xlsx$/i.test(name)) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (/\.xls$/i.test(name)) return 'application/vnd.ms-excel';
  if (/\.doc$/i.test(name)) return 'application/msword';
  if (/\.png$/i.test(name)) return 'image/png';
  if (/\.jpe?g$/i.test(name)) return 'image/jpeg';
  if (/\.webp$/i.test(name)) return 'image/webp';
  return 'application/octet-stream';
}

function isImageAttachment(att) {
  return /^image\//i.test(att.mimeType || '');
}

/* ────────────────────────────────
   HARMONOGRAM
──────────────────────────────── */
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

/* ────────────────────────────────
   KNOWLEDGE BASE
──────────────────────────────── */
function loadKnowledgeBase() {
  try {
    knowledgeItems = JSON.parse(localStorage.getItem(KNOWLEDGE_KEY) || '[]')
      .filter(item => item && item.title && item.content)
      .slice(0, 40);
  } catch {
    knowledgeItems = [];
  }
}

function saveKnowledgeBase() {
  localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(knowledgeItems.slice(0, 40)));
}

function saveKnowledgeItem() {
  const type = document.getElementById('kb-type')?.value || 'zmiana-czasowa';
  const title = document.getElementById('kb-title')?.value.trim() || '';
  const source = document.getElementById('kb-source')?.value.trim() || '';
  const documentDate = document.getElementById('kb-document-date')?.value || '';
  const validFrom = document.getElementById('kb-valid-from')?.value || '';
  const validTo = document.getElementById('kb-valid-to')?.value || '';
  const content = document.getElementById('kb-content')?.value.trim() || '';
  if (!title || !content) {
    setKnowledgeStatus('Dodaj tytuł i treść dokumentu albo wzoru.');
    return;
  }
  const item = {
    id: Date.now(),
    type,
    title: title.slice(0, 180),
    source: source.slice(0, 220),
    documentDate,
    validFrom,
    validTo,
    content: content.slice(0, 50_000),
    updatedAt: new Date().toISOString()
  };
  knowledgeItems.unshift(item);
  knowledgeItems = knowledgeItems.slice(0, 40);
  saveKnowledgeBase();
  clearKnowledgeForm();
  renderKnowledgeList();
  setKnowledgeStatus('Zapisano w bazie wiedzy. AI uwzględni ten wpis przy kolejnych pytaniach.');
}

function clearKnowledgeForm() {
  ['kb-title','kb-source','kb-document-date','kb-valid-from','kb-valid-to','kb-content'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function setKnowledgeStatus(text) {
  const el = document.getElementById('kb-status');
  if (el) el.textContent = text;
}

function renderKnowledgeList() {
  const el = document.getElementById('knowledge-list');
  if (!el) return;
  if (!knowledgeItems.length) {
    el.innerHTML = '<div class="weekly-status" style="text-align:center;padding:10px">Brak wpisów w bazie wiedzy.</div>';
    return;
  }
  const sorted = knowledgeItems.slice().sort(compareKnowledgeItems);
  el.innerHTML = sorted.map(item => {
    const status = getKnowledgeStatus(item);
    return `
      <div class="kb-item ${status.cls}">
        <div class="kb-title">${escapeHtml(item.title)}</div>
        <div class="kb-meta">
          ${escapeHtml(labelKnowledgeType(item.type))} · ${escapeHtml(status.label)}
          ${item.source ? ` · Źródło: ${escapeHtml(item.source)}` : ''}
          ${item.documentDate ? ` · Data dok.: ${escapeHtml(item.documentDate)}` : ''}
          ${item.validFrom || item.validTo ? ` · Obowiązuje: ${escapeHtml(item.validFrom || 'od razu')} - ${escapeHtml(item.validTo || 'bezterminowo')}` : ' · Bezterminowo'}
        </div>
        <div class="kb-meta">${escapeHtml(item.content).slice(0, 260)}${item.content.length > 260 ? '...' : ''}</div>
        <div class="kb-actions">
          <button type="button" onclick="useKnowledgeInAI(${item.id})">Zapytaj o ten wpis</button>
          <button class="sec" type="button" onclick="editKnowledgeItem(${item.id})">Edytuj</button>
          <button class="sec" type="button" onclick="deleteKnowledgeItem(${item.id})">Usuń</button>
        </div>
      </div>
    `;
  }).join('');
}

function compareKnowledgeItems(a, b) {
  const statusWeight = { active: 0, future: 1, expired: 2 };
  const sa = getKnowledgeStatus(a).key;
  const sb = getKnowledgeStatus(b).key;
  if (statusWeight[sa] !== statusWeight[sb]) return statusWeight[sa] - statusWeight[sb];
  return String(b.documentDate || b.updatedAt || '').localeCompare(String(a.documentDate || a.updatedAt || ''));
}

function getKnowledgeStatus(item, date = new Date()) {
  const today = date.toISOString().slice(0, 10);
  if (item.validFrom && item.validFrom > today) return { key: 'future', cls: 'future', label: 'przyszłe' };
  if (item.validTo && item.validTo < today) return { key: 'expired', cls: 'expired', label: 'wygasłe/archiwalne' };
  return { key: 'active', cls: 'active', label: 'aktywne teraz' };
}

function labelKnowledgeType(type) {
  return {
    'zmiana-czasowa': 'Zmiana czasowa',
    'zmiana-stala': 'Zmiana stała',
    'wzor-dokumentu': 'Wzór dokumentu',
    opinia: 'Opinia',
    wniosek: 'Wniosek',
    rozporzadzenie: 'Rozporządzenie'
  }[type] || type || 'Wpis';
}

function deleteKnowledgeItem(id) {
  if (!confirm('Usunąć ten wpis z bazy wiedzy na tym urządzeniu?')) return;
  knowledgeItems = knowledgeItems.filter(item => item.id !== id);
  saveKnowledgeBase();
  renderKnowledgeList();
  setKnowledgeStatus('Usunięto wpis z bazy wiedzy.');
}

function editKnowledgeItem(id) {
  const item = knowledgeItems.find(x => x.id === id);
  if (!item) return;
  document.getElementById('kb-type').value = item.type || 'zmiana-czasowa';
  document.getElementById('kb-title').value = item.title || '';
  document.getElementById('kb-source').value = item.source || '';
  document.getElementById('kb-document-date').value = item.documentDate || '';
  document.getElementById('kb-valid-from').value = item.validFrom || '';
  document.getElementById('kb-valid-to').value = item.validTo || '';
  document.getElementById('kb-content').value = item.content || '';
  knowledgeItems = knowledgeItems.filter(x => x.id !== id);
  saveKnowledgeBase();
  renderKnowledgeList();
  setKnowledgeStatus('Wpis przeniesiono do formularza. Po poprawkach kliknij „Zapisz w bazie wiedzy”.');
}

async function handleKnowledgeFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  setKnowledgeStatus('Odczytuję plik...');
  try {
    const attachment = await fileToAttachment(file);
    let text = attachment.text || '';
    if (!text && attachment.dataBase64) {
      const res = await fetch(`${getAIBackendBaseUrl()}/api/extract-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachments: [attachment] })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      text = data.text || '';
    }
    if (!text.trim()) throw new Error('Nie udało się uzyskać tekstu z tego pliku.');
    document.getElementById('kb-title').value = document.getElementById('kb-title').value || file.name.replace(/\.[^.]+$/, '');
    document.getElementById('kb-source').value = document.getElementById('kb-source').value || file.name;
    document.getElementById('kb-content').value = text.slice(0, 50_000);
    setKnowledgeStatus('Wczytano plik do formularza. Sprawdź daty obowiązywania i zapisz wpis.');
  } catch (err) {
    setKnowledgeStatus(`Nie udało się wczytać pliku: ${err.message}`);
  } finally {
    input.value = '';
  }
}

function getKnowledgeContext() {
  const today = new Date().toISOString().slice(0, 10);
  const sorted = knowledgeItems.slice().sort(compareKnowledgeItems).slice(0, 24);
  return {
    today,
    rule: 'Wpisy aktywne mają pierwszeństwo. Wygasłe stosuj tylko do pytań o przeszłość. Przy konflikcie stosuj nowszą datę dokumentu/aktualizacji.',
    items: sorted.map(item => {
      const status = getKnowledgeStatus(item);
      return {
        status: status.key,
        type: labelKnowledgeType(item.type),
        title: item.title,
        source: item.source,
        documentDate: item.documentDate,
        validFrom: item.validFrom,
        validTo: item.validTo,
        updatedAt: item.updatedAt,
        content: item.content.slice(0, 6000)
      };
    })
  };
}

function askAIAboutKnowledge() {
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const ta = document.getElementById('chat-input');
  ta.value = 'Uwzględnij aktualną bazę wiedzy MOW, w tym daty obowiązywania zmian czasowych i wzory dokumentów. Odpowiedz, które wpisy są aktywne teraz i jak wpływają na praktykę wychowawcy.';
  autoResizeTA(ta);
  saveChatDraft();
  sendChat();
}

function useKnowledgeInAI(id) {
  const item = knowledgeItems.find(x => x.id === id);
  if (!item) return;
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const status = getKnowledgeStatus(item);
  const ta = document.getElementById('chat-input');
  ta.value = `Zinterpretuj ten wpis z bazy wiedzy MOW. Powiedz, czy obowiązuje dzisiaj, jak wpływa na praktykę i jakie źródło należy wskazać.\n\nStatus: ${status.label}\nTyp: ${labelKnowledgeType(item.type)}\nTytuł: ${item.title}\nŹródło: ${item.source || 'brak'}\nData dokumentu: ${item.documentDate || 'brak'}\nObowiązuje od: ${item.validFrom || 'brak'}\nObowiązuje do: ${item.validTo || 'bezterminowo'}\n\nTreść:\n${item.content.slice(0, 8000)}`;
  autoResizeTA(ta);
  saveChatDraft();
  sendChat();
}

/* ────────────────────────────────
   PWA INSTALL
──────────────────────────────── */
let deferredPrompt = null;
function setupInstall() {
  const installBtn = document.getElementById('install-btn');
  if (!installBtn) return;

  if (isStandaloneApp()) {
    installBtn.style.display = 'none';
    return;
  }

  installBtn.style.display = 'none';

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-flex';
    installBtn.textContent = 'Instaluj';
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
  });
}

function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function openInstallHelp() {
  const steps = getInstallSteps();
  document.getElementById('install-steps').innerHTML =
    steps.map(s => `<div class="install-step">${s}</div>`).join('');
  document.getElementById('install-sheet').classList.add('open');
}

function closeInstallHelp(e) {
  const sheet = document.getElementById('install-sheet');
  if (!e || e.target === sheet) sheet.classList.remove('open');
}

function getInstallSteps() {
  const ua = navigator.userAgent || '';
  const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isWindows = /Windows/i.test(ua);

  if (isiOS) {
    return [
      'Na iPhone albo iPad otwórz tę stronę w Safari.',
      'Dotknij przycisku Udostępnij.',
      'Wybierz: Do ekranu początkowego.',
      'Potwierdź: Dodaj.'
    ];
  }
  if (isAndroid) {
    return [
      'Na Androidzie otwórz stronę w Chrome.',
      'Dotknij Instaluj, jeśli przycisk jest widoczny.',
      'Jeżeli go nie ma: menu ⋮ i opcja Dodaj do ekranu głównego albo Zainstaluj aplikację.',
      'Po instalacji ikona pojawi się na ekranie telefonu.'
    ];
  }
  if (isWindows) {
    return [
      'Na komputerze otwórz stronę w Chrome albo Edge.',
      'Kliknij ikonę instalacji w pasku adresu albo menu przeglądarki.',
      'Wybierz Zainstaluj aplikację.',
      'Po instalacji aplikacja będzie dostępna w menu Start.'
    ];
  }
  return [
    'Otwórz stronę w Chrome, Edge albo Safari.',
    'Użyj przycisku Instaluj, jeśli jest dostępny.',
    'Jeżeli nie ma przycisku, użyj menu przeglądarki i wybierz Dodaj do ekranu głównego lub Zainstaluj aplikację.'
  ];
}

/* ────────────────────────────────
   START
──────────────────────────────── */
init();

/* ────────────────────────────────
   SERVICE WORKER (offline cache)
──────────────────────────────── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(()=>{});
}

/* Extracted note sheet helpers */
function openNota()  { document.getElementById('nota-sheet').classList.add('open'); renderNotesList(); }
function closeNota(e){ if(e.target===document.getElementById('nota-sheet')) document.getElementById('nota-sheet').classList.remove('open'); }
