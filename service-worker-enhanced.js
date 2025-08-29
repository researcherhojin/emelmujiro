/* eslint-disable no-restricted-globals */

// Advanced Service Worker with enhanced PWA features
const CACHE_VERSION = 'v4';
const CACHE_NAME = `emelmujiro-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `emelmujiro-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `emelmujiro-images-${CACHE_VERSION}`;
const API_CACHE_NAME = `emelmujiro-api-${CACHE_VERSION}`;
const BLOG_CACHE_NAME = `emelmujiro-blog-${CACHE_VERSION}`;

// Essential URLs to cache immediately (App Shell)
const urlsToCache = [
  '/emelmujiro/',
  '/emelmujiro/index.html',
  '/emelmujiro/manifest.json',
  '/emelmujiro/favicon.ico',
  '/emelmujiro/logo192.png',
  '/emelmujiro/logo512.png',
  '/emelmujiro/offline.html',
  // Critical CSS and JS will be added dynamically
];

// Resource patterns for dynamic caching
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\.woff2?$/,
  /\.ttf$/,
  /\/assets\//,  // Vite uses /assets/ instead of /static/
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
  /\/api\/contact\/$/,
  /\/api\/analytics\/$/,
];

// Blog post patterns for specific caching
const BLOG_CACHE_PATTERNS = [
  /\/api\/blog-posts\/$/,
  /\/api\/blog-posts\/\d+\/$/,
  /\/blog\/posts\/.+\.json$/,
];

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 100;
const MAX_IMAGE_CACHE_SIZE = 50;
const MAX_API_CACHE_SIZE = 30;
const MAX_BLOG_CACHE_SIZE = 20;

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  api: 5 * 60 * 1000, // 5 minutes
  blog: 60 * 60 * 1000, // 1 hour
  dynamic: 7 * 24 * 60 * 60 * 1000, // 7 days
  images: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Network status tracking
let isOnline = navigator.onLine;
let lastSyncTime = Date.now();

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching essential resources');
        // Cache each URL individually to handle failures gracefully
        return Promise.all(
          urlsToCache.map((url) => {
            return cache.add(url).catch((error) => {
              console.warn(`[Service Worker] Failed to cache ${url}:`, error);
            });
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== BLOG_CACHE_NAME
            ) {
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
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin && !isAllowedCrossOrigin(url)) {
    return;
  }

  // Handle blog posts requests
  if (isBlogRequest(url)) {
    event.respondWith(handleBlogRequest(request));
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

// Handle blog requests with cache-first strategy for better offline reading
async function handleBlogRequest(request) {
  const cache = await caches.open(BLOG_CACHE_NAME);

  // Try cache first for blog posts
  const cachedResponse = await cache.match(request);
  if (cachedResponse && !isExpired(cachedResponse, CACHE_EXPIRATION.blog)) {
    // Update in background if online
    if (isOnline) {
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
        })
        .catch(() => {}); // Ignore background update errors
    }
    return cachedResponse;
  }

  try {
    // Fetch from network
    const response = await fetch(request);

    // Cache the response if successful
    if (response && response.status === 200) {
      cache.put(request, response.clone());
      limitCacheSize(BLOG_CACHE_NAME, MAX_BLOG_CACHE_SIZE);
    }

    return response;
  } catch (error) {
    // Return cached version if available, even if expired
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline blog response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This blog post is not available offline',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);

  try {
    // Try network first
    const response = await fetch(request);

    // Clone the response before caching
    if (response && response.status === 200) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
      limitCacheSize(API_CACHE_NAME, MAX_API_CACHE_SIZE);
    }

    return response;
  } catch (error) {
    // If network fails, try cache
    console.log(
      '[Service Worker] Network failed, trying cache for:',
      request.url
    );
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline API response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This content is not available offline',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
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
    if (
      response &&
      response.status === 200 &&
      shouldCacheDynamically(request.url)
    ) {
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
self.addEventListener('sync', (event) => {
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
          body: JSON.stringify(form),
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
            requireInteraction: false,
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

// Enhanced push notification handler with different types
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.error('[Service Worker] Failed to parse push data:', error);
      data = { body: event.data.text() };
    }
  }

  // Different notification types
  const notificationType = data.type || 'general';
  const options = createNotificationOptions(data, notificationType);

  event.waitUntil(
    self.registration
      .showNotification(options.title, options)
      .then(() => {
        // Update app badge if supported
        if ('setAppBadge' in navigator) {
          return navigator.setAppBadge(data.badgeCount || 1);
        }
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to show notification:', error);
      })
  );
});

// Create notification options based on type
function createNotificationOptions(data, type) {
  const baseOptions = {
    icon: '/emelmujiro/logo192.png',
    badge: '/emelmujiro/logo192.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
    data: { ...data.data, type },
  };

  switch (type) {
    case 'blog':
      return {
        ...baseOptions,
        title: data.title || '새 블로그 포스트',
        body: data.body || '새로운 글이 게시되었습니다.',
        tag: 'blog-update',
        actions: [
          {
            action: 'read',
            title: '읽기',
            icon: '/emelmujiro/logo192.png',
          },
          {
            action: 'dismiss',
            title: '닫기',
          },
        ],
        data: { ...baseOptions.data, url: data.url || '/emelmujiro/#/blog' },
      };

    case 'contact':
      return {
        ...baseOptions,
        title: data.title || '새 문의',
        body: data.body || '새로운 문의가 접수되었습니다.',
        tag: 'contact-update',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: '확인',
          },
          {
            action: 'dismiss',
            title: '닫기',
          },
        ],
        data: { ...baseOptions.data, url: data.url || '/emelmujiro/#/contact' },
      };

    case 'system':
      return {
        ...baseOptions,
        title: data.title || '시스템 알림',
        body: data.body || '중요한 시스템 업데이트가 있습니다.',
        tag: 'system-alert',
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 300],
        actions: [
          {
            action: 'view',
            title: '확인',
          },
        ],
        data: { ...baseOptions.data, url: data.url || '/emelmujiro/' },
      };

    case 'sync':
      return {
        ...baseOptions,
        title: data.title || '동기화 완료',
        body: data.body || '오프라인 데이터가 동기화되었습니다.',
        tag: 'sync-complete',
        silent: true,
        actions: [],
        data: { ...baseOptions.data, url: data.url || '/emelmujiro/' },
      };

    default:
      return {
        ...baseOptions,
        title: data.title || 'Emelmujiro',
        body: data.body || 'You have a new notification',
        tag: 'general',
        data: { ...baseOptions.data, url: data.url || '/emelmujiro/' },
      };
  }
}

