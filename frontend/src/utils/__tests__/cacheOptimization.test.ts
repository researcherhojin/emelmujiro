import { StorageCache, preloadCriticalResources } from '../cacheOptimization';

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

    it('should return null for expired items', () => {
      const cache = new StorageCache('localStorage');
      const testData = { name: 'test' };

      // Set with 0ms TTL (immediately expired)
      cache.set('test-key', testData, 0);

      // Wait a bit to ensure expiration
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

describe('preloadCriticalResources', () => {
  let originalEnv: typeof process.env;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear any existing link elements
    document.head.innerHTML = '';
    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Restore original env
    Object.keys(process.env).forEach(key => {
      delete (process.env as any)[key];
    });
    Object.assign(process.env, originalEnv);
    jest.restoreAllMocks();
  });

  it('should skip preloading in development mode', () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });
    preloadCriticalResources();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should attempt to preload resources in production', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });
    Object.defineProperty(process.env, 'PUBLIC_URL', {
      value: '/emelmujiro',
      writable: true,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });

    preloadCriticalResources();

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/static/css/main.css'), {
      method: 'HEAD',
    });
  });

  it('should handle fetch errors gracefully', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Should not throw
    expect(() => preloadCriticalResources()).not.toThrow();

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));
  });
});
