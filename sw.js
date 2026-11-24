// ==============================================================================
// SERVICE WORKER - ACC FUTSAL CUP 2026 PWA APP
// ==============================================================================

const CACHE_NAME = 'acc-score-v202-logos';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/operator.html',
  '/manifest.json',
  '/css/display.css',
  '/css/operator.css',
  '/js/config.js',
  '/js/supabase-sync.js',
  '/js/teams.js',
  '/js/matches.js',
  '/js/app-display.js',
  '/js/app-operator.js',
  '/assets/favicon.png',
  '/assets/acc_logo.png',
  '/assets/logo.png',
  '/assets/apple-touch-icon.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-192.png',
  '/assets/icon-maskable-512.png'
];

// Install: Simpan shell aset aplikasi
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Bersihkan cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Tangani request
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Jangan sentuh Supabase, CDN eksternal realtime, atau WebSocket
  if (
    url.hostname.includes('supabase.co') ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:' ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Strategi Network-First untuk halaman HTML & script JS agar selalu dapat update terbaru
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
        })
    );
    return;
  }

  // Strategi Cache-First untuk aset gambar & font
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});