// Enhanced notification click handler with action support
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked', event.action);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Handle different actions
  if (action === 'dismiss') {
    notification.close();
    return;
  }

  notification.close();

  // Clear app badge if supported
  if ('clearAppBadge' in navigator) {
    navigator.clearAppBadge();
  }

  // Determine URL based on action and notification data
  let urlToOpen = data.url || '/emelmujiro/';

  if (action === 'read' && data.type === 'blog') {
    urlToOpen = data.blogUrl || '/emelmujiro/#/blog';
  } else if (action === 'view' && data.type === 'contact') {
    urlToOpen = '/emelmujiro/#/contact';
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window/tab open with the same origin
        const existingClient = windowClients.find((client) => {
          const clientUrl = new URL(client.url);
          const targetUrl = new URL(urlToOpen, self.location.origin);
          return clientUrl.origin === targetUrl.origin;
        });

        if (existingClient) {
          // Navigate existing client to the target URL and focus
          existingClient.navigate(urlToOpen);
          return existingClient.focus();
        } else {
          // Open new window if not found
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        }
      })
      .catch((error) => {
        console.error(
          '[Service Worker] Failed to handle notification click:',
          error
        );
      })
  );
});

// Helper functions
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isBlogRequest(url) {
  return BLOG_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isImageRequest(url) {
  return IMAGE_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isAllowedCrossOrigin(url) {
  return DYNAMIC_CACHE_PATTERNS.some((pattern) => pattern.test(url.href));
}

function shouldCacheDynamically(url) {
  return DYNAMIC_CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

// Check if cached response is expired
function isExpired(response, maxAge) {
  if (!response) return true;

  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;

  const responseTime = new Date(dateHeader).getTime();
  const now = Date.now();

  return now - responseTime > maxAge;
}

async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map((key) => cache.delete(key)));
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

// Network status change handling
self.addEventListener('online', () => {
  console.log('[Service Worker] Network status: online');
  isOnline = true;

  // Notify all clients about network status change
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'NETWORK_STATUS', online: true });
    });
  });

  // Try to sync pending requests when coming back online
  triggerBackgroundSync();
});

self.addEventListener('offline', () => {
  console.log('[Service Worker] Network status: offline');
  isOnline = false;

  // Notify all clients about network status change
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'NETWORK_STATUS', online: false });
    });
  });
});

