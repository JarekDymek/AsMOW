/* ────────────────────────────────
   RENDER QUICK GRID
──────────────────────────────── */
function renderQuickGrid() {
  document.getElementById('quick-grid').innerHTML =
    QUICK_ACTIONS.map(a => `
      <button class="qbtn ${a.cls}" onclick="${a.proc ? `openDetail('${a.proc}')` : `goQuickScreen('${a.screen}')` }">
        <span class="qi">${a.icon}</span>
        <span class="ql">${a.label}</span>
      </button>`).join('');
}

function goQuickScreen(screen) {
  nav(screen, document.querySelector(`.nav-btn:nth-child(${getNavIndexForScreen(screen)})`));
}

function getNavIndexForScreen(screen) {
  return {
    's-dyzur': 1,
    's-proc': 2,
    's-stop': 3,
    's-prawo': 4,
    's-info': 5,
    's-harm': 6,
    's-ai': 7
  }[screen] || 1;
}
