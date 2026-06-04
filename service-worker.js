// Service Worker minimale — Il Buongustaio
// Cache shell della pagina per uso offline
const CACHE = 'buongustaio-v2';
const ASSETS = [
  './',
  './index.html',
  './storia.html',
  './faq.html',
  './allergeni.html',
  './catering.html',
  './logo.jpg',
  './manifest.json',
  './assets/foto/banco-famiglia.jpg'
];

// Install: precache assets shell
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(ASSETS).catch(function(){ /* tollerante */ });
    })
  );
  self.skipWaiting();
});

// Activate: pulisci cache vecchie
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback cache
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(resp){
      // Cache solo richieste interne (same origin)
      if (resp && resp.status === 200 && e.request.url.startsWith(self.location.origin)) {
        var copy = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      }
      return resp;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
