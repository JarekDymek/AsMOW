/* ────────────────────────────────
   KNOWLEDGE BASE
──────────────────────────────── */
function loadKnowledgeBase() {
  try {
    knowledgeItems = JSON.parse(localStorage.getItem(KNOWLEDGE_KEY) || '[]')
      .filter(item => item && item.title && item.content)
      .slice(0, 40);
  } catch {
    knowledgeItems = [];
  }
}

function saveKnowledgeBase() {
  localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(knowledgeItems.slice(0, 40)));
}

function saveKnowledgeItem() {
  const type = document.getElementById('kb-type')?.value || 'zmiana-czasowa';
  const title = document.getElementById('kb-title')?.value.trim() || '';
  const source = document.getElementById('kb-source')?.value.trim() || '';
  const documentDate = document.getElementById('kb-document-date')?.value || '';
  const validFrom = document.getElementById('kb-valid-from')?.value || '';
  const validTo = document.getElementById('kb-valid-to')?.value || '';
  const content = document.getElementById('kb-content')?.value.trim() || '';
  if (!title || !content) {
    setKnowledgeStatus('Dodaj tytuł i treść dokumentu albo wzoru.');
    return;
  }
  const item = {
    id: Date.now(),
    type,
    title: title.slice(0, 180),
    source: source.slice(0, 220),
    documentDate,
    validFrom,
    validTo,
    content: content.slice(0, 50_000),
    updatedAt: new Date().toISOString()
  };
  knowledgeItems.unshift(item);
  knowledgeItems = knowledgeItems.slice(0, 40);
  saveKnowledgeBase();
  clearKnowledgeForm();
  renderKnowledgeList();
  setKnowledgeStatus('Zapisano w bazie wiedzy. AI uwzględni ten wpis przy kolejnych pytaniach.');
}

