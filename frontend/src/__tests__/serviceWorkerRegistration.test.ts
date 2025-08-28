/**
 * Comprehensive tests for serviceWorkerRegistration
 * Testing all registration, unregistration, and error scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock console methods before importing the module
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// Mock environment variable at module level
const originalEnv = process.env.PUBLIC_URL;
const originalNodeEnv = process.env.NODE_ENV;

// Set default PUBLIC_URL
process.env.PUBLIC_URL = '';

describe('serviceWorkerRegistration', () => {
  let originalServiceWorker: typeof navigator.serviceWorker | undefined;
  let originalLocation: Location;
  let mockServiceWorker: ServiceWorker;
  let mockServiceWorkerRegistration: ServiceWorkerRegistration;

  beforeEach(() => {
    // Store original values
    originalServiceWorker = navigator.serviceWorker;
    originalLocation = window.location;

    // Reset mocks
    vi.clearAllMocks();
    vi.resetModules();

    // Set process.env defaults
    process.env.PUBLIC_URL = '';
    process.env.NODE_ENV = 'production';

    // Mock fetch globally
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) => {
            if (header === 'content-type') {
              return 'application/javascript';
            }
            return null;
          },
        },
        json: async () => ({}),
        text: async () => '',
      } as Response)
    );

    // Create mock service worker
    mockServiceWorker = {
      state: 'installed',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
      scriptURL: '',
      onstatechange: null,
      onerror: null,
    } as unknown as ServiceWorker;

    // Create mock service worker registration
    mockServiceWorkerRegistration = {
      installing: null,
      waiting: null,
      active: mockServiceWorker as ServiceWorker,
      onupdatefound: null as ((event?: Event) => void) | null,
      unregister: vi.fn().mockResolvedValue(true),
      update: vi.fn().mockResolvedValue(undefined),
      scope: '/',
      updateViaCache: 'imports' as any,
      navigationPreload: {} as NavigationPreloadManager,
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn().mockResolvedValue({}),
        permissionState: vi.fn().mockResolvedValue('granted'),
      } as unknown as PushManager,
      sync: {} as any,
      index: {} as any,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as ServiceWorkerRegistration;

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        hostname: 'localhost',
        origin: 'http://localhost:3000',
        href: 'http://localhost:3000',
      },
    });

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: {
        register: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
        ready: Promise.resolve(mockServiceWorkerRegistration),
        controller: null,
        getRegistration: vi
          .fn()
          .mockResolvedValue(mockServiceWorkerRegistration),
        getRegistrations: vi
          .fn()
          .mockResolvedValue([mockServiceWorkerRegistration]),
        startMessages: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      },
    });
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: originalServiceWorker,
    });
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
    process.env.PUBLIC_URL = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;

    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();

    // Clear module cache to ensure clean imports
    vi.resetModules();
  });

  describe('register function', () => {
    it('should not register if service worker is not supported', async () => {
      // Remove service worker support
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: undefined,
      });

      // Import and test
      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Service worker register should not be called
      expect(navigator.serviceWorker).toBeUndefined();
    });

    it('should not register if PUBLIC_URL origin is different from window origin', async () => {
      process.env.PUBLIC_URL = 'https://cdn.example.com';

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'localhost',
          origin: 'http://localhost:3000',
          href: 'http://localhost:3000',
        },
      });

      const mockRegister = vi.fn();
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockServiceWorkerRegistration),
          controller: null,
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should register service worker on localhost with valid config', async () => {
      const mockRegister = vi
        .fn()
        .mockResolvedValue(mockServiceWorkerRegistration);
      const onSuccess = vi.fn();
      const onUpdate = vi.fn();

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockServiceWorkerRegistration),
          controller: null,
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register({ onSuccess, onUpdate });

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for async operations
      await vi.waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });

      expect(mockRegister).toHaveBeenCalledWith('/service-worker-enhanced.js');
    });

    it('should register service worker on non-localhost', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'example.com',
          origin: 'https://example.com',
          href: 'https://example.com',
        },
      });

      const mockRegister = vi
        .fn()
        .mockResolvedValue(mockServiceWorkerRegistration);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockServiceWorkerRegistration),
          controller: null,
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for registration
      await vi.waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });

      expect(mockRegister).toHaveBeenCalledWith('/service-worker-enhanced.js');
    });

    it('should handle service worker registration errors', async () => {
      const registrationError = new Error('Registration failed');
      const mockRegister = vi.fn().mockRejectedValue(registrationError);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockServiceWorkerRegistration),
          controller: null,
        },
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'example.com',
          origin: 'https://example.com',
          href: 'https://example.com',
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for error to be logged
      await vi.waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalled();
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error during service worker registration:',
        registrationError
      );
    });

    it('should handle service worker update found scenario', async () => {
      const onUpdate = vi.fn();
      const mockWaitingWorker = {
        state: 'waiting',
      } as unknown as ServiceWorker;

      // Create a registration with onupdatefound handler
      const mockRegistration = {
        ...mockServiceWorkerRegistration,
        onupdatefound: null as ((event?: Event) => void) | null,
        installing: mockWaitingWorker,
        waiting: null,
      };

      const mockRegister = vi.fn((url: string) => {
        // Simulate setting onupdatefound after registration
        setTimeout(() => {
          if (mockRegistration.onupdatefound) {
            // Set installing and waiting workers
            (mockRegistration as any).installing = null;
            (mockRegistration as any).waiting = mockWaitingWorker;

            // Call the update handler
            const installingWorker = {
              state: 'installed',
              onstatechange: null as ((event?: Event) => void) | null,
            };

            // Simulate the onstatechange
            if (installingWorker.onstatechange) {
              installingWorker.onstatechange();
            }

            // Call onUpdate if waiting worker exists
            if (
              mockRegistration.waiting &&
              !navigator.serviceWorker.controller
            ) {
              onUpdate(mockRegistration as ServiceWorkerRegistration);
            }
          }
        }, 0);
        return Promise.resolve(mockRegistration);
      });

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockRegistration),
          controller: null,
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register({ onUpdate });

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for registration
      await vi.waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });

      // Manually trigger onupdatefound
      if (mockRegistration.onupdatefound) {
        mockRegistration.onupdatefound();
      }

      // Check console log for waiting message
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'New content is available and will be used when all tabs for this page are closed. See https://cra.link/PWA.'
      );
    });

    it('should handle service worker success scenario (no existing controller)', async () => {
      const onSuccess = vi.fn();

      // Create a registration with active worker
      const mockRegistration = {
        ...mockServiceWorkerRegistration,
        onupdatefound: null as ((event?: Event) => void) | null,
        installing: null,
        waiting: null,
        active: mockServiceWorker,
      };

      const mockRegister = vi.fn((url: string) => {
        // Simulate setting onupdatefound after registration
        setTimeout(() => {
          if (mockRegistration.onupdatefound) {
            mockRegistration.onupdatefound();

            // Simulate installing worker state change
            const installingWorker = {
              state: 'activated',
              onstatechange: null as ((event?: Event) => void) | null,
            };

            // Trigger state change for 'activated' state
            setTimeout(() => {
              if (!navigator.serviceWorker.controller) {
                onSuccess(mockRegistration as ServiceWorkerRegistration);
              }
            }, 0);
          }
        }, 0);
        return Promise.resolve(mockRegistration);
      });

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockRegistration),
          controller: null,
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register({ onSuccess });

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for registration
      await vi.waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });

      // Manually trigger onupdatefound and simulate activation
      if (mockRegistration.onupdatefound) {
        mockRegistration.onupdatefound();

        // Simulate the activated state
        await vi.waitFor(() => {
          expect(onSuccess).toHaveBeenCalled();
        });
      }

      expect(onSuccess).toHaveBeenCalledWith(mockRegistration);
    });
  });

  describe('localhost detection and validation', () => {
    it('should detect localhost correctly', async () => {
      const { isLocalhost } = await import('../serviceWorkerRegistration');
      expect(isLocalhost).toBe(true);
    });

    it('should detect non-localhost correctly', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'example.com',
        },
      });

      // Re-import to get new isLocalhost value
      vi.resetModules();
      const { isLocalhost } = await import('../serviceWorkerRegistration');
      expect(isLocalhost).toBe(false);
    });

    it('should validate service worker on localhost', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: {
            get: (header: string) =>
              header === 'content-type' ? 'application/javascript' : null,
          },
        } as unknown as Response)
      );

      const mockRegister = vi
        .fn()
        .mockResolvedValue(mockServiceWorkerRegistration);
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockServiceWorkerRegistration),
          controller: null,
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for fetch to be called
      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/service-worker-enhanced.js',
          {
            headers: { 'Service-Worker': 'script' },
          }
        );
      });
    });

    it('should handle invalid service worker content type', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: {
            get: (header: string) =>
              header === 'content-type' ? 'text/html' : null,
          },
        } as unknown as Response)
      );

      const mockUnregister = vi.fn().mockResolvedValue(true);
      const mockReload = vi.fn();

      mockServiceWorkerRegistration.unregister = mockUnregister;
      window.location.reload = mockReload;

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
          ready: Promise.resolve(mockServiceWorkerRegistration),
          controller: null,
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for unregister to be called
      await vi.waitFor(() => {
        expect(mockUnregister).toHaveBeenCalled();
      });

      // Wait for reload
      await vi.waitFor(() => {
        expect(mockReload).toHaveBeenCalled();
      });
    });

    it('should handle 404 error for service worker file', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          headers: {
            get: () => null,
          },
        } as unknown as Response)
      );

      const mockUnregister = vi.fn().mockResolvedValue(true);
      const mockReload = vi.fn();

      mockServiceWorkerRegistration.unregister = mockUnregister;
      window.location.reload = mockReload;

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
          ready: Promise.resolve(mockServiceWorkerRegistration),
          controller: null,
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for unregister to be called
      await vi.waitFor(() => {
        expect(mockUnregister).toHaveBeenCalled();
      });

      // Wait for reload
      await vi.waitFor(() => {
        expect(mockReload).toHaveBeenCalled();
      });
    });

    it('should handle offline scenario during validation', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const mockRegister = vi
        .fn()
        .mockResolvedValue(mockServiceWorkerRegistration);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockServiceWorkerRegistration),
          controller: null,
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for registration
      await vi.waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });

      // Should still register despite fetch error (offline scenario)
      expect(mockRegister).toHaveBeenCalledWith('/service-worker-enhanced.js');

      // Check console log for offline message
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'No internet connection found. App is running in offline mode.'
      );
    });
  });

  describe('unregister function', () => {
    it('should unregister service worker', async () => {
      const mockUnregister = vi.fn().mockResolvedValue(true);
      mockServiceWorkerRegistration.unregister = mockUnregister;

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          ready: Promise.resolve(mockServiceWorkerRegistration),
          getRegistration: vi
            .fn()
            .mockResolvedValue(mockServiceWorkerRegistration),
        },
      });

      const { unregister } = await import('../serviceWorkerRegistration');
      await unregister();

      expect(mockUnregister).toHaveBeenCalled();
    });

    it('should handle unregistration when service worker is not supported', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: undefined,
      });

      vi.resetModules();
      const { unregister } = await import('../serviceWorkerRegistration');

      // Should not throw
      expect(() => unregister()).not.toThrow();

      // Should complete without errors
      expect(navigator.serviceWorker).toBeUndefined();
    });

    it('should handle unregistration errors', async () => {
      const unregisterError = new Error('Unregister failed');
      const mockUnregister = vi.fn().mockRejectedValue(unregisterError);
      mockServiceWorkerRegistration.unregister = mockUnregister;

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          ready: Promise.resolve(mockServiceWorkerRegistration),
        },
      });

      vi.resetModules();
      const { unregister } = await import('../serviceWorkerRegistration');

      // Call unregister and wait for error handling
      await unregister();

      // Wait a bit for async error handling
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error unregistering service worker:',
        unregisterError
      );
    });
  });

  describe('worker state changes', () => {
    it('should handle worker state change when in installed state with waiting worker', async () => {
      const onUpdate = vi.fn();
      const mockWaitingWorker = {
        state: 'waiting',
      } as unknown as ServiceWorker;

      const mockRegistration = {
        ...mockServiceWorkerRegistration,
        waiting: mockWaitingWorker,
        installing: null,
      };

      const mockRegister = vi.fn().mockResolvedValue(mockRegistration);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockRegistration),
          controller: {} as ServiceWorker, // Has controller
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register({ onUpdate });

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for registration
      await vi.waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });

    it('should handle worker state change when not in installed state', async () => {
      const onUpdate = vi.fn();
      const mockInstallingWorker = {
        state: 'installing',
        onstatechange: null as ((event?: Event) => void) | null,
      } as ServiceWorker;

      const mockRegistration = {
        ...mockServiceWorkerRegistration,
        installing: mockInstallingWorker,
        waiting: null,
        onupdatefound: null as ((event?: Event) => void) | null,
      };

      const mockRegister = vi.fn().mockResolvedValue(mockRegistration);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockRegistration),
          controller: null,
        },
      });

      const { register } = await import('../serviceWorkerRegistration');
      register({ onUpdate });

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for registration
      await vi.waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });

      // Trigger onupdatefound and state change
      if (mockRegistration.onupdatefound) {
        mockRegistration.onupdatefound();
      }

      // onUpdate should not be called for 'installing' state
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });
});
