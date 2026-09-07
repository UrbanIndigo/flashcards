/**
 * Offline support.
 *
 * Everything here is static, so the whole app is precached on install and
 * then served cache-first — once you have opened it on the plane, it keeps
 * working. Each cached response is refreshed in the background afterwards
 * (stale-while-revalidate), so edits reach the phone on the next load
 * without anyone having to remember to bump a version number.
 */

const CACHE = 'conjugaison-v1';

const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'js/app.js',
  'js/answer.js',
  'js/conjugator.js',
  'js/scheduler.js',
  'js/verbs.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // One bad URL would reject addAll and leave nothing cached, so each
      // asset is added on its own.
      .then((cache) => Promise.allSettled(ASSETS.map((asset) => cache.add(asset))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });

    const network = fetch(request)
      .then((response) => {
        if (response && response.ok) cache.put(request, response.clone());
        return response;
      })
      .catch(() => null);

    if (cached) return cached;

    const fresh = await network;
    if (fresh) return fresh;

    // Offline and never cached: a navigation still gets the app shell, which
    // is enough to run, because the data lives in the bundle.
    if (request.mode === 'navigate') {
      const shell = await cache.match('index.html') ?? await cache.match('./');
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  })());
});
