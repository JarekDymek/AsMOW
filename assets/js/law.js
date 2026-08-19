/* ────────────────────────────────
   RENDER LAWS
──────────────────────────────── */
function renderLaws() {
  const el = document.getElementById('law-list-render');
  if (!el) return;
  el.innerHTML = LAWS.map(l => {
    const meta = LAW_SOURCE_META[l.n] || {};
    const content = `<span class="law-num">${l.n}.</span>
      <span class="law-text">${l.t}</span>
      <span class="law-meta"><strong>${meta.status || 'źródło wewnętrzne'}</strong>${meta.reviewedAt ? ` · sprawdzono ${meta.reviewedAt}` : ''}</span>`;
    return meta.url
      ? `<a class="law-item law-item-link" href="${meta.url}" target="_blank" rel="noopener noreferrer">${content}<span class="law-open">Otwórz źródło ↗</span></a>`
      : `<div class="law-item">${content}</div>`;
  }).join('');
}
