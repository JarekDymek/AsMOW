/* ────────────────────────────────
   PWA INSTALL
──────────────────────────────── */
let deferredPrompt = null;
function setupInstall() {
  const installBtn = document.getElementById('install-btn');
  if (!installBtn) return;

  if (isStandaloneApp()) {
    installBtn.style.display = 'none';
    return;
  }

  installBtn.style.display = 'none';

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-flex';
    installBtn.textContent = 'Instaluj';
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
  });
}

function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function openInstallHelp() {
  const steps = getInstallSteps();
  document.getElementById('install-steps').innerHTML =
    steps.map(s => `<div class="install-step">${s}</div>`).join('');
  document.getElementById('install-sheet').classList.add('open');
}

function closeInstallHelp(e) {
  const sheet = document.getElementById('install-sheet');
  if (!e || e.target === sheet) sheet.classList.remove('open');
}

function getInstallSteps() {
  const ua = navigator.userAgent || '';
  const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isWindows = /Windows/i.test(ua);

  if (isiOS) {
    return [
      'Na iPhone albo iPad otwórz tę stronę w Safari.',
      'Dotknij przycisku Udostępnij.',
      'Wybierz: Do ekranu początkowego.',
      'Potwierdź: Dodaj.'
    ];
  }
  if (isAndroid) {
    return [
      'Na Androidzie otwórz stronę w Chrome.',
      'Dotknij Instaluj, jeśli przycisk jest widoczny.',
      'Jeżeli go nie ma: menu ⋮ i opcja Dodaj do ekranu głównego albo Zainstaluj aplikację.',
      'Po instalacji ikona pojawi się na ekranie telefonu.'
    ];
  }
  if (isWindows) {
    return [
      'Na komputerze otwórz stronę w Chrome albo Edge.',
      'Kliknij ikonę instalacji w pasku adresu albo menu przeglądarki.',
      'Wybierz Zainstaluj aplikację.',
      'Po instalacji aplikacja będzie dostępna w menu Start.'
    ];
  }
  return [
    'Otwórz stronę w Chrome, Edge albo Safari.',
    'Użyj przycisku Instaluj, jeśli jest dostępny.',
    'Jeżeli nie ma przycisku, użyj menu przeglądarki i wybierz Dodaj do ekranu głównego lub Zainstaluj aplikację.'
  ];
}

/* ────────────────────────────────
   SERVICE WORKER (offline cache)
──────────────────────────────── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(()=>{});
}
