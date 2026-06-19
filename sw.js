const CACHE = 'mow-pwa-v14';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/assets/css/base.css',
  '/assets/css/layout.css',
  '/assets/css/components.css',
  '/assets/css/harmonogram.css',
  '/assets/css/utilities.css',
  '/assets/js/data.js',
  '/assets/js/state.js',
  '/assets/js/utils.js',
  '/assets/js/files.js',
  '/assets/js/ui.js',
  '/assets/js/notes.js',
  '/assets/js/ai-config.js',
  '/assets/js/ai-chat.js',
  '/assets/js/ai-voice.js',
  '/assets/js/ai.js',
  '/assets/js/harmonogram.js',
  '/assets/js/weekly-plan.js',
  '/assets/js/knowledge-base.js',
  '/assets/js/pwa.js',
  '/assets/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
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

  if (url.pathname === '/api/chat' || url.pathname === '/api/weekly-plan' || url.pathname === '/api/extract-file' || url.pathname === '/health') {
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
