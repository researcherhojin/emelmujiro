/**
 * @jest-environment jsdom
 */

import { vi } from 'vitest';
import {
  isPushNotificationSupported,
  isPushNotificationEnabled,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendSubscriptionToServer,
  showNotification,
} from '../pushNotifications';

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

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock subscription object
const mockSubscription = {
  unsubscribe: vi.fn().mockResolvedValue(true),
  endpoint: 'https://test-endpoint.com',
  expirationTime: null,
  options: {
    userVisibleOnly: true,
    applicationServerKey: null,
  },
  keys: {
    p256dh: 'test-p256dh',
    auth: 'test-auth',
  },
  getKey: vi.fn().mockImplementation((name: string) => {
    if (name === 'p256dh') return 'test-p256dh';
    if (name === 'auth') return 'test-auth';
    return null;
  }),
  toJSON: vi.fn().mockReturnValue({
    endpoint: 'https://test-endpoint.com',
    keys: {
      p256dh: 'test-p256dh',
      auth: 'test-auth',
    },
  }),
} as unknown as PushSubscription;

// Mock service worker registration
const mockRegistration = {
  pushManager: {
    getSubscription: vi.fn(),
    subscribe: vi.fn(),
  },
  showNotification: vi.fn(),
};

// Mock navigator
const mockNavigator = {
  serviceWorker: {
    ready: Promise.resolve(mockRegistration),
  },
};

