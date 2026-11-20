// Service worker: makes Engineering Academy installable, opens it instantly,
// and keeps it usable without a connection.
//
// App shell (HTML, JS, CSS, icons): served from the phone's cache first, so the
// app opens without waiting for the network. VERSION is a hash of all these
// files (scripts/sw-version.js); a new deployment changes it, the browser
// installs the new set in the background, and the next launch uses it.
//
// Personal data (records, reviews, progress) and lecture videos are never
// cached. Course pages are cached network-first, so lessons you have opened can
// still be read offline.
//
// On localhost everything is network-first, so code edits show up immediately.

const VERSION = '203b44558cb3';
const CACHE = `ea-shell-${VERSION}`;
const DATA_CACHE = 'ea-data';
const DEV = ['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname);

// Every file the app needs to start. scripts/check.js verifies they exist.
const SHELL = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-32.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/css/styles.css',
  '/css/learning.css',
  '/css/courses.css',
  '/js/main.js',
  '/js/api.js',
  '/js/dom.js',
  '/js/components.js',
  '/js/schema.js',
  '/js/pwa.js',
  '/js/video.js',
  '/js/views/capture.js',
  '/js/views/courses.js',
  '/js/views/dashboard.js',
  '/js/views/detail.js',
  '/js/views/form.js',
  '/js/views/install.js',
  '/js/views/list.js',
  '/js/views/login.js',
  '/js/views/map.js',
  '/js/views/practice.js',
  '/js/views/progress.js',
  '/js/views/quiz.js',
  '/js/views/review.js',
  '/js/views/search.js',
  '/css/explain.css',
  '/css/academy-theme.css',
  '/js/explain.js',
  '/js/glossary.js',
  '/js/coach.js',
  '/js/views/curriculum.js',
  '/js/views/explainer.js',
];

self.addEventListener('install', (event) => {
  // All or nothing: a half-downloaded version is never used.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE && key !== DATA_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const SHELL_SET = new Set(SHELL);

async function cacheFirst(request, key) {
  const cached = await caches.match(key ?? request, { cacheName: CACHE });
  return cached ?? fetch(request);
}

async function networkFirst(request, { fallback, cacheName = CACHE } = {}) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = (await cache.match(request)) ?? (fallback && (await cache.match(fallback)));
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // embedded players, external videos
  if (url.pathname.startsWith('/media/')) return; // large, ranged, personal: always from the server
  if (url.pathname.startsWith('/api/')) {
    if (url.pathname.startsWith('/api/courses')) event.respondWith(networkFirst(request, { cacheName: DATA_CACHE }));
    return; // all other data stays live and private
  }
  if (DEV) {
    event.respondWith(networkFirst(request, request.mode === 'navigate' ? { fallback: '/' } : {}));
    return;
  }
  // The app is one page: every navigation opens the cached shell instantly.
  if (request.mode === 'navigate') {
    event.respondWith(cacheFirst(request, '/'));
    return;
  }
  if (SHELL_SET.has(url.pathname)) event.respondWith(cacheFirst(request));
});
