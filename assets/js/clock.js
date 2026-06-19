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
