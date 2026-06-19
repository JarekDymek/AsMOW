/* ────────────────────────────────
   KNOWLEDGE BASE
──────────────────────────────── */
function loadKnowledgeBase() {
  try {
    knowledgeItems = JSON.parse(localStorage.getItem(KNOWLEDGE_KEY) || '[]')
      .map(item => normalizeKnowledgeItem(item, 'local'))
      .filter(item => item.title && item.content)
      .slice(0, 40);
  } catch {
    knowledgeItems = [];
  }
}

function saveKnowledgeBase() {
  const localOnly = knowledgeItems
    .filter(item => item.sourceKind !== 'central')
    .map(({ sourceKind, isCentral, effectiveStatus, ...item }) => item);
  localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(localOnly.slice(0, 40)));
}

function loadCentralKnowledgeCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CENTRAL_KNOWLEDGE_KEY) || 'null');
    if (!cached || !Array.isArray(cached.items)) return;
    centralKnowledgeMeta = {
      version: cached.version || '',
      updatedAt: cached.updatedAt || '',
      source: cached.source || 'Centralna baza wiedzy MOW',
      cachedAt: cached.cachedAt || ''
    };
    centralKnowledgeItems = cached.items
      .map(item => normalizeKnowledgeItem(item, 'central'))
      .filter(item => item.title && item.content)
      .slice(0, 200);
  } catch {
    centralKnowledgeItems = [];
    centralKnowledgeMeta = null;
  }
}

async function refreshCentralKnowledgeBase() {
  try {
    const res = await fetch(`${getAIBackendBaseUrl()}/api/knowledge`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
    centralKnowledgeMeta = {
      version: data.version || '',
      updatedAt: data.updatedAt || '',
      source: data.source || 'Centralna baza wiedzy MOW',
      cachedAt: new Date().toISOString()
    };
    centralKnowledgeItems = (Array.isArray(data.items) ? data.items : [])
      .map(item => normalizeKnowledgeItem(item, 'central'))
      .filter(item => item.title && item.content)
      .slice(0, 200);
    localStorage.setItem(CENTRAL_KNOWLEDGE_KEY, JSON.stringify({
      ...centralKnowledgeMeta,
      items: centralKnowledgeItems
    }));
    renderKnowledgeList();
    setKnowledgeStatus(`Centralna baza wiedzy zaktualizowana${centralKnowledgeMeta.version ? `: ${centralKnowledgeMeta.version}` : ''}.`);
  } catch (err) {
    renderKnowledgeList();
    if (centralKnowledgeItems.length) {
      setKnowledgeStatus(`Używam zapisanej kopii centralnej bazy wiedzy. Nie udało się pobrać aktualizacji: ${err.message}`);
    } else {
      setKnowledgeStatus(`Nie udało się pobrać centralnej bazy wiedzy: ${err.message}`);
    }
  }
}

function normalizeKnowledgeItem(item, sourceKind = 'local') {
  const id = item.id || `${sourceKind}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    id,
    sourceKind,
    isCentral: sourceKind === 'central' || item.sourceKind === 'central' || item.isCentral === true,
    key: String(item.key || '').trim(),
    type: item.type || 'wpis',
    title: String(item.title || '').slice(0, 180),
    source: String(item.source || '').slice(0, 220),
    documentDate: item.documentDate || '',
    validFrom: item.validFrom || '',
    validTo: item.validTo || '',
    version: item.version || '',
    approvedBy: item.approvedBy || '',
    content: String(item.content || '').slice(0, 50_000),
    updatedAt: item.updatedAt || new Date().toISOString()
  };
}

function getAllKnowledgeItems() {
  return [...centralKnowledgeItems, ...knowledgeItems];
}

function getEffectiveKnowledgeItems() {
  const items = getAllKnowledgeItems().map(item => ({ ...item }));
  const activeByKey = new Map();
  items.forEach(item => {
    const status = getKnowledgeStatus(item);
    item.effectiveStatus = status.key;
    if (status.key !== 'active') return;
    const key = getKnowledgeIdentity(item);
    const current = activeByKey.get(key);
    if (!current || compareKnowledgeFreshness(item, current) > 0 || (compareKnowledgeFreshness(item, current) === 0 && item.isCentral && !current.isCentral)) {
      activeByKey.set(key, item);
    }
  });
  return items.map(item => {
    const status = getKnowledgeStatus(item);
    if (status.key === 'active') {
      const winner = activeByKey.get(getKnowledgeIdentity(item));
      if (winner && winner.id !== item.id) {
        return { ...item, effectiveStatus: 'superseded' };
      }
    }
    return item;
  });
}

function getKnowledgeIdentity(item) {
  const raw = item.key || `${item.type}:${item.title}`;
  return String(raw).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function compareKnowledgeFreshness(a, b) {
  const da = String(a.documentDate || a.updatedAt || '');
  const db = String(b.documentDate || b.updatedAt || '');
  return da.localeCompare(db);
}
