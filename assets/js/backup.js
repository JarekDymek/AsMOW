/* ────────────────────────────────
   LOCAL DATA BACKUP
──────────────────────────────── */
const BACKUP_STORAGE_KEYS = [
  CHAT_STORE_KEY,
  CHAT_DRAFT_KEY,
  WEEKLY_SETTINGS_KEY,
  WEEKLY_PLAN_KEY,
  KNOWLEDGE_KEY,
  CENTRAL_KNOWLEDGE_KEY,
  'mow_notes_v2',
  'mow_day_schedule_collapsed_v1'
];

function exportLocalBackup() {
  const data = {};
  BACKUP_STORAGE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  });
  const payload = {
    app: 'Asystent MOW',
    type: 'asmow-local-backup',
    version: APP_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    warning: 'Plik może zawierać historię rozmów, token harmonogramu, notatki i lokalną bazę wiedzy. Przechowuj go jak dokument służbowy.',
    data
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `asmow-kopia-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setBackupStatus('Utworzono plik kopii danych lokalnych.');
}

async function importLocalBackup(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const text = await readFileText(file);
    const payload = JSON.parse(text);
    if (payload?.type !== 'asmow-local-backup' || !payload.data || typeof payload.data !== 'object') {
      throw new Error('To nie wygląda jak kopia danych Asystenta MOW.');
    }
    const allowed = new Set(BACKUP_STORAGE_KEYS);
    Object.entries(payload.data).forEach(([key, value]) => {
      if (allowed.has(key) && typeof value === 'string') localStorage.setItem(key, value);
    });
    setBackupStatus('Przywrócono kopię. Odświeżam aplikację...');
    setTimeout(() => window.location.reload(), 600);
  } catch (err) {
    setBackupStatus(`Nie udało się przywrócić kopii: ${err.message}`);
  } finally {
    input.value = '';
  }
}

function clearLocalDeviceData() {
  const first = confirm('Usunąć lokalne dane aplikacji z tego urządzenia? Dotyczy historii AI, notatek, lokalnej bazy wiedzy, planu i tokenu harmonogramu.');
  if (!first) return;
  const second = confirm('To działanie jest nieodwracalne bez wcześniejszej kopii. Kontynuować?');
  if (!second) return;
  BACKUP_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  setBackupStatus('Usunięto lokalne dane. Odświeżam aplikację...');
  setTimeout(() => window.location.reload(), 600);
}

function setBackupStatus(text) {
  const el = document.getElementById('backup-status');
  if (el) el.textContent = text;
}
