function getKnowledgeContext() {
  const today = new Date().toISOString().slice(0, 10);
  const sorted = getEffectiveKnowledgeItems().sort(compareKnowledgeItems).slice(0, 36);
  return {
    today,
    centralVersion: centralKnowledgeMeta?.version || '',
    centralUpdatedAt: centralKnowledgeMeta?.updatedAt || '',
    rule: 'Wpisy centralne są zatwierdzonym źródłem wiedzy MOW. Wpisy aktywne mają pierwszeństwo. Wygasłe stosuj tylko do pytań o przeszłość. Przy konflikcie stosuj nowszą datę dokumentu/aktualizacji; jeżeli data jest taka sama, wpis centralny ma pierwszeństwo przed lokalnym. Wpis oznaczony jako zastąpiony traktuj jako archiwalny.',
    items: sorted.map(item => {
      const status = getKnowledgeStatus(item);
      return {
        status: item.effectiveStatus || status.key,
        sourceKind: item.isCentral ? 'centralne' : 'lokalne',
        type: labelKnowledgeType(item.type),
        title: item.title,
        source: item.source,
        documentDate: item.documentDate,
        validFrom: item.validFrom,
        validTo: item.validTo,
        version: item.version,
        approvedBy: item.approvedBy,
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
  const item = getAllKnowledgeItems().find(x => String(x.id) === String(id));
  if (!item) return;
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const status = getKnowledgeStatus(item);
  const ta = document.getElementById('chat-input');
  ta.value = `Zinterpretuj ten wpis z bazy wiedzy MOW. Powiedz, czy obowiązuje dzisiaj, jak wpływa na praktykę i jakie źródło należy wskazać.\n\nŹródło wpisu: ${item.isCentral ? 'centralna baza MOW' : 'lokalna baza użytkownika'}\nStatus: ${status.label}\nTyp: ${labelKnowledgeType(item.type)}\nTytuł: ${item.title}\nŹródło: ${item.source || 'brak'}\nWersja: ${item.version || 'brak'}\nZatwierdził: ${item.approvedBy || 'brak'}\nData dokumentu: ${item.documentDate || 'brak'}\nObowiązuje od: ${item.validFrom || 'brak'}\nObowiązuje do: ${item.validTo || 'bezterminowo'}\n\nTreść:\n${item.content.slice(0, 8000)}`;
  autoResizeTA(ta);
  saveChatDraft();
  sendChat();
}
