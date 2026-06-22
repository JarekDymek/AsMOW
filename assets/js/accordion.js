/* ────────────────────────────────
   ACCORDIONS
──────────────────────────────── */
const ACCORDION_KEY_PREFIX = 'mow_accordion_';
const ACCORDION_TILE_META = {
  'proc-crisis-card': { icon: '🚨', label: 'Sytuacje kryzysowe', tone: 'red' },
  'proc-safety-card': { icon: '🛡️', label: 'Bezpieczeństwo', tone: 'orange' },
  'proc-other-card': { icon: '🧭', label: 'Inne procedury', tone: 'green' },
  'stop-rules-card': { icon: 'ℹ️', label: 'Zasady kwalifikacji', tone: 'blue' },
  'stop-neg-card': { icon: '📉', label: 'Stopnie ujemne', tone: 'red' },
  'stop-pos-card': { icon: '📈', label: 'Stopnie pozytywne', tone: 'green' },
  'stop-drop-card': { icon: '⬇️', label: 'Automatyczny spadek stopnia', tone: 'orange' },
  'law-sources-card': { icon: '📚', label: 'Podstawy prawne MOW', tone: 'blue' },
  'law-rights-card': { icon: '⚖️', label: 'Prawa wychowanka', tone: 'blue' },
  'law-force-card': { icon: '🛑', label: 'Środki przymusu bezpośredniego', tone: 'red' },
  'law-kb-form-card': { icon: '🗂️', label: 'Baza wiedzy i zmiany czasowe', tone: 'gold' },
  'law-kb-list-card': { icon: '📌', label: 'Zapisane wpisy bazy wiedzy', tone: 'green' },
  'local-backup-card': { icon: '💾', label: 'Kopia i czyszczenie danych', tone: 'blue' },
  'law-docs-card': { icon: '📄', label: 'Dokumenty wewnętrzne MOW', tone: 'blue' },
  'law-phones-card': { icon: '☎️', label: 'Numery alarmowe i kontakty', tone: 'orange' },
  'current-info-form-card': { icon: '📣', label: 'Dodaj informację od dyrekcji', tone: 'gold' },
  'current-info-list-card': { icon: '🗂️', label: 'Archiwum od 2026 r.', tone: 'green' },
  'weekly-settings-card': { icon: '🗓️', label: 'Plan z generatora Harmonogram-MOW', tone: 'blue' },
  'harm-upload-card': { icon: '📁', label: 'Wczytaj harmonogram z pliku lub screena', tone: 'orange' },
  'harm-query-card': { icon: '🔎', label: 'Zapytaj o wychowawcę', tone: 'blue' },
  'harm-result-card': { icon: '📊', label: 'Wynik', tone: 'green' }
};

function setupAccordions(root = document) {
  root.querySelectorAll('[data-accordion-target]').forEach(btn => {
    const id = btn.dataset.accordionTarget;
    const panel = document.getElementById(id);
    if (!panel) return;
    decorateAccordionTile(btn, id);
    const saved = localStorage.getItem(`${ACCORDION_KEY_PREFIX}${id}`);
    if (saved !== null) {
      panel.classList.toggle('collapsed', saved === '1');
    } else if (btn.dataset.default === 'open') {
      panel.classList.remove('collapsed');
    } else {
      panel.classList.add('collapsed');
    }
    updateAccordionButton(btn, panel);
  });
}

function decorateAccordionTile(btn, id) {
  if (!btn.parentElement?.classList.contains('tile-screen')) return;
  const meta = ACCORDION_TILE_META[id];
  const main = btn.querySelector('.st-main');
  if (!meta || !main) return;
  const hintText = main.querySelector('small')?.textContent || '';
  btn.dataset.tileTone = meta.tone || 'blue';
  main.innerHTML = '';

  const icon = document.createElement('span');
  icon.className = 'tile-icon';
  icon.textContent = meta.icon;
  const label = document.createElement('span');
  label.className = 'tile-label';
  label.textContent = meta.label;
  main.append(icon, label);

  if (hintText) {
    const hint = document.createElement('small');
    hint.textContent = hintText;
    main.appendChild(hint);
  }
}

function toggleAccordion(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  const isCollapsed = panel.classList.toggle('collapsed');
  localStorage.setItem(`${ACCORDION_KEY_PREFIX}${id}`, isCollapsed ? '1' : '0');
  const btn = document.querySelector(`[data-accordion-target="${id}"]`);
  if (btn) updateAccordionButton(btn, panel);
}

function setAccordionCollapsed(id, isCollapsed) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.classList.toggle('collapsed', isCollapsed);
  localStorage.setItem(`${ACCORDION_KEY_PREFIX}${id}`, isCollapsed ? '1' : '0');
  const btn = document.querySelector(`[data-accordion-target="${id}"]`);
  if (btn) updateAccordionButton(btn, panel);
}

function updateAccordionButton(btn, panel) {
  const state = btn.querySelector('.st-state');
  if (state) state.textContent = panel.classList.contains('collapsed') ? 'Rozwiń' : 'Zwiń';
  btn.setAttribute('aria-expanded', panel.classList.contains('collapsed') ? 'false' : 'true');
}
