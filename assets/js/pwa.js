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

  installBtn.style.display = 'inline-flex';
  installBtn.textContent = isIOSDevice() ? 'Dodaj' : 'Instaluj';
  installBtn.setAttribute('aria-label', 'Zainstaluj aplikację na urządzeniu');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-flex';
    installBtn.textContent = 'Instaluj';
  });

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = 'none';
      return;
    }
    openInstallHelp();
  });

  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
  });
}

function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIOSDevice() {
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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
  const isiOS = isIOSDevice();
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
      'Na Androidzie otwórz link w Chrome.',
      'Dotknij żółtego przycisku Instaluj w nagłówku aplikacji.',
      'Jeżeli pojawi się okno Chrome, wybierz Zainstaluj.',
      'Jeżeli Chrome pokaże tylko menu, wybierz Zainstaluj aplikację albo Dodaj do ekranu głównego.'
    ];
  }
  if (isWindows) {
    return [
      'Na komputerze otwórz stronę w Chrome albo Edge.',
      'Kliknij Instaluj w nagłówku albo ikonę instalacji w pasku adresu.',
      'Wybierz Zainstaluj aplikację.',
      'Po instalacji aplikacja będzie dostępna w menu Start.'
    ];
  }
  return [
    'Otwórz stronę w Chrome, Edge albo Safari.',
    'Użyj przycisku Instaluj, jeśli jest dostępny.',
    'Jeżeli nie ma okna instalacji, użyj menu przeglądarki i wybierz Dodaj do ekranu głównego lub Zainstaluj aplikację.'
  ];
}

/* ────────────────────────────────
   SERVICE WORKER (offline cache)
──────────────────────────────── */
if ('serviceWorker' in navigator) {
  let refreshingForUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshingForUpdate) return;
    refreshingForUpdate = true;
    window.location.reload();
  });

  navigator.serviceWorker.register('./sw.js', { scope: './' })
    .then(reg => {
      setupServiceWorkerUpdate(reg);
      setInterval(() => reg.update().catch(()=>{}), 60 * 60 * 1000);
    })
    .catch(()=>{});
}

function setupServiceWorkerUpdate(reg) {
  if (reg.waiting && navigator.serviceWorker.controller) showUpdateToast(reg);
  reg.addEventListener('updatefound', () => {
    const worker = reg.installing;
    if (!worker) return;
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        showUpdateToast(reg);
      }
    });
  });
}

function showUpdateToast(reg) {
  const toast = document.getElementById('update-toast');
  const btn = document.getElementById('update-apply-btn');
  if (!toast || !btn) return;
  toast.hidden = false;
  btn.onclick = () => {
    if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    else window.location.reload();
  };
}