function clearKnowledgeForm() {
  ['kb-title','kb-source','kb-document-date','kb-valid-from','kb-valid-to','kb-content'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function setKnowledgeStatus(text) {
  const el = document.getElementById('kb-status');
  if (el) el.textContent = text;
}

function renderKnowledgeList() {
  const el = document.getElementById('knowledge-list');
  if (!el) return;
  if (!knowledgeItems.length) {
    el.innerHTML = '<div class="weekly-status" style="text-align:center;padding:10px">Brak wpisów w bazie wiedzy.</div>';
    return;
  }
  const sorted = knowledgeItems.slice().sort(compareKnowledgeItems);
  el.innerHTML = sorted.map(item => {
    const status = getKnowledgeStatus(item);
    return `
      <div class="kb-item ${status.cls}">
        <div class="kb-title">${escapeHtml(item.title)}</div>
        <div class="kb-meta">
          ${escapeHtml(labelKnowledgeType(item.type))} · ${escapeHtml(status.label)}
          ${item.source ? ` · Źródło: ${escapeHtml(item.source)}` : ''}
          ${item.documentDate ? ` · Data dok.: ${escapeHtml(item.documentDate)}` : ''}
          ${item.validFrom || item.validTo ? ` · Obowiązuje: ${escapeHtml(item.validFrom || 'od razu')} - ${escapeHtml(item.validTo || 'bezterminowo')}` : ' · Bezterminowo'}
        </div>
        <div class="kb-meta">${escapeHtml(item.content).slice(0, 260)}${item.content.length > 260 ? '...' : ''}</div>
        <div class="kb-actions">
          <button type="button" onclick="useKnowledgeInAI(${item.id})">Zapytaj o ten wpis</button>
          <button class="sec" type="button" onclick="editKnowledgeItem(${item.id})">Edytuj</button>
          <button class="sec" type="button" onclick="deleteKnowledgeItem(${item.id})">Usuń</button>
        </div>
      </div>
    `;
  }).join('');
}

function compareKnowledgeItems(a, b) {
  const statusWeight = { active: 0, future: 1, expired: 2 };
  const sa = getKnowledgeStatus(a).key;
  const sb = getKnowledgeStatus(b).key;
  if (statusWeight[sa] !== statusWeight[sb]) return statusWeight[sa] - statusWeight[sb];
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
  knowledgeItems = knowledgeItems.filter(item => item.id !== id);
  saveKnowledgeBase();
  renderKnowledgeList();
  setKnowledgeStatus('Usunięto wpis z bazy wiedzy.');
}

function editKnowledgeItem(id) {
  const item = knowledgeItems.find(x => x.id === id);
  if (!item) return;
  document.getElementById('kb-type').value = item.type || 'zmiana-czasowa';
  document.getElementById('kb-title').value = item.title || '';
  document.getElementById('kb-source').value = item.source || '';
  document.getElementById('kb-document-date').value = item.documentDate || '';
  document.getElementById('kb-valid-from').value = item.validFrom || '';
  document.getElementById('kb-valid-to').value = item.validTo || '';
  document.getElementById('kb-content').value = item.content || '';
  knowledgeItems = knowledgeItems.filter(x => x.id !== id);
  saveKnowledgeBase();
  renderKnowledgeList();
  setKnowledgeStatus('Wpis przeniesiono do formularza. Po poprawkach kliknij „Zapisz w bazie wiedzy”.');
}

async function handleKnowledgeFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  setKnowledgeStatus('Odczytuję plik...');
  try {
    const attachment = await fileToAttachment(file);
    let text = attachment.text || '';
    if (!text && attachment.dataBase64) {
      const res = await fetch(`${getAIBackendBaseUrl()}/api/extract-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachments: [attachment] })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      text = data.text || '';
    }
    if (!text.trim()) throw new Error('Nie udało się uzyskać tekstu z tego pliku.');
    document.getElementById('kb-title').value = document.getElementById('kb-title').value || file.name.replace(/\.[^.]+$/, '');
    document.getElementById('kb-source').value = document.getElementById('kb-source').value || file.name;
    document.getElementById('kb-content').value = text.slice(0, 50_000);
    setKnowledgeStatus('Wczytano plik do formularza. Sprawdź daty obowiązywania i zapisz wpis.');
  } catch (err) {
    setKnowledgeStatus(`Nie udało się wczytać pliku: ${err.message}`);
  } finally {
    input.value = '';
  }
}

function getKnowledgeContext() {
  const today = new Date().toISOString().slice(0, 10);
  const sorted = knowledgeItems.slice().sort(compareKnowledgeItems).slice(0, 24);
  return {
    today,
    rule: 'Wpisy aktywne mają pierwszeństwo. Wygasłe stosuj tylko do pytań o przeszłość. Przy konflikcie stosuj nowszą datę dokumentu/aktualizacji.',
    items: sorted.map(item => {
      const status = getKnowledgeStatus(item);
      return {
        status: status.key,
        type: labelKnowledgeType(item.type),
        title: item.title,
        source: item.source,
        documentDate: item.documentDate,
        validFrom: item.validFrom,
        validTo: item.validTo,
        updatedAt: item.updatedAt,
        content: item.content.slice(0, 6000)
      };
    })
  };
}

function askAIAboutKnowledge() {
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const ta = document.getElementById('chat-input');
  ta.value = 'Uwzględnij aktualną bazę wiedzy MOW, w tym daty obowiązywania zmian czasowych i wzory dokumentów. Odpowiedz, które wpisy są aktywne teraz i jak wpływają na praktykę wychowawcy.';
  autoResizeTA(ta);
  saveChatDraft();
  sendChat();
}

function useKnowledgeInAI(id) {
  const item = knowledgeItems.find(x => x.id === id);
  if (!item) return;
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const status = getKnowledgeStatus(item);
  const ta = document.getElementById('chat-input');
  ta.value = `Zinterpretuj ten wpis z bazy wiedzy MOW. Powiedz, czy obowiązuje dzisiaj, jak wpływa na praktykę i jakie źródło należy wskazać.\n\nStatus: ${status.label}\nTyp: ${labelKnowledgeType(item.type)}\nTytuł: ${item.title}\nŹródło: ${item.source || 'brak'}\nData dokumentu: ${item.documentDate || 'brak'}\nObowiązuje od: ${item.validFrom || 'brak'}\nObowiązuje do: ${item.validTo || 'bezterminowo'}\n\nTreść:\n${item.content.slice(0, 8000)}`;
  autoResizeTA(ta);
  saveChatDraft();
  sendChat();
}
