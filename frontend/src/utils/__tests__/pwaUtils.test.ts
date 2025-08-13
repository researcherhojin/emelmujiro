/**
 * @jest-environment jsdom
 */

import {
  checkPWASupport,
  registerServiceWorker,
  unregisterServiceWorker,
  checkForAppUpdate,
  promptInstallPWA,
  getPWADisplayMode,
  isPWAInstalled,
  requestNotificationPermission,
  showNotification,
  checkNetworkStatus,
  enableOfflineMode,
  disableOfflineMode,
  syncOfflineData,
  cacheStaticAssets,
  clearAppCache,
  getInstallPromptEvent,
} from '../pwaUtils';

// Mock service worker
const mockServiceWorker = {
  postMessage: jest.fn(),
  state: 'activated',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const mockRegistration = {
  installing: null,
  waiting: null,
  active: mockServiceWorker,
  scope: '/',
  updatefound: null,
  update: jest.fn(),
  unregister: jest.fn(),
  showNotification: jest.fn(),
  onupdatefound: null,
};

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn().mockResolvedValue(mockRegistration),
    ready: Promise.resolve(mockRegistration),
    controller: mockServiceWorker,
    getRegistrations: jest.fn().mockResolvedValue([mockRegistration]),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
});

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
  })),
});

// Add permission property to Notification
Object.defineProperty(window.Notification, 'permission', {
  writable: true,
  value: 'default',
});

Object.defineProperty(window.Notification, 'requestPermission', {
  writable: true,
  value: jest.fn().mockResolvedValue('granted'),
});

// Mock online/offline events
let isOnline = true;
// Only define if not already defined
if (!Object.getOwnPropertyDescriptor(navigator, 'onLine')) {
  Object.defineProperty(navigator, 'onLine', {
    get: () => isOnline,
    configurable: true,
  });
}

