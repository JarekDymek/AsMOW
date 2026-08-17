/* ────────────────────────────────
   PWA INSTALL
──────────────────────────────── */
let deferredPrompt = null;
let installButton = null;

// Rejestracja jest celowo wykonywana od razu. Edge potrafi zgłosić
// beforeinstallprompt zanim zakończy się cięższa inicjalizacja aplikacji.
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  updateInstallButton();
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  updateInstallButton();
});

function setupInstall() {
  installButton = document.getElementById('install-btn');
  if (!installButton) return;
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (choice?.outcome === 'accepted') installButton.style.display = 'none';
      else updateInstallButton();
      return;
    }
    openInstallHelp();
  });
  updateInstallButton();
}

function updateInstallButton() {
  if (!installButton) return;
  if (isStandaloneApp()) {
    installButton.style.display = 'none';
    return;
  }
  installButton.style.display = 'inline-flex';
  installButton.textContent = isIOSDevice() ? 'Dodaj' : deferredPrompt ? 'Instaluj' : 'Jak zainstalować';
  installButton.setAttribute('aria-label', deferredPrompt
    ? 'Zainstaluj aplikację na urządzeniu'
    : 'Pokaż instrukcję instalacji aplikacji na urządzeniu');
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
      'W Edge odśwież stronę po jej otwarciu.',
      'Jeżeli w nagłówku widoczny jest przycisk Instaluj, kliknij go i potwierdź instalację.',
      'Jeżeli widzisz Jak zainstalować, wybierz w Edge: ⋯ > Aplikacje > Zainstaluj tę witrynę jako aplikację.',
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
