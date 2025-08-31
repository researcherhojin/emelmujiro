/**
 * @jest-environment jsdom
 */

import { vi } from 'vitest';
import {
  isBackgroundSyncSupported,
  registerBackgroundSync,
  getSyncData,
  clearSyncData,
  queueFailedRequest,
  SYNC_TAGS,
} from '../backgroundSync';

// Mock logger
vi.mock('../logger', () => ({
  __esModule: true,
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import logger from '../logger';
const mockLogger = logger as any;

// Mock IndexedDB
const mockObjectStore = {
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

const mockTransaction = {
  objectStore: vi.fn().mockReturnValue(mockObjectStore),
};

const mockDatabase = {
  transaction: vi.fn().mockReturnValue(mockTransaction),
  objectStoreNames: {
    contains: vi.fn(),
  },
  createObjectStore: vi.fn(),
};

const mockRequest = {
  result: mockDatabase,
  error: null as Error | null,
  onsuccess: null as (() => void) | null,
  onerror: null as (() => void) | null,
  onupgradeneeded: null as ((event?: unknown) => void) | null,
};

const mockPutRequest = {
  onsuccess: null as (() => void) | null,
  onerror: null as (() => void) | null,
  error: null,
};

const mockGetRequest = {
  result: null as unknown,
  onsuccess: null as (() => void) | null,
  onerror: null as (() => void) | null,
  error: null as Error | null,
};

const mockDeleteRequest = {
  onsuccess: null as (() => void) | null,
  onerror: null as (() => void) | null,
  error: null as Error | null,
};

// Mock service worker registration
const mockRegistration = {
  sync: {
    register: vi.fn(),
  },
};

// Mock navigator
const mockNavigator = {
  serviceWorker: {
    ready: Promise.resolve(mockRegistration),
  },
};

describe('backgroundSync', () => {
  const originalNavigator = global.navigator;
  const originalWindow = global.window;
  const originalIndexedDB = global.indexedDB;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup navigator mock
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    // Setup window mock
    Object.defineProperty(global, 'window', {
      value: {
        ...originalWindow,
        SyncManager: class MockSyncManager {},
      },
      writable: true,
    });

    // Setup IndexedDB mock
    Object.defineProperty(global, 'indexedDB', {
      value: {
        open: vi.fn().mockReturnValue(mockRequest),
      },
      writable: true,
    });

    // Reset mock request to return mockDatabase
    mockRequest.result = mockDatabase;
    mockRequest.error = null;

    // Reset mock states
    mockDatabase.transaction.mockReturnValue(mockTransaction);
    mockDatabase.objectStoreNames.contains.mockReturnValue(false);
    mockTransaction.objectStore.mockReturnValue(mockObjectStore);
    mockObjectStore.put.mockReturnValue(mockPutRequest);
    mockObjectStore.get.mockReturnValue(mockGetRequest);
    mockObjectStore.delete.mockReturnValue(mockDeleteRequest);

    mockRegistration.sync.register.mockResolvedValue(undefined);
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
    });
    Object.defineProperty(global, 'indexedDB', {
      value: originalIndexedDB,
      writable: true,
    });
  });

  describe('isBackgroundSyncSupported', () => {
    it('should return true when both serviceWorker and SyncManager are supported', () => {
      expect(isBackgroundSyncSupported()).toBe(true);
    });

    it('should return false when serviceWorker is not supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      expect(isBackgroundSyncSupported()).toBe(false);
    });

    it('should return false when SyncManager is not supported', () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      expect(isBackgroundSyncSupported()).toBe(false);
    });
  });

  describe('registerBackgroundSync', () => {
    it('should register sync successfully without data', async () => {
      const result = await registerBackgroundSync('test-sync');

      expect(mockRegistration.sync.register).toHaveBeenCalledWith('test-sync');
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Background sync registered: test-sync'
      );
    });

    it.skip('should register sync successfully with data', async () => {
      const testData = { message: 'test data' };

      // Mock successful IndexedDB operations
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      setTimeout(() => {
        mockPutRequest.onsuccess?.();
      }, 0);

      const result = await registerBackgroundSync('test-sync', testData);

      expect(global.indexedDB.open).toHaveBeenCalledWith('emelmujiro-sync', 1);
      expect(result).toBe(true);
    });

    it('should return false when background sync is not supported', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      const result = await registerBackgroundSync('test-sync');

      expect(result).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Background sync is not supported in this browser'
      );
    });

    it('should handle sync registration errors', async () => {
      const error = new Error('Sync registration failed');
      mockRegistration.sync.register.mockRejectedValue(error);

      const result = await registerBackgroundSync('test-sync');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to register background sync:',
        error
      );
    });

    it.skip('should handle IndexedDB storage errors', async () => {
      const testData = { message: 'test data' };

      // Mock IndexedDB error
      setTimeout(() => {
        mockRequest.onerror?.();
      }, 0);

      const result = await registerBackgroundSync('test-sync', testData);

      expect(result).toBe(false);
    });
  });

  describe('getSyncData', () => {
    it.skip('should retrieve sync data successfully', async () => {
      const testData = {
        tag: 'test-sync',
        data: { message: 'test data' },
        timestamp: Date.now(),
      };

      // Mock successful IndexedDB operations
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      setTimeout(() => {
        mockGetRequest.result = testData;
        mockGetRequest.onsuccess?.();
      }, 0);

      const result = await getSyncData('test-sync');

      expect(global.indexedDB.open).toHaveBeenCalledWith('emelmujiro-sync', 1);
      expect(mockObjectStore.get).toHaveBeenCalledWith('test-sync');
      expect(result).toEqual(testData);
    });

    it.skip('should handle database open errors', async () => {
      // Mock IndexedDB error
      setTimeout(() => {
        mockRequest.error = new Error('Database error');
        mockRequest.onerror?.();
      }, 0);

      await expect(getSyncData('test-sync')).rejects.toThrow('Database error');
    });

    it.skip('should handle get operation errors', async () => {
      // Mock successful database open but failed get
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      setTimeout(() => {
        mockGetRequest.error = new Error('Get operation failed');
        mockGetRequest.onerror?.();
      }, 0);

      await expect(getSyncData('test-sync')).rejects.toThrow(
        'Get operation failed'
      );
    });

    it.skip('should return undefined when data not found', async () => {
      // Mock successful operations but no data
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      setTimeout(() => {
        mockGetRequest.result = undefined;
        mockGetRequest.onsuccess?.();
      }, 0);

      const result = await getSyncData('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('clearSyncData', () => {
    it.skip('should clear sync data successfully', async () => {
      // Mock successful IndexedDB operations
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      setTimeout(() => {
        mockDeleteRequest.onsuccess?.();
      }, 0);

      await clearSyncData('test-sync');

      expect(global.indexedDB.open).toHaveBeenCalledWith('emelmujiro-sync', 1);
      expect(mockObjectStore.delete).toHaveBeenCalledWith('test-sync');
    });

    it.skip('should handle database open errors', async () => {
      // Mock IndexedDB error
      setTimeout(() => {
        mockRequest.error = new Error('Database error');
        mockRequest.onerror?.();
      }, 0);

      await expect(clearSyncData('test-sync')).rejects.toThrow(
        'Database error'
      );
    });

    it.skip('should handle delete operation errors', async () => {
      // Mock successful database open but failed delete
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      setTimeout(() => {
        mockDeleteRequest.error = new Error('Delete operation failed');
        mockDeleteRequest.onerror?.();
      }, 0);

      await expect(clearSyncData('test-sync')).rejects.toThrow(
        'Delete operation failed'
      );
    });
  });

  describe('queueFailedRequest', () => {
    it('should queue failed request with correct data structure', async () => {
      const url = '/api/test';
      const options = {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      };

      // Mock the registerBackgroundSync call
      const originalDateNow = Date.now;
      const mockTimestamp = 1234567890;
      Date.now = vi.fn().mockReturnValue(mockTimestamp);

      // Mock successful IndexedDB operations
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      setTimeout(() => {
        mockPutRequest.onsuccess?.();
      }, 0);

      await queueFailedRequest(url, options);

      expect(mockRegistration.sync.register).toHaveBeenCalledWith(
        'sync-failed-request'
      );

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('SYNC_TAGS', () => {
    it('should have correct sync tag constants', () => {
      expect(SYNC_TAGS.CONTACT_FORM).toBe('sync-contact-form');
      expect(SYNC_TAGS.ANALYTICS).toBe('sync-analytics');
      expect(SYNC_TAGS.USER_PREFERENCES).toBe('sync-user-preferences');
    });
  });

  describe('IndexedDB database upgrade', () => {
    it.skip('should create object store on database upgrade', async () => {
      mockDatabase.objectStoreNames.contains.mockReturnValue(false);

      // Mock database upgrade needed
      setTimeout(() => {
        const upgradeEvent = { target: mockRequest };
        mockRequest.onupgradeneeded?.(upgradeEvent);
        mockRequest.onsuccess?.();
      }, 0);

      setTimeout(() => {
        mockPutRequest.onsuccess?.();
      }, 0);

      await registerBackgroundSync('test-sync', { data: 'test' });

      expect(mockDatabase.createObjectStore).toHaveBeenCalledWith('sync-data', {
        keyPath: 'tag',
      });
    });

    it.skip('should not create object store if it already exists', async () => {
      mockDatabase.objectStoreNames.contains.mockReturnValue(true);

      // Mock database upgrade needed
      setTimeout(() => {
        const upgradeEvent = { target: mockRequest };
        mockRequest.onupgradeneeded?.(upgradeEvent);
        mockRequest.onsuccess?.();
      }, 0);

      setTimeout(() => {
        mockPutRequest.onsuccess?.();
      }, 0);

      await registerBackgroundSync('test-sync', { data: 'test' });

      expect(mockDatabase.createObjectStore).not.toHaveBeenCalled();
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple sync registrations', async () => {
      const promise1 = registerBackgroundSync('sync-1');
      const promise2 = registerBackgroundSync('sync-2');
      const promise3 = registerBackgroundSync('sync-3');

      const results = await Promise.all([promise1, promise2, promise3]);

      expect(results).toEqual([true, true, true]);
      expect(mockRegistration.sync.register).toHaveBeenCalledTimes(3);
      expect(mockRegistration.sync.register).toHaveBeenCalledWith('sync-1');
      expect(mockRegistration.sync.register).toHaveBeenCalledWith('sync-2');
      expect(mockRegistration.sync.register).toHaveBeenCalledWith('sync-3');
    });

    it.skip('should handle sync with complex data objects', async () => {
      const complexData = {
        user: { id: 1, name: 'Test User' },
        form: {
          fields: ['name', 'email', 'message'],
          values: { name: 'John', email: 'john@example.com', message: 'Hello' },
        },
        meta: {
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'high',
        },
      };

      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      setTimeout(() => {
        mockPutRequest.onsuccess?.();
      }, 0);

      const result = await registerBackgroundSync('complex-sync', complexData);

      expect(result).toBe(true);
      expect(mockObjectStore.put).toHaveBeenCalledWith({
        tag: 'complex-sync',
        data: complexData,
        timestamp: expect.any(Number),
      });
    });
  });
});
