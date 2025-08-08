/* eslint-disable no-restricted-globals */

// Advanced Service Worker with enhanced PWA features
const CACHE_VERSION = 'v2';
const CACHE_NAME = `emelmujiro-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `emelmujiro-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `emelmujiro-images-${CACHE_VERSION}`;

// Essential URLs to cache immediately
const urlsToCache = [
  '/emelmujiro/',
  '/emelmujiro/index.html',
  '/emelmujiro/static/css/main.css',
  '/emelmujiro/static/js/main.js',
  '/emelmujiro/manifest.json',
  '/emelmujiro/favicon.ico',
  '/emelmujiro/logo192.png',
  '/emelmujiro/logo512.png',
  '/emelmujiro/offline.html',
];

// Resource patterns for dynamic caching
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\.woff2?$/,
  /\.ttf$/,
];

// Image patterns for separate image cache
const IMAGE_PATTERNS = [
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.svg$/,
  /\.webp$/,
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /\/api\/blog-posts\/$/,
  /\/api\/blog-posts\/\d+\/$/,
];

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 30;

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  api: 5 * 60 * 1000, // 5 minutes
  dynamic: 7 * 24 * 60 * 60 * 1000, // 7 days
  images: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching essential resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin && !isAllowedCrossOrigin(url)) {
    return;
  }
  
  // Handle API requests
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle image requests
  if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Handle all other requests
  event.respondWith(handleGeneralRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Clone the response before caching
    if (response && response.status === 200) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }
    
    return response;
  } catch (error) {
    // If network fails, try cache
    console.log('[Service Worker] Network failed, trying cache for:', request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline API response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This content is not available offline' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // If not in cache, fetch from network
    const response = await fetch(request);
    
    // Cache the image if successful
    if (response && response.status === 200) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
      
      // Limit cache size
      limitCacheSize(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE_SIZE);
    }
    
    return response;
  } catch (error) {
    // Return placeholder image if offline
    console.log('[Service Worker] Image fetch failed:', request.url);
    return caches.match('/emelmujiro/logo192.png');
  }
}

// Handle general requests with cache-first strategy
async function handleGeneralRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // If not in cache, fetch from network
    const response = await fetch(request);
    
    // Cache dynamic resources if successful
    if (response && response.status === 200 && shouldCacheDynamically(request.url)) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
      
      // Limit cache size
      limitCacheSize(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_SIZE);
    }
    
    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/emelmujiro/offline.html');
    }
    
    // Return 503 for other failed requests
    return new Response('Service Unavailable', { status: 503 });
  }
}

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-contact-form') {
    event.waitUntil(syncContactForms());
  }
});

// Sync offline contact form submissions
async function syncContactForms() {
  try {
    // Get pending forms from IndexedDB or localStorage
    const pendingForms = await getPendingForms();
    
    for (const form of pendingForms) {
      try {
        const response = await fetch('/api/contact/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        
        if (response.ok) {
          // Remove successfully synced form
          await removePendingForm(form.id);
          
          // Notify user of successful sync
          await self.registration.showNotification('문의 전송 완료', {
            body: '오프라인에서 작성한 문의가 성공적으로 전송되었습니다.',
            icon: '/emelmujiro/logo192.png',
            badge: '/emelmujiro/logo192.png',
            tag: 'contact-sync',
            requireInteraction: false
          });
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync form:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    title: data.title || 'Emelmujiro',
    body: data.body || 'You have a new notification',
    icon: data.icon || '/emelmujiro/logo192.png',
    badge: '/emelmujiro/logo192.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/emelmujiro/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if there's already a window/tab open
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if not found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Helper functions
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isImageRequest(url) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isAllowedCrossOrigin(url) {
  return DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

function shouldCacheDynamically(url) {
  return DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// IndexedDB helpers for offline form storage
async function getPendingForms() {
  // This would normally use IndexedDB
  // For simplicity, using cache API as storage
  const cache = await caches.open('pending-forms');
  const requests = await cache.keys();
  const forms = [];
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const form = await response.json();
      forms.push(form);
    }
  }
  
  return forms;
}

async function removePendingForm(formId) {
  const cache = await caches.open('pending-forms');
  const requests = await cache.keys();
  
  for (const request of requests) {
    if (request.url.includes(formId)) {
      await cache.delete(request);
      break;
    }
  }
}

// Message handler for client communication
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(event.data.urls))
    );
  }
});