const CACHE_NAME = 'mygarage-v3';

const FILE_DA_CACHEARE = [
    '/mygarage/',
    '/mygarage/index.html',
    '/mygarage/manifest.json',
    '/mygarage/icon-192.png',
    '/mygarage/icon-512.png',
    '/mygarage/favicon-32.png'
];

// Installazione: cacha i file principali
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Cacha ogni file singolarmente — se uno manca non blocca tutto
            return Promise.allSettled(
                FILE_DA_CACHEARE.map(url =>
                    cache.add(url).catch(err => {
                        console.warn('SW: impossibile cacheare ' + url, err);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// Attivazione: elimina cache vecchie
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: prima dalla cache, poi dalla rete
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Offline fallback: restituisci la home
                return caches.match('/');
            });
        })
    );
});
