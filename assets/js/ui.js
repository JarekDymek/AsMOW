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
