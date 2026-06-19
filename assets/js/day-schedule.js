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
