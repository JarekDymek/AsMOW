/* ────────────────────────────────
   ACCORDIONS
──────────────────────────────── */
const ACCORDION_KEY_PREFIX = 'mow_accordion_';

function setupAccordions(root = document) {
  root.querySelectorAll('[data-accordion-target]').forEach(btn => {
    const id = btn.dataset.accordionTarget;
    const panel = document.getElementById(id);
    if (!panel) return;
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
