function setQuestion(q) {
  const ta = document.getElementById('chat-input');
  ta.value = q;
  autoResizeTA(ta);
  ta.focus();
}

function autoResizeTA(ta) {
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
}

function chatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
}

function clearChat() {
  if (!confirm('Wyczyścić historię rozmowy AI na tym urządzeniu?')) return;
  chatHistory = [];
  localStorage.removeItem('mow_chat_history_v2');
  localStorage.removeItem(CHAT_DRAFT_KEY);
  const win = document.getElementById('chat-window');
  win.innerHTML = '<div class="msg ai">Historia wyczyszczona. Zadaj nowe pytanie!</div>';
}

async function checkOnline() {
  const dot = document.getElementById('ai-dot');
  const txt = document.getElementById('ai-status-txt');
  if (!navigator.onLine) {
    dot.className = 'dot offline';
    txt.textContent = 'Brak połączenia - AI niedostępne';
    return;
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(getAIHealthUrl(), { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    dot.className = 'dot ' + (res.ok ? 'online' : 'offline');
    txt.textContent = res.ok ? 'Połączono - asystent AI dostępny' : 'Backend AI nie odpowiada poprawnie';
  } catch {
    dot.className = 'dot offline';
    txt.textContent = 'Brak połączenia z backendem AI';
  }
}

async function sendChat() {
  const ta = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const q = ta.value.trim();
  if (!q && !aiAttachments.length) return;
  const attachmentsToSend = aiAttachments.slice();
  ta.value = '';
  ta.style.height = 'auto';
  localStorage.removeItem(CHAT_DRAFT_KEY);
  aiAttachments = [];
  renderAIAttachments();
  if (sendBtn) sendBtn.disabled = true;

  const userContent = q || 'Przeanalizuj załączone pliki.';
  appendMsg('user', userContent);
  chatHistory.push({ role: 'user', content: userContent });
  saveChatHistory();
  lastFailedChat = {
    question: q,
    attachments: attachmentsToSend,
    history: chatHistory.slice(-18)
  };

  const loading = appendMsg('loading', 'Szukam odpowiedzi w dokumentach i rozmowie...');
  let timer = null;

  try {
    const ctrl = new AbortController();
    timer = setTimeout(() => ctrl.abort(), 90000);
    const res = await fetch(AI_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        messages: chatHistory.slice(-18),
        attachments: attachmentsToSend,
        context: buildAssistantContext(),
        clientTime: new Date().toISOString()
      })
    });
    clearTimeout(timer);

    loading.remove();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (err.code === 'OPENAI_QUOTA') {
        throw new Error(err.error || 'Konto OpenAI nie ma dostępnych środków albo osiągnęło limit wydatków.');
      }
      if (err.code === 'GEMINI_QUOTA') {
        throw new Error(err.error || 'Gemini API osiągnęło darmowy limit zapytań. Spróbuj później albo sprawdź limity w Google AI Studio.');
      }
      if (err.code === 'GEMINI_KEY_MISSING') {
        throw new Error(err.error || 'Brakuje klucza Gemini w ustawieniach Render.');
      }
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const answer = data.answer || data.message || data.content || '(brak odpowiedzi)';
    chatHistory.push({ role: 'assistant', content: answer });
    saveChatHistory();
    lastFailedChat = null;
    appendMsg('ai', answer, data.sources || []);

  } catch (err) {
    if (timer) clearTimeout(timer);
    loading.remove();
    if (!navigator.onLine) {
      appendMsg('err', 'Brak połączenia z Internetem. Sprawdź zasięg sieci.', [], { retry: true });
    } else if (err.name === 'AbortError') {
      appendMsg('err', 'Serwer AI odpowiada zbyt długo. Naciśnij „Powtórz”, żeby ponowić pytanie.', [], { retry: true });
    } else {
      appendMsg('err', `Nie mogę połączyć się z asystentem AI: ${err.message}`, [], { retry: true });
    }
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

function saveChatDraft() {
  const ta = document.getElementById('chat-input');
  if (!ta) return;
  const value = ta.value.trim();
  if (value) localStorage.setItem(CHAT_DRAFT_KEY, value);
  else localStorage.removeItem(CHAT_DRAFT_KEY);
}

function loadChatDraft() {
  const draft = localStorage.getItem(CHAT_DRAFT_KEY);
  if (!draft) return;
  const ta = document.getElementById('chat-input');
  if (!ta || ta.value.trim()) return;
  ta.value = draft;
  autoResizeTA(ta);
}

function setupWorkSafeguards() {
  window.addEventListener('beforeunload', e => {
    const draft = document.getElementById('chat-input')?.value.trim();
    const kbDraft = document.getElementById('kb-content')?.value.trim();
    if (draft || aiAttachments.length || kbDraft) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

function loadChatHistory() {
  try {
    chatHistory = JSON.parse(localStorage.getItem(CHAT_STORE_KEY) || '[]')
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-18);
  } catch {
    chatHistory = [];
  }
  if (!chatHistory.length) return;
  const win = document.getElementById('chat-window');
  win.innerHTML = '<div class="msg ai">Kontynuuję poprzedni wątek. Możesz dopytać albo wyczyścić historię.</div>';
  chatHistory.forEach(m => appendMsg(m.role === 'user' ? 'user' : 'ai', m.content));
}

function saveChatHistory() {
  localStorage.setItem(CHAT_STORE_KEY, JSON.stringify(chatHistory.slice(-18)));
}

function appendMsg(type, text, sources = [], options = {}) {
  const win = document.getElementById('chat-window');
  const el = document.createElement('div');
  el.className = `msg ${type}`;
  el.innerHTML = formatChatText(text);
  if (sources.length) {
    const src = document.createElement('div');
    src.style.marginTop = '8px';
    src.style.fontSize = '.72rem';
    src.style.color = 'var(--muted)';
    src.innerHTML = '<strong>Źródła:</strong> ' + sources.map(escapeHtml).join('; ');
    el.appendChild(src);
  }
  if (options.retry) {
    const btn = document.createElement('button');
    btn.className = 'retry-btn';
    btn.type = 'button';
    btn.textContent = 'Powtórz';
    btn.onclick = retryLastChat;
    el.appendChild(btn);
  }
  win.appendChild(el);
  win.scrollTop = win.scrollHeight;
  return el;
}

async function retryLastChat() {
  if (!lastFailedChat) return;
  chatHistory = lastFailedChat.history.slice(0, -1);
  aiAttachments = lastFailedChat.attachments || [];
  document.getElementById('chat-input').value = lastFailedChat.question || '';
  renderAIAttachments();
  await sendChat();
}

async function handleAIFileInput(input) {
  const files = [...input.files].slice(0, 6);
  if (!files.length) return;
  try {
    const items = await Promise.all(files.map(fileToAttachment));
    aiAttachments.push(...items);
    renderAIAttachments();
  } catch (err) {
    appendMsg('err', err.message || 'Nie udało się dodać pliku.');
  } finally {
    input.value = '';
  }
}

function renderAIAttachments() {
  const el = document.getElementById('ai-attachments');
  if (!el) return;
  el.innerHTML = aiAttachments.map((a, i) => `
    <span class="attach-chip">
      ${isImageAttachment(a) ? '🖼' : '📄'} ${escapeHtml(a.name)}
      <button type="button" onclick="removeAIAttachment(${i})">×</button>
    </span>
  `).join('');
}

function removeAIAttachment(index) {
  aiAttachments.splice(index, 1);
  renderAIAttachments();
}

function formatChatText(text) {
  return escapeHtml(String(text || ''))
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

