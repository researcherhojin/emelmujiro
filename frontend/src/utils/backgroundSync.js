// Background Sync utilities

// Check if background sync is supported
export function isBackgroundSyncSupported() {
  return 'serviceWorker' in navigator && 'SyncManager' in window;
}

// Register a sync event
export async function registerBackgroundSync(tag, data = null) {
  if (!isBackgroundSyncSupported()) {
    console.log('Background sync is not supported in this browser');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Store data in IndexedDB if provided
    if (data) {
      await storeSyncData(tag, data);
    }
    
    // Register sync
    await registration.sync.register(tag);
    
    console.log(`Background sync registered: ${tag}`);
    return true;
  } catch (error) {
    console.error('Failed to register background sync:', error);
    return false;
  }
}

// Store data for background sync
async function storeSyncData(tag, data) {
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
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sync-data')) {
        db.createObjectStore('sync-data', { keyPath: 'tag' });
      }
    };
  });
}

// Get stored sync data
export async function getSyncData(tag) {
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
export async function clearSyncData(tag) {
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
  USER_PREFERENCES: 'sync-user-preferences'
};

// Queue failed API requests for retry
export async function queueFailedRequest(url, options) {
  const syncData = {
    url,
    options,
    timestamp: Date.now()
  };
  
  await registerBackgroundSync('sync-failed-request', syncData);
}