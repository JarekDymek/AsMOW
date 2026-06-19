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
