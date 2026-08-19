function renderKnowledgeList() {
  const el = document.getElementById('knowledge-list');
  if (!el) return;
  const items = getEffectiveKnowledgeItems();
  if (!items.length) {
    el.innerHTML = '<div class="weekly-status" style="text-align:center;padding:10px">Brak wpisów w bazie wiedzy.</div>';
    return;
  }
  const sorted = items.slice().sort(compareKnowledgeItems);
  const groups = [
    {
      title: 'Centralne źródła i zasady MOW',
      description: 'Zatwierdzone, tylko do odczytu. Zawierają krótkie wyciągi prawne i zasady używane przez Asystenta przy odpowiedziach.',
      items: sorted.filter(item => item.isCentral && !isKnowledgeQualityItem(item))
    },
    {
      title: 'Kontrola jakości odpowiedzi',
      description: 'Mechanizmy techniczne aplikacji: bank 250 odpowiedzi, rozpoznawanie intencji i testy chroniące przed powrotem znanych błędów.',
      items: sorted.filter(item => item.isCentral && isKnowledgeQualityItem(item))
    },
    {
      title: 'Własne wpisy na tym urządzeniu',
      description: 'Dodane lokalnie wzory, zarządzenia i zmiany czasowe. Można je edytować lub usunąć; nie są automatycznie współdzielone z innymi urządzeniami.',
      items: sorted.filter(item => !item.isCentral)
    }
  ];

  el.innerHTML = `
    <div class="kb-guide">
      <strong>Co tu jest zapisane?</strong>
      <span>To indeks źródeł używanych przez aplikację, a nie historia rozmów AI. Wpis „centralny” pochodzi z backendu i jest wspólny dla użytkowników. Wpis „lokalny” istnieje tylko w tej przeglądarce.</span>
    </div>
    ${groups.filter(group => group.items.length).map(group => `
      <section class="kb-group">
        <div class="kb-group-head">
          <h3>${escapeHtml(group.title)}</h3>
          <p>${escapeHtml(group.description)}</p>
        </div>
        <div class="kb-grid">${group.items.map(renderKnowledgeItem).join('')}</div>
      </section>
    `).join('')}
  `;
}

function renderKnowledgeItem(item) {
    const status = getKnowledgeStatus(item);
    const effective = item.effectiveStatus === 'superseded'
      ? { key: 'superseded', cls: 'superseded', label: 'zastąpione nowszym wpisem' }
      : status;
    return `
      <div class="kb-item ${effective.cls}">
        <div class="kb-title">${escapeHtml(item.title)}</div>
        <div class="kb-meta">
          ${item.isCentral ? '<span class="kb-badge central">Centralne</span>' : '<span class="kb-badge local">Lokalne</span>'}
          ${escapeHtml(labelKnowledgeType(item.type))} · ${escapeHtml(effective.label)}
          ${item.version ? ` · Wersja: ${escapeHtml(item.version)}` : ''}
          ${item.approvedBy ? ` · Zatwierdził: ${escapeHtml(item.approvedBy)}` : ''}
          ${item.source ? ` · Źródło: ${escapeHtml(item.source)}` : ''}
          ${item.documentDate ? ` · Data dok.: ${escapeHtml(item.documentDate)}` : ''}
          ${item.validFrom || item.validTo ? ` · Obowiązuje: ${escapeHtml(item.validFrom || 'od razu')} - ${escapeHtml(item.validTo || 'bezterminowo')}` : ' · Bezterminowo'}
        </div>
        <div class="kb-meta">${escapeHtml(item.content).slice(0, 260)}${item.content.length > 260 ? '...' : ''}</div>
        <div class="kb-actions">
          <button type="button" onclick="useKnowledgeInAI('${escapeHtml(String(item.id))}')">${isKnowledgeQualityItem(item) ? 'Wyjaśnij ten mechanizm' : 'Wyjaśnij ten wpis'}</button>
          ${item.isCentral ? '' : `<button class="sec" type="button" onclick="editKnowledgeItem('${escapeHtml(String(item.id))}')">Edytuj</button>`}
          ${item.isCentral ? '' : `<button class="sec" type="button" onclick="deleteKnowledgeItem('${escapeHtml(String(item.id))}')">Usuń</button>`}
        </div>
      </div>
    `;
}

