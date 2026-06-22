/* ────────────────────────────────
   RENDER CHAT PILLS
──────────────────────────────── */
function renderChatPills() {
  document.getElementById('chat-pills').innerHTML =
    CHAT_PILLS.map((pill, index) => {
      const item = normalizeChatPill(pill);
      return `
        <button class="pill ${item.cls}" onclick="setQuestion(getChatPillText(${index}))">
          <span class="pill-icon">${item.icon}</span>
          <span class="pill-label">${escapeHtml(item.text)}</span>
        </button>`;
    }).join('');
}

function normalizeChatPill(pill) {
  if (typeof pill === 'string') return { icon: '💬', text: pill, cls: 'qblue' };
  return {
    icon: pill.icon || '💬',
    text: pill.text || '',
    cls: pill.cls || 'qblue'
  };
}

function getChatPillText(index) {
  return normalizeChatPill(CHAT_PILLS[index]).text;
}

function askAIFromTab(scope, inputId) {
  const input = document.getElementById(inputId);
  const text = input ? input.value.trim() : '';
  const prefixes = {
    procedury: 'Pytanie z zakładki PROCEDURY. Odpowiedz według dokumentów i procedur MOW nr 1 w Malborku. Jeśli opis jest zbyt ogólny, najpierw dopytaj o brakujące fakty.',
    stopnie: 'Pytanie z zakładki STOPNIE USPOŁECZNIENIA. Odpowiedz według regulaminu stopni MOW. Oddziel ocenę zachowania od propozycji rozmowy wychowawczej.',
    prawo: 'Pytanie z zakładki PRAWO. Wskaż podstawę prawną lub dokument MOW, a gdy nie masz pewności, zaznacz to i dopytaj.'
  };
  const question = `${prefixes[scope] || 'Pytanie do AI.'}\n\nPytanie użytkownika: ${text || 'Potrzebuję krótkiej konsultacji w tym obszarze.'}`;
  if (input) input.value = '';
  nav('s-ai', document.querySelector('.nav-btn:last-child'));
  const ta = document.getElementById('chat-input');
  ta.value = question;
  autoResizeTA(ta);
  saveChatDraft();
  sendChat();
}
