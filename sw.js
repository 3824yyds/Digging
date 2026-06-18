const CACHE = 'perpetual-garden-v1';
const CORE = [
  './',
  './index.html',
  './sw.js',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // network-first for the three.js CDN module so it stays fresh, cache fallback for offline
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      try {
        const url = new URL(req.url);
        if (req.method === 'GET' && (url.origin === location.origin || url.host.includes('jsdelivr.net'))) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
      } catch (_) {}
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
