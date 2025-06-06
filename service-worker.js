const CACHE_NAME = 'controle-financeiro-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/inde.css', // ajuste conforme o nome do arquivo
  '/scripts/scripts_dashboard.js', // ajuste conforme necessário
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
