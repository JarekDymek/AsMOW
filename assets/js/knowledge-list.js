function renderKnowledgeList() {
  const el = document.getElementById('knowledge-list');
  if (!el) return;
  const items = getEffectiveKnowledgeItems();
  if (!items.length) {
    el.innerHTML = '<div class="weekly-status" style="text-align:center;padding:10px">Brak wpisów w bazie wiedzy.</div>';
    return;
  }
  const sorted = items.slice().sort(compareKnowledgeItems);
  el.innerHTML = sorted.map(item => {
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
          <button type="button" onclick="useKnowledgeInAI('${escapeHtml(String(item.id))}')">Zapytaj o ten wpis</button>
          ${item.isCentral ? '' : `<button class="sec" type="button" onclick="editKnowledgeItem('${escapeHtml(String(item.id))}')">Edytuj</button>`}
          ${item.isCentral ? '' : `<button class="sec" type="button" onclick="deleteKnowledgeItem('${escapeHtml(String(item.id))}')">Usuń</button>`}
        </div>
      </div>
    `;
  }).join('');
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
    rozporzadzenie: 'Rozporządzenie'
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
