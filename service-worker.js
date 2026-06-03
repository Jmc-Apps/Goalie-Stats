const CACHE_NAME = 'hockey-goalie-stats-v3-18-svg-backgrounds';
const FILES_TO_CACHE = [
  './','./index.html','./goalie_stats_app_v3_18.html','./manifest.webmanifest','./manifest.json','./service-worker.js',
  './assets/title-logo.png','./assets/home-logo.png','./assets/d.svg','./assets/box.svg',
  './icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./icons/favicon-32.png','./icons/apple-touch-icon.png',
  './apple-touch-icon.png','./icon-192.png','./icon-512.png','./favicon-32.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