describe('pwaUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    isOnline = true;
    window.Notification.permission = 'default';
  });

  describe('checkPWASupport', () => {
    it('should return support status', () => {
      const support = checkPWASupport();
      expect(support.serviceWorker).toBe(true);
      expect(support.notification).toBe(true);
      expect(support.push).toBe(false); // PushManager not mocked
      expect(support.sync).toBe(false); // SyncManager not mocked
      expect(support.share).toBe(false); // Share API not mocked
    });

    it('should detect when features are not supported', () => {
      const originalServiceWorker = navigator.serviceWorker;
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: undefined,
      });

      const support = checkPWASupport();
      expect(support.serviceWorker).toBe(false);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: originalServiceWorker,
      });
    });
  });

  describe('registerServiceWorker', () => {
    it('should register service worker successfully', async () => {
      const registration = await registerServiceWorker();
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/service-worker-enhanced.js');
      expect(registration).toBe(mockRegistration);
    });

    it('should handle registration failure', async () => {
      navigator.serviceWorker.register = jest
        .fn()
        .mockRejectedValue(new Error('Registration failed'));

      await expect(registerServiceWorker()).rejects.toThrow('Registration failed');
    });

    it('should use custom service worker path', async () => {
      await registerServiceWorker('/custom-sw.js');
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/custom-sw.js');
    });
  });

  describe('unregisterServiceWorker', () => {
    it('should unregister all service workers', async () => {
      const result = await unregisterServiceWorker();
      expect(navigator.serviceWorker.getRegistrations).toHaveBeenCalled();
      expect(mockRegistration.unregister).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle unregistration failure', async () => {
      mockRegistration.unregister.mockRejectedValue(new Error('Unregister failed'));

      const result = await unregisterServiceWorker();
      expect(result).toBe(false);
    });

    it('should handle no registrations', async () => {
      navigator.serviceWorker.getRegistrations = jest.fn().mockResolvedValue([]);

      const result = await unregisterServiceWorker();
      expect(result).toBe(true);
    });
  });

  describe('checkForAppUpdate', () => {
    it('should check for updates', async () => {
      await checkForAppUpdate();
      expect(mockRegistration.update).toHaveBeenCalled();
    });

    it('should handle update check failure', async () => {
      mockRegistration.update.mockRejectedValue(new Error('Update failed'));

      await expect(checkForAppUpdate()).resolves.toBeUndefined();
    });
  });

  describe('promptInstallPWA', () => {
    it('should prompt for installation when event is available', async () => {
      const mockEvent = {
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };

      // Set the install prompt event
      window.deferredPrompt = mockEvent;

      const result = await promptInstallPWA();
      expect(mockEvent.prompt).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no install event', async () => {
      window.deferredPrompt = null;

      const result = await promptInstallPWA();
      expect(result).toBe(false);
    });

    it('should handle user dismissal', async () => {
      const mockEvent = {
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      };

      window.deferredPrompt = mockEvent;

      const result = await promptInstallPWA();
      expect(result).toBe(false);
    });
  });

  describe('getPWADisplayMode', () => {
    it('should detect standalone mode', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }));

      expect(getPWADisplayMode()).toBe('standalone');
    });

    it('should detect browser mode', () => {
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }));

      expect(getPWADisplayMode()).toBe('browser');
    });
  });

  describe('isPWAInstalled', () => {
    it('should detect PWA installation', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }));

      expect(isPWAInstalled()).toBe(true);
    });

    it('should detect non-installed state', () => {
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }));

      expect(isPWAInstalled()).toBe(false);
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request notification permission', async () => {
      const result = await requestNotificationPermission();
      expect(window.Notification.requestPermission).toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should handle permission denial', async () => {
      window.Notification.requestPermission = jest.fn().mockResolvedValue('denied');

      const result = await requestNotificationPermission();
      expect(result).toBe('denied');
    });
  });

  describe('showNotification', () => {
    it('should show notification when permitted', async () => {
      window.Notification.permission = 'granted';

      await showNotification('Test Title', {
        body: 'Test Body',
        icon: '/icon.png',
      });

      expect(mockRegistration.showNotification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Body',
        icon: '/icon.png',
      });
    });

    it('should not show notification when not permitted', async () => {
      window.Notification.permission = 'denied';

      await showNotification('Test Title');

      expect(mockRegistration.showNotification).not.toHaveBeenCalled();
    });

    it('should request permission if default', async () => {
      window.Notification.permission = 'default';

      await showNotification('Test Title');

      expect(window.Notification.requestPermission).toHaveBeenCalled();
    });
  });

  describe('checkNetworkStatus', () => {
    it('should return online status', () => {
      isOnline = true;
      expect(checkNetworkStatus()).toBe(true);
    });

    it('should return offline status', () => {
      isOnline = false;
      expect(checkNetworkStatus()).toBe(false);
    });
  });

  describe('enableOfflineMode', () => {
    it('should enable offline mode', () => {
      enableOfflineMode();
      expect(localStorage.getItem('offlineMode')).toBe('true');
    });

    it('should post message to service worker', () => {
      enableOfflineMode();
      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
        type: 'ENABLE_OFFLINE_MODE',
      });
    });
  });

  describe('disableOfflineMode', () => {
    it('should disable offline mode', () => {
      localStorage.setItem('offlineMode', 'true');

      disableOfflineMode();
      expect(localStorage.getItem('offlineMode')).toBe('false');
    });

    it('should post message to service worker', () => {
      disableOfflineMode();
      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
        type: 'DISABLE_OFFLINE_MODE',
      });
    });
  });

  describe('syncOfflineData', () => {
    it('should sync offline data', async () => {
      await syncOfflineData();
      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
        type: 'SYNC_OFFLINE_DATA',
      });
    });

    it('should handle sync failure gracefully', async () => {
      mockServiceWorker.postMessage.mockImplementation(() => {
        throw new Error('Sync failed');
      });

      await expect(syncOfflineData()).resolves.toBeUndefined();
    });
  });

  describe('cacheStaticAssets', () => {
    it('should cache static assets', async () => {
      const assets = ['/index.html', '/styles.css', '/script.js'];

      await cacheStaticAssets(assets);
      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
        type: 'CACHE_ASSETS',
        payload: assets,
      });
    });

    it('should handle empty asset list', async () => {
      await cacheStaticAssets([]);
      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
        type: 'CACHE_ASSETS',
        payload: [],
      });
    });
  });

  describe('clearAppCache', () => {
    it('should clear app cache', async () => {
      await clearAppCache();
      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
        type: 'CLEAR_CACHE',
      });
    });

    it('should handle cache clear failure', async () => {
      mockServiceWorker.postMessage.mockImplementation(() => {
        throw new Error('Clear failed');
      });

      await expect(clearAppCache()).resolves.toBeUndefined();
    });
  });

  describe('getInstallPromptEvent', () => {
    it('should return install prompt event', () => {
      const mockEvent = { prompt: jest.fn() };
      window.deferredPrompt = mockEvent;

      expect(getInstallPromptEvent()).toBe(mockEvent);
    });

    it('should return null when no event', () => {
      window.deferredPrompt = null;

      expect(getInstallPromptEvent()).toBe(null);
    });
  });
});
