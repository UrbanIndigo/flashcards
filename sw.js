/**
 * Offline support.
 *
 * The whole app is precached under a cache named for the build, and served
 * from that one cache. That matters more than it sounds: the previous
 * version refreshed each file independently, so a page could load a new
 * index.html against a stale app.js and quietly lose half a feature. Every
 * asset in a page load now comes from a single version, or none of it does.
 *
 * A new build installs alongside the old one and waits, so a page that is
 * already open keeps the version it started with. The page offers a refresh
 * when the new one is ready.
 */

// Replaced with the commit SHA at deploy time; stays literal for local work.
const VERSION = '__BUILD__';
const CACHE = `conjugaison-${VERSION}`;

const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'js/app.js',
  'js/answer.js',
  'js/conjugator.js',
  'js/daily.js',
  'js/recap.js',
  'js/rules.js',
  'js/scheduler.js',
  'js/sentences.js',
  'js/verbs.js',
  'js/subjects/index.js',
  'js/subjects/french.js',
  'js/subjects/flags.js',
  'js/subjects/flags-data.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(
    // `reload` skips the HTTP cache, so a build cannot be precached from a
    // stale copy. addAll is all-or-nothing on purpose: a half-installed
    // version is exactly what this file exists to prevent.
    ASSETS.map((asset) => new Request(asset, { cache: 'reload' })),
  )));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** The page asks for the new version when the reader is ready for it. */
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      return await fetch(request);
    } catch {
      // Offline and not precached: a navigation still gets the app shell,
      // which is enough to run, because the data ships in the bundle.
      if (request.mode === 'navigate') {
        const shell = await cache.match('index.html') ?? await cache.match('./');
        if (shell) return shell;
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
