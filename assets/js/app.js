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
  loadCentralKnowledgeCache();
  renderKnowledgeList();
  refreshCentralKnowledgeBase();
  loadNotes();
  loadCurrentInfo();
  clearCurrentInfoForm();
  setupAccordions();
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