// Trigger background sync when network is available
async function triggerBackgroundSync() {
  try {
    if ('sync' in self.registration) {
      await self.registration.sync.register('periodic-sync');
    }
  } catch (error) {
    console.error(
      '[Service Worker] Failed to register background sync:',
      error
    );
  }
}

// Enhanced message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(data.urls))
      );
      break;

    case 'PRELOAD_BLOG_POSTS':
      event.waitUntil(preloadBlogPosts(data.posts));
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(clearSpecificCache(data.cacheName));
      break;

    case 'GET_CACHE_STATUS':
      event.waitUntil(
        getCacheStatus().then((status) => {
          event.ports[0].postMessage(status);
        })
      );
      break;

    case 'REGISTER_PERIODIC_SYNC':
      event.waitUntil(
        self.registration.sync.register('periodic-content-sync').catch(() => {
          // Fallback to manual sync if background sync is not supported
          console.log(
            '[Service Worker] Background sync not supported, using manual sync'
          );
        })
      );
      break;

    default:
      console.log('[Service Worker] Unknown message type:', type);
  }
});

// Preload blog posts for offline reading
async function preloadBlogPosts(posts) {
  if (!Array.isArray(posts)) return;

  const cache = await caches.open(BLOG_CACHE_NAME);

  for (const post of posts) {
    try {
      if (post.url) {
        const response = await fetch(post.url);
        if (response.ok) {
          await cache.put(post.url, response);
        }
      }
    } catch (error) {
      console.warn('[Service Worker] Failed to preload post:', post.url, error);
    }
  }
}

// Clear specific cache
async function clearSpecificCache(cacheName) {
  if (cacheName && typeof cacheName === 'string') {
    const deleted = await caches.delete(cacheName);
    console.log(`[Service Worker] Cache ${cacheName} deleted:`, deleted);
  }
}

// Get cache status for debugging
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = {
      count: keys.length,
      urls: keys.map((request) => request.url).slice(0, 5), // First 5 URLs for debugging
    };
  }

  return {
    caches: status,
    isOnline,
    lastSyncTime,
    version: CACHE_VERSION,
  };
}

// Periodic content sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'periodic-content-sync') {
    event.waitUntil(performPeriodicSync());
  } else if (event.tag === 'sync-contact-form') {
    event.waitUntil(syncContactForms());
  } else if (event.tag === 'sync-failed-request') {
    event.waitUntil(syncFailedRequests());
  }
});

// Perform periodic content updates
async function performPeriodicSync() {
  try {
    console.log('[Service Worker] Performing periodic sync...');

    // Update blog posts cache
    const blogResponse = await fetch('/api/blog-posts/');
    if (blogResponse.ok) {
      const cache = await caches.open(BLOG_CACHE_NAME);
      cache.put('/api/blog-posts/', blogResponse);
    }

    // Update other critical content
    const criticalUrls = ['/emelmujiro/', '/emelmujiro/manifest.json'];
    const cache = await caches.open(CACHE_NAME);

    for (const url of criticalUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          cache.put(url, response);
        }
      } catch (error) {
        console.warn('[Service Worker] Failed to update:', url, error);
      }
    }

    lastSyncTime = Date.now();
    console.log('[Service Worker] Periodic sync completed');
  } catch (error) {
    console.error('[Service Worker] Periodic sync failed:', error);
  }
}

// Sync failed requests
async function syncFailedRequests() {
  try {
    const syncData = await getSyncDataFromIDB('sync-failed-request');

    if (syncData && syncData.data) {
      const { url, options } = syncData.data;

      const response = await fetch(url, options);
      if (response.ok) {
        // Remove from sync queue on success
        await clearSyncDataFromIDB('sync-failed-request');

        // Show success notification
        self.registration.showNotification('요청 완료', {
          body: '오프라인에서 실패한 요청이 성공적으로 처리되었습니다.',
          icon: '/emelmujiro/logo192.png',
          tag: 'sync-success',
          silent: true,
        });
      }
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync requests:', error);
  }
}

// Helper functions for IndexedDB sync data (simplified version)
async function getSyncDataFromIDB(tag) {
  // This is a simplified version - in a real app you'd use IndexedDB properly
  const cache = await caches.open('sync-data');
  const request = new Request(`/sync-data/${tag}`);
  const response = await cache.match(request);

  if (response) {
    return await response.json();
  }
  return null;
}

async function clearSyncDataFromIDB(tag) {
  const cache = await caches.open('sync-data');
  const request = new Request(`/sync-data/${tag}`);
  await cache.delete(request);
}
