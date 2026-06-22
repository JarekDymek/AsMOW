const CACHE = 'mow-pwa-v32';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/css/base.css',
  './assets/css/layout.css',
  './assets/css/components.css',
  './assets/css/home.css',
  './assets/css/procedures.css',
  './assets/css/social-levels.css',
  './assets/css/detail.css',
  './assets/css/notes.css',
  './assets/css/ai.css',
  './assets/css/harmonogram.css',
  './assets/css/current-info.css',
  './assets/css/utilities.css',
  './assets/js/data-schedule.js',
  './assets/js/data-procedures.js',
  './assets/js/data-social-levels.js',
  './assets/js/data-quick-actions.js',
  './assets/js/data-chat-pills.js',
  './assets/js/data-laws.js',
  './assets/js/state.js',
  './assets/js/utils.js',
  './assets/js/files.js',
  './assets/js/accordion.js',
  './assets/js/navigation.js',
  './assets/js/clock.js',
  './assets/js/day-schedule.js',
  './assets/js/main-actions.js',
  './assets/js/procedures.js',
  './assets/js/social-levels.js',
  './assets/js/law.js',
  './assets/js/notes.js',
  './assets/js/current-info.js',
  './assets/js/ai-config.js',
  './assets/js/ai-chat.js',
  './assets/js/ai-voice.js',
  './assets/js/tab-ai.js',
  './assets/js/harmonogram.js',
  './assets/js/weekly-plan.js',
  './assets/js/knowledge-storage.js',
  './assets/js/knowledge-list.js',
  './assets/js/knowledge-form.js',
  './assets/js/knowledge-context.js',
  './assets/js/backup.js',
  './assets/js/pwa.js',
  './assets/js/app.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.pathname === '/api/chat' || url.pathname === '/api/weekly-plan' || url.pathname === '/api/current-info-mail' || url.pathname === '/api/extract-file' || url.pathname === '/health') {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(response => {
      if (response && response.ok && url.origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
      }
      return response;
    }).catch(() => cached))
  );
});
