/* ────────────────────────────────
   RENDER PROCEDURES
──────────────────────────────── */
function renderProcs() {
  PROCS.forEach(p => {
    const el = document.createElement('div');
    el.className = `proc-item ${p.sev}`;
    el.dataset.id = p.id;
    el.dataset.search = normalizeProcedureSearch([
      p.title,
      p.sub,
      p.src,
      ...(p.searchTerms || []),
      ...p.steps.map(stripHtml)
    ].join(' '));
    el.innerHTML = `
      <span class="proc-icon">${p.icon}</span>
      <div style="flex:1;min-width:0">
        <div class="proc-title">${p.title}</div>
        <div class="proc-sub">${p.sub}</div>
      </div>
      <span class="proc-arrow">›</span>`;
    el.addEventListener('click', () => openDetail(p.id));
    const container = p.cat==='crisis' ? 'pl-crisis' : p.cat==='safety' ? 'pl-safety' : 'pl-other';
    document.getElementById(container).appendChild(el);
  });
}

function filterProcs(q) {
  q = normalizeProcedureSearch(q);
  document.querySelectorAll('.proc-item').forEach(el => {
    el.style.display = (!q || el.dataset.search.includes(q)) ? '' : 'none';
  });
  if (!q) return;
  [
    ['pl-crisis', 'proc-crisis-card'],
    ['pl-safety', 'proc-safety-card'],
    ['pl-other', 'proc-other-card']
  ].forEach(([listId, panelId]) => {
    const hasMatch = [...document.querySelectorAll(`#${listId} .proc-item`)]
      .some(el => el.style.display !== 'none');
    setAccordionCollapsed(panelId, !hasMatch);
  });
}

function normalizeProcedureSearch(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .trim();
}

/* ────────────────────────────────
   DETAIL VIEW
──────────────────────────────── */
function openDetail(id) {
  const proc = PROCS.find(p => p.id === id);
  if (!proc) return;
  document.getElementById('det-title').textContent = `${proc.icon} ${proc.title}`;
  document.getElementById('det-source').textContent = `Źródło: ${proc.src}`;
  let html = '';
  if (proc.alert) {
    const icons = {danger:'🚨', warn:'⚠️', info:'ℹ️', ok:'✅'};
    html += `<div class="abox ${proc.alert.t}"><span class="ai">${icons[proc.alert.t]||'ℹ️'}</span><div>${proc.alert.txt}</div></div>`;
  }
  const urgentCount = Math.min(proc.urgentCount || 3, proc.steps.length);
  const urgentSteps = proc.steps.slice(0, urgentCount);
  const laterSteps = proc.steps.slice(urgentCount);
  html += `<section class="procedure-now" aria-label="Najpilniejsze działania">
    <p class="sec-title">🚨 NA JUŻ</p>
    ${renderProcedureSteps(urgentSteps, 0)}
  </section>`;
  if (laterSteps.length) {
    html += `<details class="procedure-layer">
      <summary>Dalsze działania <span>${laterSteps.length}</span></summary>
      <div class="procedure-layer-body">${renderProcedureSteps(laterSteps, urgentCount)}</div>
    </details>`;
  }
  if (proc.documentation?.length) {
    html += renderProcedureList('📝 Dokumentacja po zabezpieczeniu sytuacji', proc.documentation, 'documentation');
  }
  if (proc.dont?.length) {
    html += renderProcedureList('⛔ Tego nie rób', proc.dont, 'dont');
  }
  if (proc.levelNote) {
    html += `<details class="procedure-layer procedure-level-note">
      <summary>Stopień uspołecznienia i konsekwencje</summary>
      <div class="procedure-layer-body">${proc.levelNote}</div>
    </details>`;
  }
  if (proc.sourceLinks?.length) {
    html += `<div class="procedure-source-links" aria-label="Źródła online">
      ${proc.sourceLinks.map(link => `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label} ↗</a>`).join('')}
    </div>`;
  }
  if (proc.extra) html += proc.extra;
  document.getElementById('det-body').innerHTML = html;
  document.getElementById('detail-view').classList.add('open');
}

function renderProcedureSteps(steps, startIndex) {
  return steps.map((step, index) =>
    `<div class="step"><div class="step-num">${startIndex + index + 1}</div><div class="step-text">${step}</div></div>`
  ).join('');
}

function renderProcedureList(title, items, type) {
  return `<details class="procedure-layer procedure-layer-${type}">
    <summary>${title} <span>${items.length}</span></summary>
    <ul class="procedure-checklist">${items.map(item => `<li>${item}</li>`).join('')}</ul>
  </details>`;
}

function closeDetail() {
  document.getElementById('detail-view').classList.remove('open');
}
