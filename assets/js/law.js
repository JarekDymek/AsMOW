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
