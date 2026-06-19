/* ────────────────────────────────
   NOTATNIK (notes stored in localStorage)
──────────────────────────────── */
function loadNotes() { renderNotesList(); }

function saveNote() {
  const ta = document.getElementById('note-input');
  const txt = ta.value.trim();
  if (!txt) return;
  const notes = getNotes();
  notes.unshift({ id: Date.now(), txt, date: new Date().toLocaleString('pl') });
  localStorage.setItem('mow_notes_v2', JSON.stringify(notes));
  ta.value = '';
  renderNotesList();
}

function getNotes() {
  try { return JSON.parse(localStorage.getItem('mow_notes_v2') || '[]'); } catch { return []; }
}

function deleteNote(id) {
  localStorage.setItem('mow_notes_v2', JSON.stringify(getNotes().filter(n => n.id !== id)));
  renderNotesList();
}

function renderNotesList() {
  const el = document.getElementById('notes-list');
  if (!el) return;
  const notes = getNotes();
  el.innerHTML = notes.length
    ? `<p class="sec-title">📁 Zapisane notatki (${notes.length})</p>` +
      notes.map(n => `
        <div class="note-card">
          <div class="note-meta">📅 ${n.date}</div>
          <div class="note-content">${n.txt.replace(/\n/g,'<br>')}</div>
          <button class="note-del" onclick="deleteNote(${n.id})">✕</button>
        </div>`).join('')
    : '<p style="text-align:center;color:var(--muted);font-size:.85rem;padding:20px 0">Brak notatek</p>';
}

/* Extracted note sheet helpers */
function openNota()  { document.getElementById('nota-sheet').classList.add('open'); renderNotesList(); }
function closeNota(e){ if(e.target===document.getElementById('nota-sheet')) document.getElementById('nota-sheet').classList.remove('open'); }
