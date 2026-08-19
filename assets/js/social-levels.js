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
  setupStopAssistant();
}

function openStopien(s) {
  const criteriaTitle = s.mode === 'event'
    ? '⚠️ Zdarzenia wymagające osobnego ustalenia faktów'
    : '✅ Kryteria – oceniaj każde, nie wybieraj tylko części';
  const modeNote = s.mode === 'event'
    ? 'Najpierw bezpieczeństwo, pomoc i właściwa procedura. Stopień nie może zastępować oceny kryzysu ani ustalenia faktów.'
    : 'Regulamin wymaga łącznej oceny kryteriów. Brak danych nie oznacza automatycznie niespełnienia kryterium.';
  document.getElementById('det-title').textContent = `Stopień ${s.lvl}`;
  document.getElementById('det-source').textContent = 'Regulamin Stopni Uspołecznienia – Załącznik nr 7 do Statutu MOW';
  document.getElementById('det-body').innerHTML = `
    <div class="abox info"><span class="ai">💰</span><div><strong>Kieszonkowe: ${s.kies}</strong></div></div>
    <div class="abox ${s.mode === 'event' ? 'warn' : 'info'}"><span class="ai">${s.mode === 'event' ? '⚠️' : 'ℹ️'}</span><div>${modeNote}</div></div>
    <p class="sec-title">${criteriaTitle}</p>
    ${s.crit.map((c,i)=>`<div class="step"><div class="step-num">${i+1}</div><div class="step-text">${c}</div></div>`).join('')}
    <p class="sec-title">🎁 Nagrody i przywileje według regulaminu</p>
    ${s.przyw.map(p=>`<div style="padding:7px 0;border-bottom:1px solid var(--border);font-size:.85rem">• ${p}</div>`).join('')}
    <div class="abox info"><span class="ai">⚖️</span><div>Stopień nie ogranicza ustawowych praw wychowanka ani obowiązku zapewnienia mu bezpieczeństwa, pomocy, nauki i kontaktu z uprawnionymi organami.</div></div>`;
  document.getElementById('detail-view').classList.add('open');
}

function setupStopAssistant() {
  const select = document.getElementById('stop-check-level');
  if (!select || select.options.length > 1) return;
  STOPNIE.forEach(level => {
    const option = document.createElement('option');
    option.value = level.id;
    option.textContent = `Stopień ${level.lvl}`;
    select.appendChild(option);
  });
}

function renderStopChecklist() {
  const select = document.getElementById('stop-check-level');
  const form = document.getElementById('stop-check-form');
  const result = document.getElementById('stop-check-result');
  const level = STOPNIE.find(item => item.id === select?.value);
  if (!form || !result) return;
  result.innerHTML = '';
  if (!level) {
    form.innerHTML = '<p class="stop-check-empty">Wybierz stopień, aby wyświetlić kryteria.</p>';
    return;
  }
  form.innerHTML = level.crit.map((criterion, index) => `
    <fieldset class="stop-check-row">
      <legend>${index + 1}. ${criterion}</legend>
      <div class="stop-segmented" role="radiogroup" aria-label="Ocena kryterium ${index + 1}">
        <label><input type="radio" name="stop-check-${index}" value="yes"> Tak</label>
        <label><input type="radio" name="stop-check-${index}" value="no"> Nie</label>
        <label><input type="radio" name="stop-check-${index}" value="unknown" checked> Brak danych</label>
      </div>
    </fieldset>`).join('');
  form.dataset.levelId = level.id;
}

function summarizeStopChecklist() {
  const form = document.getElementById('stop-check-form');
  const result = document.getElementById('stop-check-result');
  const level = STOPNIE.find(item => item.id === form?.dataset.levelId);
  if (!form || !result || !level) {
    if (result) result.innerHTML = '<div class="abox warn"><span class="ai">⚠️</span><div>Najpierw wybierz stopień.</div></div>';
    return;
  }
  const values = level.crit.map((_, index) => form.querySelector(`input[name="stop-check-${index}"]:checked`)?.value || 'unknown');
  const yes = values.filter(value => value === 'yes').length;
  const no = values.filter(value => value === 'no').length;
  const unknown = values.filter(value => value === 'unknown').length;
  const message = level.mode === 'event'
    ? `Zaznaczono ${yes} potwierdzonych zdarzeń, ${no} wykluczonych i ${unknown} bez danych. Arkusz nie ustala stopnia: zweryfikuj dokumentację i omów sprawę w zespole.`
    : `Spełnione: ${yes}. Niespełnione: ${no}. Brak danych: ${unknown}. Do pozytywnej kwalifikacji potrzebna jest łączna, zespołowa ocena wszystkich kryteriów.`;
  result.innerHTML = `<div class="abox ${no || unknown ? 'warn' : 'ok'}"><span class="ai">${no || unknown ? '🔎' : '✅'}</span><div><strong>Wynik pomocniczy</strong><br>${message}</div></div>`;
}
