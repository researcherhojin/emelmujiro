// Background Sync utilities
import logger from './logger';

// Extend ServiceWorkerRegistration to include sync property
interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync: {
    register(tag: string): Promise<void>;
  };
}

interface SyncData {
  tag: string;
  data: any;
  timestamp: number;
}

// Type for request options
type RequestOptions = Record<string, any>;

interface SyncRequest {
  url: string;
  options: RequestOptions;
  timestamp: number;
}

// Check if background sync is supported
export function isBackgroundSyncSupported(): boolean {
  return 'serviceWorker' in navigator && 'SyncManager' in window;
}

// Register a sync event
export async function registerBackgroundSync(tag: string, data: any = null): Promise<boolean> {
  if (!isBackgroundSyncSupported()) {
    logger.info('Background sync is not supported in this browser');
    return false;
  }

  try {
    const registration = (await navigator.serviceWorker.ready) as ExtendedServiceWorkerRegistration;

    // Store data in IndexedDB if provided
    if (data) {
      await storeSyncData(tag, data);
    }

    // Register sync
    await registration.sync.register(tag);

    logger.info(`Background sync registered: ${tag}`);
    return true;
  } catch (error) {
    logger.error('Failed to register background sync:', error);
    return false;
  }
}

// Store data for background sync
async function storeSyncData(tag: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('emelmujiro-sync', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sync-data'], 'readwrite');
      const store = transaction.objectStore('sync-data');

      const putRequest = store.put({ tag, data, timestamp: Date.now() });

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('sync-data')) {
        db.createObjectStore('sync-data', { keyPath: 'tag' });
      }
    };
  });
}

// Get stored sync data
export async function getSyncData(tag: string): Promise<SyncData | undefined> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('emelmujiro-sync', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sync-data'], 'readonly');
      const store = transaction.objectStore('sync-data');

      const getRequest = store.get(tag);

      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}

// Clear sync data
export async function clearSyncData(tag: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('emelmujiro-sync', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sync-data'], 'readwrite');
      const store = transaction.objectStore('sync-data');

      const deleteRequest = store.delete(tag);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Common sync tags
export const SYNC_TAGS = {
  CONTACT_FORM: 'sync-contact-form',
  ANALYTICS: 'sync-analytics',
  USER_PREFERENCES: 'sync-user-preferences',
} as const;

export type SyncTag = (typeof SYNC_TAGS)[keyof typeof SYNC_TAGS];

// Queue failed API requests for retry
export async function queueFailedRequest(url: string, options: RequestOptions): Promise<void> {
  const syncData: SyncRequest = {
    url,
    options,
    timestamp: Date.now(),
  };

  await registerBackgroundSync('sync-failed-request', syncData);
}
