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
   START
──────────────────────────────── */
init();
