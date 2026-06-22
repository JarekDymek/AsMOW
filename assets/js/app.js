/* ────────────────────────────────
   INIT
──────────────────────────────── */
function init() {
  setupTestAccessFromUrl();
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
  applyTestModeUI();
  refreshTestProfile();
  checkOnline();
  setInterval(checkOnline, 15000);
  setInterval(autoSyncCurrentInfoMail, 30 * 60 * 1000);
}


/* ────────────────────────────────
   START
──────────────────────────────── */
init();
