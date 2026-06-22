/* ────────────────────────────────
   RENDER STOPNIE
──────────────────────────────── */
function renderStopnie() {
  STOPNIE.forEach(s => {
    const el = document.createElement('div');
    const preview = s.crit.slice(0, 3);
    const more = s.crit.length > preview.length
      ? `<li class="st-more">+ ${s.crit.length - preview.length} kolejne - dotknij, aby zobaczyć pełne kryteria</li>`
      : '';
    el.className = `st-card ${s.cls}`;
    el.innerHTML = `
      <div class="st-title">Stopień ${s.lvl}</div>
      <div class="st-kies">💰 Kieszonkowe: ${s.kies}</div>
      <div class="st-crit"><ul>${preview.map(c=>`<li>${c}</li>`).join('')}${more}</ul></div>`;
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
