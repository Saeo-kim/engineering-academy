// Service worker: makes Engineering Academy installable and keeps the app shell
// and course content available when the phone has no connection.
//
// Strategy is network-first everywhere, so a running server always serves the
// newest version and the cache is only a fallback. Personal data (records,
// reviews, progress) and lecture videos are never cached; course pages are,
// so lessons you have opened can still be read offline.

const CACHE = 'ea-shell-v1';

// Every file the app needs to start. scripts/check.js verifies they exist.
const SHELL = [
  '/',
  '/index.html',
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
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // One missing file must not stop installation, so add them one by one.
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, { fallback } = {}) {
  const cache = await caches.open(CACHE);
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
    if (url.pathname.startsWith('/api/courses')) event.respondWith(networkFirst(request));
    return; // all other data stays live and private
  }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, { fallback: '/' }));
    return;
  }
  event.respondWith(networkFirst(request));
});
