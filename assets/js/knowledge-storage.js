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
