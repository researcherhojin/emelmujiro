/* eslint-disable no-restricted-globals */

// 캐시 이름 설정
const CACHE_NAME = 'emelmujiro-v1';
const urlsToCache = [
  '/emelmujiro/',
  '/emelmujiro/static/css/main.css',
  '/emelmujiro/static/js/main.js',
  '/emelmujiro/manifest.json',
  '/emelmujiro/favicon.ico',
  '/emelmujiro/logo192.png',
  '/emelmujiro/logo512.png',
];

// 동적 캐시를 위한 리소스 패턴
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.woff2?$/,
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시 열기 완료');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('이전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 네트워크 우선
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 네비게이션 요청 (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/emelmujiro/');
      })
    );
    return;
  }

  // 동적 리소스는 캐시 우선, 네트워크 폴백
  if (shouldCacheDynamically(request.url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 나머지는 네트워크 우선, 캐시 폴백
  event.respondWith(networkFirst(request));
});

// 네트워크 우선 전략
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return (
      cachedResponse ||
      new Response('오프라인 상태입니다', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }),
      })
    );
  }
}

// 캐시 우선 전략
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('리소스를 찾을 수 없습니다', {
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }),
    });
  }
}

// 동적 캐싱 여부 확인
function shouldCacheDynamically(url) {
  return DYNAMIC_CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/emelmujiro/logo192.png',
      badge: '/emelmujiro/logo192.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.id || 1,
        url: data.url || '/emelmujiro/',
      },
      actions: data.actions || [
        { action: 'view', title: '보기' },
        { action: 'close', title: '닫기' },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data.url || '/emelmujiro/';

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // 이미 열린 창이 있으면 포커스
        for (const client of clientList) {
          if (client.url.includes('/emelmujiro') && 'focus' in client) {
            return client.focus();
          }
        }
        // 열린 창이 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// 백그라운드 동기화 처리
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);

  if (event.tag === 'sync-contact-form') {
    event.waitUntil(syncContactForm());
  } else if (event.tag === 'sync-failed-request') {
    event.waitUntil(retrySyncedRequests());
  } else if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

// 연락처 폼 동기화
async function syncContactForm() {
  try {
    // IndexedDB에서 저장된 폼 데이터 가져오기
    const syncData = await getSyncDataFromDB('sync-contact-form');
    if (!syncData) return;

    const response = await fetch('/api/contact/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncData.data),
    });

    if (response.ok) {
      // 성공하면 저장된 데이터 삭제
      await clearSyncDataFromDB('sync-contact-form');

      // 사용자에게 알림
      self.registration.showNotification('문의 전송 완료', {
        body: '오프라인에서 작성한 문의가 성공적으로 전송되었습니다.',
        icon: '/emelmujiro/logo192.png',
      });
    }
  } catch (error) {
    console.error('Contact form sync failed:', error);
  }
}

// 실패한 요청 재시도
async function retrySyncedRequests() {
  try {
    const syncData = await getSyncDataFromDB('sync-failed-request');
    if (!syncData) return;

    const { url, options } = syncData.data;
    const response = await fetch(url, options);

    if (response.ok) {
      await clearSyncDataFromDB('sync-failed-request');
    }
  } catch (error) {
    console.error('Failed request retry failed:', error);
  }
}

// 분석 데이터 동기화
async function syncAnalytics() {
  try {
    const syncData = await getSyncDataFromDB('sync-analytics');
    if (!syncData) return;

    // 분석 데이터를 서버로 전송
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncData.data),
    });

    if (response.ok) {
      await clearSyncDataFromDB('sync-analytics');
    }
  } catch (error) {
    console.error('Analytics sync failed:', error);
  }
}

// IndexedDB 헬퍼 함수들
function getSyncDataFromDB(tag) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('emelmujiro-sync', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sync-data'], 'readonly');
      const store = transaction.objectStore('sync-data');
      const getRequest = store.get(tag);

      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

function clearSyncDataFromDB(tag) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('emelmujiro-sync', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sync-data'], 'readwrite');
      const store = transaction.objectStore('sync-data');
      const deleteRequest = store.delete(tag);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}
