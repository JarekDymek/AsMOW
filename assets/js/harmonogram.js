/* ────────────────────────────────
   HARMONOGRAM
──────────────────────────────── */
async function handleHarmFile(input) {
  const file = input.files[0];
  if (!file) return;
  harmFileName = file.name;
  try {
    harmAttachment = await fileToAttachment(file);
    harmContent = harmAttachment.text || '';
    showHarmFile(file, harmAttachment);
    renderHarmPreview(harmAttachment);
    if (harmContent) extractHarmNames();
    else document.getElementById('harm-pills').innerHTML = '';
  } catch (err) {
    appendMsg('err', 'Błąd odczytu pliku harmonogramu.');
  }
}

function showHarmFile(file, attachment = null) {
  const size = file.size < 1024 ? `${file.size} B` : `${(file.size/1024).toFixed(1)} KB`;
  document.getElementById('harm-file-list').innerHTML = `
    <div class="file-item">
      <span class="fi-icon">${attachment && isImageAttachment(attachment) ? '🖼' : '📋'}</span>
      <span class="fi-name">${file.name}</span>
      <span class="fi-size">${size}</span>
      <button class="fi-del" onclick="removeHarmFile()">✕</button>
    </div>`;
  document.getElementById('harm-loaded').style.display = 'block';
  document.getElementById('harm-result').style.display = 'none';
}

function removeHarmFile() {
  harmContent = null;
  harmFileName = null;
  harmAttachment = null;
  document.getElementById('harm-file-list').innerHTML = '';
  document.getElementById('harm-preview').style.display = 'none';
  document.getElementById('harm-preview').innerHTML = '';
  document.getElementById('harm-loaded').style.display = 'none';
  document.getElementById('harm-file-input').value = '';
}

function renderHarmPreview(attachment) {
  const el = document.getElementById('harm-preview');
  if (!el || !attachment) return;
  if (isImageAttachment(attachment) && attachment.dataUrl) {
    el.style.display = 'block';
    el.innerHTML = `
      <img src="${attachment.dataUrl}" alt="Screen harmonogramu" onclick="openImageViewer('${attachment.dataUrl}')">
      <button class="btn sec" style="width:100%;margin-top:8px" onclick="openImageViewer('${attachment.dataUrl}')">🔍 Powiększ screen</button>
    `;
    return;
  }
  el.style.display = 'none';
  el.innerHTML = '';
}

function extractHarmNames() {
  if (!harmContent) return;
  // Wyodrębnij unikalne słowa wyglądające jak nazwiska (z dużej litery, min 4 znaki)
  const lines = harmContent.split(/[\n\r]+/);
  const names = new Set();
  lines.forEach(line => {
    // szukaj wzorców: Imię Nazwisko lub Nazwisko
    const matches = line.match(/[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{3,}(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{3,})?/g);
    if (matches) matches.forEach(m => names.add(m.trim()));
  });
  // Pokaż max 8 jako pills
  const pills = [...names].slice(0, 8);
  document.getElementById('harm-pills').innerHTML =
    pills.map(n => `<button class="pill" onclick="document.getElementById('wych-input').value='${n.replace(/'/g,"\\'")}'; queryHarm()">👤 ${n}</button>`).join('');
}

function queryHarm() {
  const name = document.getElementById('wych-input').value.trim();
  if (!name) return;
  if (!harmContent) {
    const resultEl = document.getElementById('harm-result');
    const bodyEl   = document.getElementById('harm-result-body');
    resultEl.style.display = 'block';
    bodyEl.textContent = 'Ten format harmonogramu najlepiej przeanalizuje AI. Kliknij „Zapytaj AI o harmonogram”.';
    return;
  }

  const lines = harmContent.split(/[\n\r]+/);
  const nameLower = name.toLowerCase();

  // Znajdź wszystkie linie zawierające dane imię/nazwisko
  const matches = lines.filter(l => l.toLowerCase().includes(nameLower));

  const resultEl = document.getElementById('harm-result');
  const bodyEl   = document.getElementById('harm-result-body');
  resultEl.style.display = 'block';

  if (!matches.length) {
    bodyEl.textContent = `Nie znaleziono żadnych wpisów dla: "${name}"\n\nSprawdź pisownię lub wyszukaj inną osobę.`;
    return;
  }

  bodyEl.textContent = `WYNIKI DLA: ${name.toUpperCase()}\n` +
    `Znalezione wpisy (${matches.length}):\n\n` +
    matches.join('\n');
}

async function sendHarmToAI() {
  if (!harmContent && !harmAttachment) return;
  const name = document.getElementById('wych-input').value.trim();

  nav('s-ai', document.querySelector('.nav-btn:last-child'));

  const question = name
    ? `Na podstawie załączonego harmonogramu podsumuj dyżury i plan pracy dla wychowawcy: ${name}. Jeżeli dane są nieczytelne, dopytaj o brakujący fragment.\n\n--- HARMONOGRAM TEKSTOWY ---\n${(harmContent || '').slice(0, 5000)}`
    : `Przeanalizuj załączony harmonogram internatu i podsumuj go. Jeżeli pytanie jest zbyt ogólne albo dane są nieczytelne, zadaj pytanie doprecyzowujące.\n\n--- HARMONOGRAM TEKSTOWY ---\n${(harmContent || '').slice(0, 5000)}`;

  if (harmAttachment) {
    aiAttachments = [harmAttachment];
    renderAIAttachments();
  }
  document.getElementById('chat-input').value = question;
  await sendChat();
}

function openImageViewer(src) {
  imageZoom = 1;
  const viewer = document.getElementById('image-viewer');
  const img = document.getElementById('image-viewer-img');
  img.src = src;
  img.style.setProperty('--zoom', imageZoom);
  viewer.classList.add('open');
}

function closeImageViewer(e) {
  const viewer = document.getElementById('image-viewer');
  if (!e || e.target === viewer) viewer.classList.remove('open');
}

function zoomImage(delta) {
  imageZoom = Math.max(0.75, Math.min(3, imageZoom + delta));
  document.getElementById('image-viewer-img').style.setProperty('--zoom', imageZoom);
}
