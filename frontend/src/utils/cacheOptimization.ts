// Cache optimization utilities for better performance
import logger from './logger';

// Browser storage utilities
export class StorageCache {
  private storageType: 'localStorage' | 'sessionStorage';

  constructor(storageType: 'localStorage' | 'sessionStorage' = 'localStorage') {
    this.storageType = storageType;
  }

  set<T>(key: string, data: T, expiresIn?: number): boolean {
    try {
      const storage = window[this.storageType];
      const item = {
        data,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : null,
      };
      storage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      logger.warn('Storage cache set failed:', error);
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      const storage = window[this.storageType];
      const item = storage.getItem(key);

      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item);

      // Check if expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        storage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      logger.warn('Storage cache get failed:', error);
      return null;
    }
  }

  remove(key: string): boolean {
    try {
      const storage = window[this.storageType];
      storage.removeItem(key);
      return true;
    } catch (error) {
      logger.warn('Storage cache remove failed:', error);
      return false;
    }
  }

  clear(): boolean {
    try {
      const storage = window[this.storageType];
      storage.clear();
      return true;
    } catch (error) {
      logger.warn('Storage cache clear failed:', error);
      return false;
    }
  }

  // Clean expired entries
  cleanup(): number {
    let cleanedCount = 0;
    try {
      const storage = window[this.storageType];
      const now = Date.now();

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;

        const item = storage.getItem(key);
        if (!item) continue;

        try {
          const parsed = JSON.parse(item);
          if (parsed.expiresAt && now > parsed.expiresAt) {
            storage.removeItem(key);
            cleanedCount++;
            i--; // Adjust index since we removed an item
          }
        } catch {
          // Invalid JSON, remove it
          storage.removeItem(key);
          cleanedCount++;
          i--;
        }
      }
    } catch (error) {
      logger.warn('Storage cache cleanup failed:', error);
    }

    return cleanedCount;
  }
}

// Default storage cache instances
export const persistentCache = new StorageCache('localStorage');
export const sessionCache = new StorageCache('sessionStorage');

// Performance observer for monitoring cache efficiency
export const observeCachePerformance = () => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          // Track cache hit/miss information
          if (
            resourceEntry.transferSize === 0 &&
            resourceEntry.decodedBodySize > 0
          ) {
            // Cache hit detected for resource
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    // Cleanup after 30 seconds
    setTimeout(() => observer.disconnect(), 30000);
  }
};

// Initialize cache optimization on app start
export const initializeCacheOptimization = () => {
  // Cleanup expired storage cache entries
  persistentCache.cleanup();
  sessionCache.cleanup();

  // Start performance monitoring
  if (process.env.NODE_ENV === 'development') {
    observeCachePerformance();
  }

  // Set up periodic cleanup
  setInterval(
    () => {
      persistentCache.cleanup();
      sessionCache.cleanup();
    },
    5 * 60 * 1000
  ); // Every 5 minutes
};
