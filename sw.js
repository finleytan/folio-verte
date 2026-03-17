// Verte Service Worker — offline caching
// Cache version: bump this string to force a cache refresh on update
const CACHE = 'verte-v5';

// Everything Verte needs to run offline
const PRECACHE = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap',
  // Pre-cache JSZip so EPUB parsing works offline
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
];

// Install: pre-cache the app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Cache what we can — font CDN may fail, that's OK
      return Promise.allSettled(
        PRECACHE.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
//   App shell  → stale-while-revalidate (fast from cache, background update)
//   Fonts/CDN  → cache-first (immutable resources)
self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Don't try to cache blob: or data: URLs
  if (url.protocol === 'blob:' || url.protocol === 'data:') return;

  const isAppShell = url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/audiobook-reader.html');

  // App shell: stale-while-revalidate
  // Serve cached version immediately for fast load, then fetch updated
  // version in background so the next launch gets new code
  if (isAppShell) {
    e.respondWith(
      caches.open(CACHE).then(cache => {
        return cache.match(e.request).then(cached => {
          const fetchPromise = fetch(e.request).then(res => {
            if (res && res.status === 200) {
              cache.put(e.request, res.clone());
            }
            return res;
          }).catch(() => cached); // offline fallback
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // Google Fonts + JSZip CDN: cache-first (immutable)
  const isFonts = url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');
  const isCDN = url.hostname.includes('cdnjs.cloudflare.com');

  if (isFonts || isCDN) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Everything else (blob URLs for audio etc): pass through
});
