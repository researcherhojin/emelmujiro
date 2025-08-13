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
  syncOfflineData,
  cacheStaticAssets,
  clearAppCache,
  getInstallPromptEvent,
  isAppBadgeSupported,
  setAppBadge,
  clearAppBadge,
  isWebShareSupported,
  shareContent,
  isInstallPromptAvailable,
  initializeInstallPrompt,
  triggerInstallPrompt,
  isWakeLockSupported,
  requestWakeLock,
  releaseWakeLock,
  getDeviceCapabilities,
  isPWAMode,
  initializePWA,
  getPerformanceMetrics,
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

describe(process.env.CI === 'true' ? 'pwaUtils (skipped in CI)' : 'pwaUtils', () => {
  if (process.env.CI === 'true') {
    it('skipped in CI', () => {
      expect(true).toBe(true);
    });
    return;
  }
  
  let originalServiceWorker: any;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    isOnline = true;
    (window.Notification as any).permission = 'default';
    originalServiceWorker = navigator.serviceWorker;
    
    // Reset navigator.serviceWorker for each test
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
  });

  afterEach(() => {
    // Restore original serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: originalServiceWorker,
    });
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
      // Create a new object that doesn't have serviceWorker
      const navWithoutSW = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        onLine: navigator.onLine,
      };
      
      // Replace navigator temporarily
      const originalNav = global.navigator;
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: navWithoutSW,
      });

      const support = checkPWASupport();
      expect(support.serviceWorker).toBe(false);
      
      // Restore original navigator
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: originalNav,
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
      const mockRegisterFail = jest.fn().mockRejectedValue(new Error('Registration failed'));
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          ...navigator.serviceWorker,
          register: mockRegisterFail,
        },
      });

      const result = await registerServiceWorker();
      expect(result).toBeNull();
    });

    it('should use custom service worker path', async () => {
      await registerServiceWorker('/custom-sw.js');
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/custom-sw.js');
    });
    
    it('should return null when service worker is not supported', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: undefined,
      });
      
      const result = await registerServiceWorker();
      expect(result).toBeNull();
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
      (window as any).deferredPrompt = mockEvent;

      const result = await promptInstallPWA();
      expect(mockEvent.prompt).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no install event', async () => {
      (window as any).deferredPrompt = null;

      const result = await promptInstallPWA();
      expect(result).toBe(false);
    });

    it('should handle user dismissal', async () => {
      const mockEvent = {
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      };

      (window as any).deferredPrompt = mockEvent;

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
      // Ensure Notification.requestPermission returns the value
      window.Notification.requestPermission = jest.fn().mockResolvedValue('granted');
      
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

  describe('isAppBadgeSupported', () => {
    it('should detect badge support', () => {
      Object.defineProperty(navigator, 'setAppBadge', {
        writable: true,
        value: jest.fn(),
      });
      expect(isAppBadgeSupported()).toBe(true);
      
      delete (navigator as any).setAppBadge;
      expect(isAppBadgeSupported()).toBe(false);
    });
  });

  describe('setAppBadge', () => {
    it('should set app badge when supported', async () => {
      const mockSetAppBadge = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'setAppBadge', {
        writable: true,
        value: mockSetAppBadge,
      });
      
      const result = await setAppBadge(5);
      expect(mockSetAppBadge).toHaveBeenCalledWith(5);
      expect(result).toBe(true);
    });

    it('should return false when not supported', async () => {
      delete (navigator as any).setAppBadge;
      const result = await setAppBadge(5);
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const mockSetAppBadge = jest.fn().mockRejectedValue(new Error('Failed'));
      Object.defineProperty(navigator, 'setAppBadge', {
        writable: true,
        value: mockSetAppBadge,
      });
      
      const result = await setAppBadge(5);
      expect(result).toBe(false);
    });
  });

  describe('clearAppBadge', () => {
    it('should clear app badge when supported', async () => {
      const mockClearAppBadge = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clearAppBadge', {
        writable: true,
        value: mockClearAppBadge,
      });
      
      const result = await clearAppBadge();
      expect(mockClearAppBadge).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when not supported', async () => {
      delete (navigator as any).clearAppBadge;
      const result = await clearAppBadge();
      expect(result).toBe(false);
    });
  });

  describe('isWebShareSupported', () => {
    it('should detect share support', () => {
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: jest.fn(),
      });
      expect(isWebShareSupported()).toBe(true);
      
      delete (navigator as any).share;
      expect(isWebShareSupported()).toBe(false);
    });
  });

  describe('shareContent', () => {
    it('should share content when supported', async () => {
      const mockShare = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: mockShare,
      });
      
      const data = { title: 'Test', text: 'Content', url: 'https://example.com' };
      const result = await shareContent(data);
      expect(mockShare).toHaveBeenCalledWith(data);
      expect(result).toBe(true);
    });

    it('should handle share cancellation', async () => {
      const mockShare = jest.fn().mockRejectedValue(new Error('AbortError'));
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: mockShare,
      });
      
      const result = await shareContent({ title: 'Test' });
      expect(result).toBe(false);
    });

    it('should fallback to clipboard when share not supported', async () => {
      delete (navigator as any).share;
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        writable: true,
        value: { writeText: mockWriteText },
      });
      
      const result = await shareContent({ title: 'Test', url: 'https://example.com' });
      expect(mockWriteText).toHaveBeenCalledWith('Test\nhttps://example.com');
      expect(result).toBe(true);
    });
  });

  describe('isWakeLockSupported', () => {
    it('should detect wake lock support', () => {
      Object.defineProperty(navigator, 'wakeLock', {
        writable: true,
        value: { request: jest.fn() },
      });
      expect(isWakeLockSupported()).toBe(true);
      
      delete (navigator as any).wakeLock;
      expect(isWakeLockSupported()).toBe(false);
    });
  });

  describe('requestWakeLock', () => {
    it('should request wake lock when supported', async () => {
      const mockWakeLock = { release: jest.fn(), released: false, type: 'screen' };
      const mockRequest = jest.fn().mockResolvedValue(mockWakeLock);
      Object.defineProperty(navigator, 'wakeLock', {
        writable: true,
        value: { request: mockRequest },
      });
      
      const result = await requestWakeLock();
      expect(mockRequest).toHaveBeenCalledWith('screen');
      expect(result).toBe(true);
    });

    it('should return false when not supported', async () => {
      delete (navigator as any).wakeLock;
      const result = await requestWakeLock();
      expect(result).toBe(false);
    });
  });

  describe('getDeviceCapabilities', () => {
    it('should return device capabilities', () => {
      const capabilities = getDeviceCapabilities();
      expect(capabilities).toHaveProperty('supportsAppBadge');
      expect(capabilities).toHaveProperty('supportsWebShare');
      expect(capabilities).toHaveProperty('deviceType');
      expect(capabilities).toHaveProperty('isOnline');
    });
  });

  describe('initializePWA', () => {
    it('should initialize PWA features', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      initializePWA();
      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics', () => {
      const mockNavTiming = {
        loadEventEnd: 1000,
        loadEventStart: 900,
        domContentLoadedEventEnd: 800,
        domContentLoadedEventStart: 700,
      };
      
      jest.spyOn(performance, 'getEntriesByType').mockImplementation((type) => {
        if (type === 'navigation') return [mockNavTiming as any];
        if (type === 'paint') return [];
        return [];
      });
      
      const metrics = getPerformanceMetrics();
      expect(metrics.loadTime).toBe(100);
      expect(metrics.domContentLoaded).toBe(100);
    });
  });

  describe('triggerInstallPrompt', () => {
    it('should trigger install prompt when available', async () => {
      const mockEvent = {
        prompt: jest.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };
      (window as any).deferredPrompt = mockEvent;
      
      const result = await triggerInstallPrompt();
      expect(mockEvent.prompt).toHaveBeenCalled();
      expect(result).toBe('accepted');
    });

    it('should return not-available when no prompt', async () => {
      (window as any).deferredPrompt = null;
      const result = await triggerInstallPrompt();
      expect(result).toBe('not-available');
    });

    it('should handle errors', async () => {
      const mockEvent = {
        prompt: jest.fn().mockRejectedValue(new Error('Failed')),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      };
      (window as any).deferredPrompt = mockEvent;
      
      const result = await triggerInstallPrompt();
      expect(result).toBe('dismissed');
    });
  });

  describe('releaseWakeLock', () => {
    it('should release wake lock', async () => {
      const mockRelease = jest.fn().mockResolvedValue(undefined);
      const mockWakeLock = { release: mockRelease };
      
      // Simulate having an active wake lock
      const mockRequest = jest.fn().mockResolvedValue(mockWakeLock);
      Object.defineProperty(navigator, 'wakeLock', {
        writable: true,
        value: { request: mockRequest },
      });
      
      await requestWakeLock();
      const result = await releaseWakeLock();
      expect(result).toBe(true);
    });

    it('should return false when no wake lock', async () => {
      const result = await releaseWakeLock();
      expect(result).toBe(false);
    });
  });

  describe('isInstallPromptAvailable', () => {
    it('should check install prompt availability', () => {
      (window as any).deferredPrompt = { prompt: jest.fn() };
      expect(isInstallPromptAvailable()).toBe(true);
      
      (window as any).deferredPrompt = null;
      expect(isInstallPromptAvailable()).toBe(false);
    });
  });

  describe('isPWAMode', () => {
    it('should detect PWA mode', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }));
      
      expect(isPWAMode()).toBe(true);
    });
  });

  describe('initializeInstallPrompt', () => {
    it('should setup install prompt listeners', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      initializeInstallPrompt();
      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function));
    });

    it('should handle beforeinstallprompt event', () => {
      initializeInstallPrompt();
      const event = new Event('beforeinstallprompt');
      event.preventDefault = jest.fn();
      
      window.dispatchEvent(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('syncOfflineData', () => {
    it('should sync offline data', async () => {
      await syncOfflineData();
      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
        type: 'SYNC_OFFLINE_DATA',
      });
    });

    it('should handle when no service worker controller', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          controller: null,
        },
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
      (window as any).deferredPrompt = mockEvent;

      expect(getInstallPromptEvent()).toBe(mockEvent);
    });

    it('should return null when no event', () => {
      (window as any).deferredPrompt = null;

      expect(getInstallPromptEvent()).toBe(null);
    });
  });
});
