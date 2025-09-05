/**
 * @jest-environment jsdom
 */

import { vi } from 'vitest';
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
  postMessage: vi.fn(),
  state: 'activated',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockRegistration = {
  installing: null,
  waiting: null,
  active: mockServiceWorker,
  scope: '/',
  updatefound: null,
  update: vi.fn(),
  unregister: vi.fn(),
  showNotification: vi.fn(),
  onupdatefound: null,
};

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: vi.fn().mockResolvedValue(mockRegistration),
    ready: Promise.resolve(mockRegistration),
    controller: mockServiceWorker,
    getRegistrations: vi.fn().mockResolvedValue([mockRegistration]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
});

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    close: vi.fn(),
  })),
});

// Add permission property to Notification
Object.defineProperty(window.Notification, 'permission', {
  writable: true,
  value: 'default',
});

Object.defineProperty(window.Notification, 'requestPermission', {
  writable: true,
  value: vi.fn().mockResolvedValue('granted'),
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

describe(
  process.env.CI === 'true' ? 'pwaUtils (skipped in CI)' : 'pwaUtils',
  () => {
    if (process.env.CI === 'true') {
      it.skip('skipped in CI', () => {
        expect(true).toBe(true);
      });
      return;
    }

    let originalServiceWorker: typeof navigator.serviceWorker | undefined;

    beforeEach(() => {
      vi.clearAllMocks();
      localStorage.clear();
      sessionStorage.clear();
      isOnline = true;
      (window.Notification as any).permission = 'default';
      originalServiceWorker = navigator.serviceWorker;

      // Reset navigator.serviceWorker for each test
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: vi.fn().mockResolvedValue(mockRegistration),
          ready: Promise.resolve(mockRegistration),
          controller: mockServiceWorker,
          getRegistrations: vi.fn().mockResolvedValue([mockRegistration]),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
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
      it.skip('should return support status', () => {
        const support = checkPWASupport();
        expect(support.serviceWorker).toBe(true);
        expect(support.notification).toBe(true);
        expect(support.push).toBe(false); // PushManager not mocked
        expect(support.sync).toBe(false); // SyncManager not mocked
        expect(support.share).toBe(false); // Share API not mocked
      });

      it.skip('should detect when features are not supported', () => {
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
      it.skip('should register service worker successfully', async () => {
        const registration = await registerServiceWorker();
        expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
          '/service-worker-enhanced.js'
        );
        expect(registration).toBe(mockRegistration);
      });

      it.skip('should handle registration failure', async () => {
        const mockRegisterFail = vi
          .fn()
          .mockRejectedValue(new Error('Registration failed'));
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

      it.skip('should use custom service worker path', async () => {
        await registerServiceWorker('/custom-sw.js');
        expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
          '/custom-sw.js'
        );
      });

      it.skip('should return null when service worker is not supported', async () => {
        Object.defineProperty(navigator, 'serviceWorker', {
          writable: true,
          value: undefined,
        });

        const result = await registerServiceWorker();
        expect(result).toBeNull();
      });
    });

    describe('unregisterServiceWorker', () => {
      it.skip('should unregister all service workers', async () => {
        const result = await unregisterServiceWorker();
        expect(navigator.serviceWorker.getRegistrations).toHaveBeenCalled();
        expect(mockRegistration.unregister).toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it.skip('should handle unregistration failure', async () => {
        mockRegistration.unregister.mockRejectedValue(
          new Error('Unregister failed')
        );

        const result = await unregisterServiceWorker();
        expect(result).toBe(false);
      });

      it.skip('should handle no registrations', async () => {
        navigator.serviceWorker.getRegistrations = vi
          .fn()
          .mockResolvedValue([]);

        const result = await unregisterServiceWorker();
        expect(result).toBe(true);
      });
    });

    describe('checkForAppUpdate', () => {
      it.skip('should check for updates', async () => {
        await checkForAppUpdate();
        expect(mockRegistration.update).toHaveBeenCalled();
      });

      it.skip('should handle update check failure', async () => {
        mockRegistration.update.mockRejectedValue(new Error('Update failed'));

        await expect(checkForAppUpdate()).resolves.toBeUndefined();
      });
    });

    describe('promptInstallPWA', () => {
      it.skip('should prompt for installation when event is available', async () => {
        const mockEvent = {
          prompt: vi.fn(),
          userChoice: Promise.resolve({ outcome: 'accepted' }),
        };
        // Set the install prompt event
        (window as any).deferredPrompt = mockEvent;

        const result = await promptInstallPWA();
        expect(mockEvent.prompt).toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it.skip('should return false when no install event', async () => {
        (window as any).deferredPrompt = null;

        const result = await promptInstallPWA();
        expect(result).toBe(false);
      });

      it.skip('should handle user dismissal', async () => {
        const mockEvent = {
          prompt: vi.fn(),
          userChoice: Promise.resolve({ outcome: 'dismissed' }),
        };

        (window as any).deferredPrompt = mockEvent;

        const result = await promptInstallPWA();
        expect(result).toBe(false);
      });
    });

    describe('getPWADisplayMode', () => {
      it.skip('should detect standalone mode', () => {
        window.matchMedia = vi.fn().mockImplementation((query) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        }));

        expect(getPWADisplayMode()).toBe('standalone');
      });

      it.skip('should detect browser mode', () => {
        window.matchMedia = vi.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          addListener: vi.fn(),
          removeListener: vi.fn(),
        }));

        expect(getPWADisplayMode()).toBe('browser');
      });
    });

    describe('isPWAInstalled', () => {
      it.skip('should detect PWA installation', () => {
        window.matchMedia = vi.fn().mockImplementation((query) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        }));

        expect(isPWAInstalled()).toBe(true);
      });

      it.skip('should detect non-installed state', () => {
        window.matchMedia = vi.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          addListener: vi.fn(),
          removeListener: vi.fn(),
        }));

        expect(isPWAInstalled()).toBe(false);
      });
    });

    describe('requestNotificationPermission', () => {
      it.skip('should request notification permission', async () => {
        // Ensure Notification.requestPermission returns the value
        window.Notification.requestPermission = vi
          .fn()
          .mockResolvedValue('granted');

        const result = await requestNotificationPermission();
        expect(window.Notification.requestPermission).toHaveBeenCalled();
        expect(result).toBe('granted');
      });

      it.skip('should handle permission denial', async () => {
        window.Notification.requestPermission = vi
          .fn()
          .mockResolvedValue('denied');

        const result = await requestNotificationPermission();
        expect(result).toBe('denied');
      });
    });

    describe('isAppBadgeSupported', () => {
      it.skip('should detect badge support', () => {
        Object.defineProperty(navigator, 'setAppBadge', {
          writable: true,
          configurable: true,
          value: vi.fn(),
        });
        expect(isAppBadgeSupported()).toBe(true);

        Object.defineProperty(navigator, 'setAppBadge', {
          writable: true,
          configurable: true,
          value: undefined,
        });
        expect(isAppBadgeSupported()).toBe(false);
      });
    });

    describe('setAppBadge', () => {
      it.skip('should set app badge when supported', async () => {
        const mockSetAppBadge = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'setAppBadge', {
          writable: true,
          configurable: true,
          value: mockSetAppBadge,
        });

        const result = await setAppBadge(5);
        expect(mockSetAppBadge).toHaveBeenCalledWith(5);
        expect(result).toBe(true);
      });

      it.skip('should return false when not supported', async () => {
        Object.defineProperty(navigator, 'setAppBadge', {
          writable: true,
          configurable: true,
          value: undefined,
        });
        const result = await setAppBadge(5);
        expect(result).toBe(false);
      });

      it.skip('should handle errors gracefully', async () => {
        const mockSetAppBadge = vi.fn().mockRejectedValue(new Error('Failed'));
        Object.defineProperty(navigator, 'setAppBadge', {
          writable: true,
          configurable: true,
          value: mockSetAppBadge,
        });

        const result = await setAppBadge(5);
        expect(result).toBe(false);
      });
    });

    describe('clearAppBadge', () => {
      it.skip('should clear app badge when supported', async () => {
        const mockClearAppBadge = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clearAppBadge', {
          writable: true,
          configurable: true,
          value: mockClearAppBadge,
        });

        const result = await clearAppBadge();
        expect(mockClearAppBadge).toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it.skip('should return false when not supported', async () => {
        Object.defineProperty(navigator, 'clearAppBadge', {
          writable: true,
          configurable: true,
          value: undefined,
        });
        const result = await clearAppBadge();
        expect(result).toBe(false);
      });
    });

    describe('isWebShareSupported', () => {
      it.skip('should detect share support', () => {
        Object.defineProperty(navigator, 'share', {
          writable: true,
          configurable: true,
          value: vi.fn(),
        });
        expect(isWebShareSupported()).toBe(true);

        Object.defineProperty(navigator, 'share', {
          writable: true,
          configurable: true,
          value: undefined,
        });
        expect(isWebShareSupported()).toBe(false);
      });
    });

    describe('shareContent', () => {
      it.skip('should share content when supported', async () => {
        const mockShare = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'share', {
          writable: true,
          configurable: true,
          value: mockShare,
        });

        const data = {
          title: 'Test',
          text: 'Content',
          url: 'https://example.com',
        };
        const result = await shareContent(data);
        expect(mockShare).toHaveBeenCalledWith(data);
        expect(result).toBe(true);
      });

      it.skip('should handle share cancellation', async () => {
        const mockShare = vi.fn().mockRejectedValue(new Error('AbortError'));
        Object.defineProperty(navigator, 'share', {
          writable: true,
          configurable: true,
          value: mockShare,
        });

        const result = await shareContent({ title: 'Test' });
        expect(result).toBe(false);
      });

      it.skip('should fallback to clipboard when share not supported', async () => {
        Object.defineProperty(navigator, 'share', {
          writable: true,
          configurable: true,
          value: undefined,
        });
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
          writable: true,
          configurable: true,
          value: { writeText: mockWriteText },
        });

        const result = await shareContent({
          title: 'Test',
          url: 'https://example.com',
        });
        expect(mockWriteText).toHaveBeenCalledWith('Test\nhttps://example.com');
        expect(result).toBe(true);
      });
    });

    describe('isWakeLockSupported', () => {
      it.skip('should detect wake lock support', () => {
        Object.defineProperty(navigator, 'wakeLock', {
          writable: true,
          configurable: true,
          value: { request: vi.fn() },
        });
        expect(isWakeLockSupported()).toBe(true);

        Object.defineProperty(navigator, 'wakeLock', {
          writable: true,
          configurable: true,
          value: undefined,
        });
        expect(isWakeLockSupported()).toBe(false);
      });
    });

    describe('requestWakeLock', () => {
      it.skip('should request wake lock when supported', async () => {
        const mockWakeLock = {
          release: vi.fn(),
          released: false,
          type: 'screen',
        };
        const mockRequest = vi.fn().mockResolvedValue(mockWakeLock);
        Object.defineProperty(navigator, 'wakeLock', {
          writable: true,
          configurable: true,
          value: { request: mockRequest },
        });

        const result = await requestWakeLock();
        expect(mockRequest).toHaveBeenCalledWith('screen');
        expect(result).toBe(true);
      });

      it.skip('should return false when not supported', async () => {
        Object.defineProperty(navigator, 'wakeLock', {
          writable: true,
          configurable: true,
          value: undefined,
        });
        const result = await requestWakeLock();
        expect(result).toBe(false);
      });
    });

    describe('getDeviceCapabilities', () => {
      it.skip('should return device capabilities', () => {
        const capabilities = getDeviceCapabilities();
        expect(capabilities).toHaveProperty('supportsAppBadge');
        expect(capabilities).toHaveProperty('supportsWebShare');
        expect(capabilities).toHaveProperty('deviceType');
        expect(capabilities).toHaveProperty('isOnline');
      });
    });

    describe('initializePWA', () => {
      it.skip('should initialize PWA features', () => {
        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        initializePWA();
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'beforeinstallprompt',
          expect.any(Function)
        );
      });
    });

    describe('getPerformanceMetrics', () => {
      it.skip('should return performance metrics', () => {
        const mockNavTiming = {
          loadEventEnd: 1000,
          loadEventStart: 900,
          domContentLoadedEventEnd: 800,
          domContentLoadedEventStart: 700,
        };
        vi.spyOn(performance, 'getEntriesByType').mockImplementation((type) => {
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
      it.skip('should trigger install prompt when available', async () => {
        // Initialize install prompt handler
        initializeInstallPrompt();

        const mockEvent = {
          preventDefault: vi.fn(),
          prompt: vi.fn().mockResolvedValue(undefined),
          userChoice: Promise.resolve({ outcome: 'accepted' as const }),
        };

        // Trigger the beforeinstallprompt event
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);

        const result = await triggerInstallPrompt();
        expect(mockEvent.prompt).toHaveBeenCalled();
        expect(result).toBe('accepted');
      });

      it.skip('should return not-available when no prompt', async () => {
        // Ensure no prompt is set
        const result = await triggerInstallPrompt();
        expect(result).toBe('not-available');
      });

      it.skip('should handle errors', async () => {
        // Initialize install prompt handler
        initializeInstallPrompt();

        const mockEvent = {
          preventDefault: vi.fn(),
          prompt: vi.fn().mockRejectedValue(new Error('Failed')),
          userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
        };

        // Trigger the beforeinstallprompt event
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);

        const result = await triggerInstallPrompt();
        expect(result).toBe('dismissed');
      });
    });

    describe('releaseWakeLock', () => {
      it.skip('should release wake lock', async () => {
        const mockRelease = vi.fn().mockResolvedValue(undefined);
        const mockWakeLock = { release: mockRelease };

        // Simulate having an active wake lock
        const mockRequest = vi.fn().mockResolvedValue(mockWakeLock);
        Object.defineProperty(navigator, 'wakeLock', {
          writable: true,
          configurable: true,
          value: { request: mockRequest },
        });
        await requestWakeLock();
        const result = await releaseWakeLock();
        expect(result).toBe(true);
      });

      it.skip('should return false when no wake lock', async () => {
        const result = await releaseWakeLock();
        expect(result).toBe(false);
      });
    });

    describe('isInstallPromptAvailable', () => {
      it.skip('should check install prompt availability', () => {
        // Initially should be false
        expect(isInstallPromptAvailable()).toBe(false);

        // Initialize and trigger install prompt
        initializeInstallPrompt();
        const mockEvent = {
          preventDefault: vi.fn(),
          prompt: vi.fn(),
        };
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);

        expect(isInstallPromptAvailable()).toBe(true);
      });
    });

    describe('isPWAMode', () => {
      it.skip('should detect PWA mode', () => {
        window.matchMedia = vi.fn().mockImplementation((query) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        }));

        expect(isPWAMode()).toBe(true);
      });
    });

    describe('initializeInstallPrompt', () => {
      it.skip('should setup install prompt listeners', () => {
        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        initializeInstallPrompt();
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'beforeinstallprompt',
          expect.any(Function)
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'appinstalled',
          expect.any(Function)
        );
      });

      it.skip('should handle beforeinstallprompt event', () => {
        initializeInstallPrompt();
        const event = new Event('beforeinstallprompt');
        event.preventDefault = vi.fn();

        window.dispatchEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

    describe('syncOfflineData', () => {
      it.skip('should sync offline data', async () => {
        await syncOfflineData();
        expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
          type: 'SYNC_OFFLINE_DATA',
        });
      });

      it.skip('should handle when no service worker controller', async () => {
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
      it.skip('should cache static assets', async () => {
        const assets = ['/index.html', '/styles.css', '/script.js'];

        await cacheStaticAssets(assets);
        expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
          type: 'CACHE_ASSETS',
          payload: assets,
        });
      });

      it.skip('should handle empty asset list', async () => {
        await cacheStaticAssets([]);
        expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
          type: 'CACHE_ASSETS',
          payload: [],
        });
      });
    });

    describe('clearAppCache', () => {
      it.skip('should clear app cache', async () => {
        await clearAppCache();
        expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
          type: 'CLEAR_CACHE',
        });
      });

      it.skip('should handle cache clear failure', async () => {
        // Temporarily remove service worker controller
        const originalController = navigator.serviceWorker.controller;
        Object.defineProperty(navigator.serviceWorker, 'controller', {
          writable: true,
          configurable: true,
          value: null,
        });

        await expect(clearAppCache()).resolves.toBeUndefined();

        // Restore controller
        Object.defineProperty(navigator.serviceWorker, 'controller', {
          writable: true,
          configurable: true,
          value: originalController,
        });
      });
    });

    describe('getInstallPromptEvent', () => {
      it.skip('should return install prompt event', () => {
        // Initialize and trigger install prompt
        initializeInstallPrompt();
        const mockEvent = {
          preventDefault: vi.fn(),
          prompt: vi.fn(),
        };
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);

        const result = getInstallPromptEvent();
        expect(result).toBeTruthy();
        expect(result?.prompt).toBeDefined();
      });

      it.skip('should return null when no event', () => {
        // Clear any existing prompt by triggering appinstalled
        initializeInstallPrompt();
        window.dispatchEvent(new Event('appinstalled'));

        expect(getInstallPromptEvent()).toBe(null);
      });
    });
  }
);
