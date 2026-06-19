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
