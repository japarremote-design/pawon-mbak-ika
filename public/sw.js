// Service worker sederhana: halaman selalu diambil dari jaringan dulu
// (biar menu hari ini tidak basi), aset statis boleh dari cache.
const CACHE = 'pawon-v1';
const SHELL = ['/', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/admin')) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const salinan = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, salinan));
          return res;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match('/')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(
      (r) =>
        r ||
        fetch(e.request).then((res) => {
          if (res.ok && url.pathname.startsWith('/_next/static')) {
            const salinan = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, salinan));
          }
          return res;
        })
    )
  );
});
