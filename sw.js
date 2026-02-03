// Service Worker for Tiffin Shop Billing PWA
const CACHE_NAME = 'tiffin-shop-v1.0.0';
const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                
                // Clone the request because it can only be used once
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response because it can only be used once
                        const responseToCache = response.clone();
                        
                        // Cache the new response for future visits
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline page
                        if (event.request.url.endsWith('.html')) {
                            return caches.match('./index.html');
                        }
                        return new Response('Network error happened', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});