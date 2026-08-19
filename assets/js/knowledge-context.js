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
  setAIContextScope('prawo');
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const ta = document.getElementById('chat-input');
  ta.value = 'Uwzględnij aktualną bazę wiedzy MOW, w tym daty obowiązywania zmian czasowych i wzory dokumentów. Odpowiedz, które wpisy są aktywne teraz i jak wpływają na praktykę wychowawcy.';
  autoResizeTA(ta);
  saveChatDraft();
  sendChat();
}

function useKnowledgeInAI(id) {
  const item = getEffectiveKnowledgeItems().find(x => String(x.id) === String(id));
  if (!item) return;
  setAIContextScope('prawo');
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const status = item.effectiveStatus === 'superseded'
    ? { key: 'superseded', label: 'zastąpione nowszym wpisem' }
    : getKnowledgeStatus(item);
  const question = `Wyjaśnij wpis bazy wiedzy: ${item.title}`;
  const answer = formatKnowledgeExplanation(item, status);
  appendMsg('user', question);
  appendMsg('ai', answer, item.source ? [item.source] : []);
  chatHistory.push({ role: 'user', content: question });
  chatHistory.push({ role: 'assistant', content: answer });
  chatHistory = chatHistory.slice(-40);
  saveChatHistory();
  lastFailedChat = null;
}

function formatKnowledgeExplanation(item, status) {
  const origin = item.isCentral
    ? 'Wpis centralny, wspólny dla użytkowników i tylko do odczytu.'
    : 'Wpis lokalny, zapisany wyłącznie w tej przeglądarce.';
  const meaning = isKnowledgeQualityItem(item)
    ? getKnowledgeQualityExplanation(item)
    : item.content;
  const validity = item.validTo
    ? `${item.validFrom || 'brak daty początkowej'} – ${item.validTo}`
    : `od ${item.validFrom || item.documentDate || 'daty zatwierdzenia'} bez wskazanej daty końcowej`;

  return [
    '**Wyjaśnienie wpisu bazy wiedzy MOW**',
    '',
    `**Co to jest:** ${origin}`,
    `**Status:** ${status.label}.`,
    `**Okres:** ${validity}.`,
    '',
    `**Znaczenie dla aplikacji:** ${meaning}`,
    '',
    `**Źródło:** ${item.source || 'nie wskazano'}.`,
    item.approvedBy ? `**Zatwierdził:** ${item.approvedBy}.` : '',
    '',
    item.isCentral
      ? '**Ważne:** wpis pomaga odnaleźć właściwą zasadę lub źródło. W sprawie prawnej sprawdź aktualny dokument i datę jego obowiązywania.'
      : '**Ważne:** wpis lokalny nie jest automatycznie zatwierdzony dla całego MOW ani synchronizowany z innymi urządzeniami.'
  ].filter(Boolean).join('\n');
}

function getKnowledgeQualityExplanation(item) {
  if (item.type === 'bank-odpowiedzi-i-intencji') {
    return 'To zestaw 250 krótkich, kontrolowanych odpowiedzi oraz wariantów pytań. Lokalny router rozpoznaje sens pytania, nawet gdy nie jest zadane słowo w słowo. Przy pewnym dopasowaniu odpowiada bez zewnętrznego AI; przy niejasności dopytuje, a dopiero nowe sprawy kieruje do modelu online.';
  }
  return 'To zestaw pytań kontrolnych uruchamianych podczas testów aplikacji. Pilnuje m.in. prawidłowego pensum 24 godzin, pierwszeństwa dokumentów MOW, bezpieczeństwa, dat zmian czasowych i tego, czy znane błędy nie wróciły po aktualizacji.';
}
