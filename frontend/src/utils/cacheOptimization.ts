// Cache optimization utilities for better performance
interface CacheConfig {
  maxAge: number;
  maxEntries: number;
  compression?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  size?: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private usage = new Map<string, number>();
  private maxEntries: number;
  private maxAge: number;
  private usageCounter = 0;

  constructor(config: CacheConfig) {
    this.maxEntries = config.maxEntries;
    this.maxAge = config.maxAge;
  }

  set(key: string, data: T): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + this.maxAge,
      size: this.calculateSize(data),
    };

    // Remove expired entries before adding new one
    this.cleanup();

    // If at capacity, remove least recently used
    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.usage.set(key, ++this.usageCounter);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update usage
    this.usage.set(key, ++this.usageCounter);
    return entry.data;
  }

  delete(key: string): boolean {
    this.usage.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.usage.clear();
    this.usageCounter = 0;
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    entries.forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        this.delete(key);
      }
    });
  }

  private evictLRU(): void {
    let lruKey = '';
    let lruUsage = Infinity;

    const usageEntries = Array.from(this.usage.entries());
    usageEntries.forEach(([key, usage]) => {
      if (usage < lruUsage) {
        lruUsage = usage;
        lruKey = key;
      }
    });

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  private calculateSize(data: T): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1;
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      usage: this.usageCounter,
    };
  }
}

// API response cache
export const apiCache = new LRUCache<unknown>({
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxEntries: 100,
});

// Static asset cache
export const staticCache = new LRUCache<string>({
  maxAge: 30 * 60 * 1000, // 30 minutes
  maxEntries: 50,
});

// Component cache for expensive computations
export const componentCache = new LRUCache<React.ReactNode>({
  maxAge: 10 * 60 * 1000, // 10 minutes
  maxEntries: 25,
});

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
      console.warn('Storage cache set failed:', error);
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
      console.warn('Storage cache get failed:', error);
      return null;
    }
  }

  remove(key: string): boolean {
    try {
      const storage = window[this.storageType];
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Storage cache remove failed:', error);
      return false;
    }
  }

  clear(): boolean {
    try {
      const storage = window[this.storageType];
      storage.clear();
      return true;
    } catch (error) {
      console.warn('Storage cache clear failed:', error);
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
      console.warn('Storage cache cleanup failed:', error);
    }

    return cleanedCount;
  }
}

// Default storage cache instances
export const persistentCache = new StorageCache('localStorage');
export const sessionCache = new StorageCache('sessionStorage');

// Preload critical resources
export const preloadCriticalResources = () => {
  // Skip preloading in development mode as webpack handles this
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  // For GitHub Pages deployment, use the correct path
  const basePath = process.env.PUBLIC_URL || '';
  const criticalResources = [
    `${basePath}/static/css/main.css`,
    `${basePath}/static/js/main.js`,
  ];

  criticalResources.forEach((resource) => {
    // Check if resource exists before trying to preload
    fetch(resource, { method: 'HEAD' })
      .then((response) => {
        if (response.ok) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = resource.endsWith('.css') ? 'style' : 'script';
          link.href = resource;
          document.head.appendChild(link);
        }
      })
      .catch(() => {
        // Resource not found, skip preloading
        // Silently skip - resource not found
      });
  });
};

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

  // Preload critical resources
  preloadCriticalResources();

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