function isKnowledgeQualityItem(item) {
  return ['bank-odpowiedzi-i-intencji', 'testy-regresji-ai'].includes(item.type);
}

function compareKnowledgeItems(a, b) {
  const statusWeight = { active: 0, future: 1, superseded: 2, expired: 3 };
  const sa = a.effectiveStatus || getKnowledgeStatus(a).key;
  const sb = b.effectiveStatus || getKnowledgeStatus(b).key;
  if (statusWeight[sa] !== statusWeight[sb]) return statusWeight[sa] - statusWeight[sb];
  if (a.isCentral !== b.isCentral) return a.isCentral ? -1 : 1;
  return String(b.documentDate || b.updatedAt || '').localeCompare(String(a.documentDate || a.updatedAt || ''));
}

function getKnowledgeStatus(item, date = new Date()) {
  const today = date.toISOString().slice(0, 10);
  if (item.validFrom && item.validFrom > today) return { key: 'future', cls: 'future', label: 'przyszłe' };
  if (item.validTo && item.validTo < today) return { key: 'expired', cls: 'expired', label: 'wygasłe/archiwalne' };
  return { key: 'active', cls: 'active', label: 'aktywne teraz' };
}

function labelKnowledgeType(type) {
  return {
    'zmiana-czasowa': 'Zmiana czasowa',
    'zmiana-stala': 'Zmiana stała',
    'wzor-dokumentu': 'Wzór dokumentu',
    opinia: 'Opinia',
    wniosek: 'Wniosek',
    ustawa: 'Ustawa',
    rozporzadzenie: 'Rozporządzenie',
    'zasada-stala': 'Zasada stała',
    'ustawa-wyciag': 'Wyciąg z ustawy',
    'rozporzadzenie-wyciag': 'Wyciąg z rozporządzenia',
    'ustawa-i-akty-wykonawcze': 'Prawo oświatowe',
    'prawo-pracy-i-awans': 'Prawo pracy i awans',
    'bezpieczenstwo-i-dokumentacja': 'Bezpieczeństwo i dokumentacja',
    'testy-regresji-ai': 'Kontrola jakości odpowiedzi',
    'bank-odpowiedzi-i-intencji': 'Bank odpowiedzi i intencji'
  }[type] || type || 'Wpis';
}

function deleteKnowledgeItem(id) {
  if (!confirm('Usunąć ten wpis z bazy wiedzy na tym urządzeniu?')) return;
  knowledgeItems = knowledgeItems.filter(item => String(item.id) !== String(id));
  saveKnowledgeBase();
  renderKnowledgeList();
  setKnowledgeStatus('Usunięto wpis z bazy wiedzy.');
}

function editKnowledgeItem(id) {
  const item = knowledgeItems.find(x => String(x.id) === String(id));
  if (!item) return;
  document.getElementById('kb-type').value = item.type || 'zmiana-czasowa';
  document.getElementById('kb-title').value = item.title || '';
  document.getElementById('kb-source').value = item.source || '';
  document.getElementById('kb-document-date').value = item.documentDate || '';
  document.getElementById('kb-valid-from').value = item.validFrom || '';
  document.getElementById('kb-valid-to').value = item.validTo || '';
  document.getElementById('kb-content').value = item.content || '';
  knowledgeItems = knowledgeItems.filter(x => String(x.id) !== String(id));
  saveKnowledgeBase();
  renderKnowledgeList();
  setKnowledgeStatus('Wpis przeniesiono do formularza. Po poprawkach kliknij przycisk zapisu.');
}