describe('pushNotifications', () => {
  const originalNavigator = global.navigator;
  const originalNotification = global.Notification;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup navigator mock
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    // Setup Notification mock
    const mockNotification = {
      requestPermission: vi.fn(),
    };
    Object.defineProperty(mockNotification, 'permission', {
      value: 'default',
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global, 'Notification', {
      value: mockNotification,
      writable: true,
    });

    // Setup window mock
    Object.defineProperty(global, 'window', {
      value: {
        ...originalWindow,
        atob: vi.fn().mockImplementation((str) => {
          // Simple mock of atob for base64 decode
          return Buffer.from(str, 'base64').toString('binary');
        }),
        PushManager: class MockPushManager {},
      },
      writable: true,
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    mockRegistration.pushManager.getSubscription.mockResolvedValue(null);
    mockRegistration.pushManager.subscribe.mockResolvedValue(mockSubscription);
    mockRegistration.showNotification.mockResolvedValue(undefined);
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
    Object.defineProperty(global, 'Notification', {
      value: originalNotification,
      writable: true,
    });
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
    });
  });

  describe('isPushNotificationSupported', () => {
    it.skip('should return true when both serviceWorker and PushManager are supported', () => {
      expect(isPushNotificationSupported()).toBe(true);
    });

    it.skip('should return false when serviceWorker is not supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      expect(isPushNotificationSupported()).toBe(false);
    });

    it.skip('should return false when PushManager is not supported', () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      expect(isPushNotificationSupported()).toBe(false);
    });
  });

  describe('isPushNotificationEnabled', () => {
    it.skip('should return true when push notifications are supported and permission granted', () => {
      Object.defineProperty(global.Notification, 'permission', {
        value: 'granted',
        writable: true,
        configurable: true,
      });
      expect(isPushNotificationEnabled()).toBe(true);
    });

    it.skip('should return false when push notifications are not supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      expect(isPushNotificationEnabled()).toBe(false);
    });

    it.skip('should return false when permission is denied', () => {
      Object.defineProperty(global.Notification, 'permission', {
        value: 'denied',
        writable: true,
        configurable: true,
      });
      expect(isPushNotificationEnabled()).toBe(false);
    });

    it.skip('should return false when permission is default', () => {
      Object.defineProperty(global.Notification, 'permission', {
        value: 'default',
        writable: true,
        configurable: true,
      });
      expect(isPushNotificationEnabled()).toBe(false);
    });
  });

  describe('requestNotificationPermission', () => {
    it.skip('should request permission and return true when granted', async () => {
      (
        global.Notification.requestPermission as ReturnType<typeof vi.fn>
      ).mockResolvedValue('granted');

      const result = await requestNotificationPermission();

      expect(global.Notification.requestPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it.skip('should return false when permission is denied', async () => {
      (
        global.Notification.requestPermission as ReturnType<typeof vi.fn>
      ).mockResolvedValue('denied');

      const result = await requestNotificationPermission();

      expect(result).toBe(false);
    });

    it.skip('should return false when push notifications are not supported', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      const result = await requestNotificationPermission();

      expect(result).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Push notifications are not supported in this browser'
      );
    });
  });

  describe('subscribeToPushNotifications', () => {
    beforeEach(() => {
      Object.defineProperty(global.Notification, 'permission', {
        value: 'granted',
        writable: true,
        configurable: true,
      });
    });

    it.skip('should subscribe successfully when no existing subscription', async () => {
      const result = await subscribeToPushNotifications();

      expect(mockRegistration.pushManager.getSubscription).toHaveBeenCalled();
      expect(mockRegistration.pushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array),
      });
      expect(result).toBe(mockSubscription);
    });

    it.skip('should return existing subscription when already subscribed', async () => {
      mockRegistration.pushManager.getSubscription.mockResolvedValue(
        mockSubscription
      );

      const result = await subscribeToPushNotifications();

      expect(mockRegistration.pushManager.subscribe).not.toHaveBeenCalled();
      expect(result).toBe(mockSubscription);
    });

    it.skip('should throw error when push notifications not supported', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      await expect(subscribeToPushNotifications()).rejects.toThrow(
        'Push notifications are not supported'
      );
    });

    it.skip('should throw error when permission not granted', async () => {
      Object.defineProperty(global.Notification, 'permission', {
        value: 'denied',
        writable: true,
        configurable: true,
      });

      await expect(subscribeToPushNotifications()).rejects.toThrow(
        'Notification permission not granted'
      );
    });

    it.skip('should handle subscription errors', async () => {
      const error = new Error('Subscription failed');
      mockRegistration.pushManager.subscribe.mockRejectedValue(error);

      await expect(subscribeToPushNotifications()).rejects.toThrow(
        'Subscription failed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to subscribe to push notifications:',
        error
      );
    });
  });

  describe('unsubscribeFromPushNotifications', () => {
    it.skip('should unsubscribe successfully when subscription exists', async () => {
      mockRegistration.pushManager.getSubscription.mockResolvedValue(
        mockSubscription
      );

      const result = await unsubscribeFromPushNotifications();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it.skip('should return false when no subscription exists', async () => {
      mockRegistration.pushManager.getSubscription.mockResolvedValue(null);

      const result = await unsubscribeFromPushNotifications();

      expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it.skip('should handle unsubscribe errors', async () => {
      const error = new Error('Unsubscribe failed');
      const mockSubscriptionWithError = {
        ...mockSubscription,
        unsubscribe: vi.fn().mockRejectedValue(error),
      };
      mockRegistration.pushManager.getSubscription.mockResolvedValue(
        mockSubscriptionWithError
      );

      await expect(unsubscribeFromPushNotifications()).rejects.toThrow(
        'Unsubscribe failed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to unsubscribe from push notifications:',
        error
      );
    });
  });

  describe('sendSubscriptionToServer', () => {
    it.skip('should send subscription to server successfully', async () => {
      const result = await sendSubscriptionToServer(mockSubscription);

      expect(mockFetch).toHaveBeenCalledWith('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSubscription),
      });
      expect(result).toEqual({ success: true });
    });

    it.skip('should throw error when server response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(sendSubscriptionToServer(mockSubscription)).rejects.toThrow(
        'Failed to send subscription to server'
      );
    });

    it.skip('should handle fetch errors', async () => {
      const error = new Error('Network error');
      mockFetch.mockRejectedValue(error);

      await expect(sendSubscriptionToServer(mockSubscription)).rejects.toThrow(
        'Network error'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to send subscription to server:',
        error
      );
    });
  });

  describe('showNotification', () => {
    beforeEach(() => {
      Object.defineProperty(global.Notification, 'permission', {
        value: 'granted',
        writable: true,
        configurable: true,
      });
    });

    it.skip('should show notification with default options', async () => {
      await showNotification('Test notification');

      expect(mockRegistration.showNotification).toHaveBeenCalledWith(
        'Test notification',
        expect.objectContaining({
          icon: '/logo192.png',
          badge: '/logo192.png',
          vibrate: [200, 100, 200],
          tag: 'emelmujiro-notification',
          renotify: true,
          requireInteraction: false,
        })
      );
    });

    it.skip('should show notification with custom options', async () => {
      const customOptions = {
        icon: '/custom-icon.png',
        body: 'Custom notification body',
        tag: 'custom-tag',
        requireInteraction: true,
      };
      await showNotification('Test notification', customOptions);

      expect(mockRegistration.showNotification).toHaveBeenCalledWith(
        'Test notification',
        expect.objectContaining({
          icon: '/custom-icon.png',
          body: 'Custom notification body',
          tag: 'custom-tag',
          requireInteraction: true,
          badge: '/logo192.png',
          vibrate: [200, 100, 200],
          renotify: true,
        })
      );
    });

    it.skip('should not show notification when push notifications are not enabled', async () => {
      Object.defineProperty(global.Notification, 'permission', {
        value: 'denied',
        writable: true,
        configurable: true,
      });

      await showNotification('Test notification');

      expect(mockRegistration.showNotification).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Push notifications are not enabled'
      );
    });

    it.skip('should handle notification errors', async () => {
      const error = new Error('Notification failed');
      mockRegistration.showNotification.mockRejectedValue(error);

      await expect(showNotification('Test notification')).rejects.toThrow(
        'Notification failed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to show notification:',
        error
      );
    });
  });

  describe('urlBase64ToUint8Array', () => {
    // Test the internal urlBase64ToUint8Array function through public API
    it.skip('should correctly decode VAPID key during subscription', async () => {
      Object.defineProperty(global.Notification, 'permission', {
        value: 'granted',
        writable: true,
        configurable: true,
      });

      // The function is tested indirectly through subscribeToPushNotifications
      await subscribeToPushNotifications();

      expect(mockRegistration.pushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array),
      });
    });
  });

  describe('environment variable handling', () => {
    const originalEnv = process.env.REACT_APP_VAPID_PUBLIC_KEY;

    afterEach(() => {
      if (originalEnv) {
        process.env.REACT_APP_VAPID_PUBLIC_KEY = originalEnv;
      } else {
        delete process.env.REACT_APP_VAPID_PUBLIC_KEY;
      }
    });

    it.skip('should use environment VAPID key when available', async () => {
      process.env.REACT_APP_VAPID_PUBLIC_KEY = 'test-vapid-key';
      Object.defineProperty(global.Notification, 'permission', {
        value: 'granted',
        writable: true,
        configurable: true,
      });

      await subscribeToPushNotifications();

      expect(mockRegistration.pushManager.subscribe).toHaveBeenCalled();
    });

    it.skip('should use default VAPID key when environment variable not set', async () => {
      delete process.env.REACT_APP_VAPID_PUBLIC_KEY;
      Object.defineProperty(global.Notification, 'permission', {
        value: 'granted',
        writable: true,
        configurable: true,
      });

      await subscribeToPushNotifications();

      expect(mockRegistration.pushManager.subscribe).toHaveBeenCalled();
    });
  });
});
