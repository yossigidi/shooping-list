const CACHE_NAME = 'listnest-v2';
const STATIC_CACHE = 'listnest-static-v2';

// Core app files
const urlsToCache = [
  '/shooping-list/',
  '/shooping-list/index.html',
  '/shooping-list/manifest.json'
];

// CDN assets to cache for faster loading
const cdnUrlsToCache = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/qrcode-generator@1.4.4/qrcode.js',
  'https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      }),
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching CDN assets');
        // Cache CDN assets but don't fail install if some fail
        return Promise.allSettled(
          cdnUrlsToCache.map(url =>
            fetch(url, { mode: 'cors' })
              .then(response => {
                if (response.ok) {
                  cache.put(url, response);
                }
              })
              .catch(() => console.log('Could not cache:', url))
          )
        );
      })
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - smart caching strategies
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip Firebase and Google APIs (real-time data)
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('firebaseio') ||
      url.hostname.includes('googleapis.com') && !url.hostname.includes('fonts')) {
    return;
  }

  // For CDN assets - Cache first, then network (faster loading)
  if (url.hostname.includes('unpkg.com') ||
      url.hostname.includes('cdn.') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // Return cached version immediately
          // Also update cache in background
          fetch(event.request).then(response => {
            if (response.ok) {
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(event.request, response);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }
        // Not in cache, fetch from network
        return fetch(event.request).then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For app files - Network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and cache the response
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          // Return cached index for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/shooping-list/index.html');
          }
        });
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'יש עדכון חדש ברשימה!',
    icon: '/shooping-list/icons/icon-192x192.png',
    badge: '/shooping-list/icons/icon-72x72.png',
    dir: 'rtl',
    lang: 'he',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('ListNest', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/shooping-list/')
  );
});
