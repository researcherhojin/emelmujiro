import { StorageCache } from '../cacheOptimization';

describe('StorageCache', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('localStorage cache', () => {
    it('should set and get values from localStorage', () => {
      const cache = new StorageCache('localStorage');
      const testData = { name: 'test', value: 123 };

      cache.set('test-key', testData, 1000);
      const result = cache.get('test-key');

      expect(result).toEqual(testData);
    });

    it('should return null for expired items', async () => {
      const cache = new StorageCache('localStorage');
      const testData = { name: 'test' };

      // Set with 1ms TTL (expires very quickly)
      cache.set('test-key', testData, 1);

      // Wait 10ms to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = cache.get('test-key');
      expect(result).toBeNull();
    });

    it('should remove items', () => {
      const cache = new StorageCache('localStorage');
      cache.set('test-key', 'test-value', 1000);

      cache.remove('test-key');
      const result = cache.get('test-key');

      expect(result).toBeNull();
    });

    it('should clear all items with prefix', () => {
      const cache = new StorageCache('localStorage');
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });

    it('should handle storage quota exceeded', () => {
      const cache = new StorageCache('localStorage');
      const largeData = new Array(10000000).join('x'); // Very large string

      // Should not throw, but handle gracefully
      expect(() => {
        cache.set('large-key', largeData, 1000);
      }).not.toThrow();
    });
  });

  describe('sessionStorage cache', () => {
    it('should set and get values from sessionStorage', () => {
      const cache = new StorageCache('sessionStorage');
      const testData = { name: 'test', value: 456 };

      cache.set('test-key', testData, 1000);
      const result = cache.get('test-key');

      expect(result).toEqual(testData);
    });

    it('should handle invalid JSON gracefully', () => {
      const cache = new StorageCache('sessionStorage');

      // Manually set invalid JSON
      sessionStorage.setItem('cache_test-key', 'invalid json');

      const result = cache.get('test-key');
      expect(result).toBeNull();
    });
  });
});
