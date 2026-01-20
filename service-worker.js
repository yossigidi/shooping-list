{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const CACHE_NAME = 'shopping-list-v1';\
const urlsToCache = [\
  '/',\
  '/index.html',\
  '/manifest.json',\
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',\
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',\
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js',\
  'https://cdn.tailwindcss.com'\
];\
\
// Install event - cache resources\
self.addEventListener('install', (event) => \{\
  event.waitUntil(\
    caches.open(CACHE_NAME)\
      .then((cache) => \{\
        console.log('Opened cache');\
        return cache.addAll(urlsToCache);\
      \})\
      .catch((error) => \{\
        console.log('Cache failed:', error);\
      \})\
  );\
  self.skipWaiting();\
\});\
\
// Activate event - clean up old caches\
self.addEventListener('activate', (event) => \{\
  event.waitUntil(\
    caches.keys().then((cacheNames) => \{\
      return Promise.all(\
        cacheNames.map((cacheName) => \{\
          if (cacheName !== CACHE_NAME) \{\
            console.log('Deleting old cache:', cacheName);\
            return caches.delete(cacheName);\
          \}\
        \})\
      );\
    \})\
  );\
  self.clients.claim();\
\});\
\
// Fetch event - serve from cache, fallback to network\
self.addEventListener('fetch', (event) => \{\
  event.respondWith(\
    caches.match(event.request)\
      .then((response) => \{\
        // Cache hit - return response\
        if (response) \{\
          return response;\
        \}\
\
        // Clone the request\
        const fetchRequest = event.request.clone();\
\
        return fetch(fetchRequest).then((response) => \{\
          // Check if valid response\
          if (!response || response.status !== 200 || response.type !== 'basic') \{\
            return response;\
          \}\
\
          // Clone the response\
          const responseToCache = response.clone();\
\
          caches.open(CACHE_NAME)\
            .then((cache) => \{\
              cache.put(event.request, responseToCache);\
            \});\
\
          return response;\
        \}).catch(() => \{\
          // Return a custom offline page if available\
          return caches.match('/index.html');\
        \});\
      \})\
  );\
\});}