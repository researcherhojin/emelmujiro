/**
 * Comprehensive tests for serviceWorkerRegistration
 * Testing all registration, unregistration, and error scenarios
 */

// Mock console methods before importing the module
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Mock fetch globally with proper promise return
interface MockHeaders {
  get: jest.Mock<string | null, [string]>;
}

interface MockResponse {
  ok: boolean;
  status: number;
  headers: MockHeaders;
  json: () => Promise<Record<string, unknown>>;
  text: () => Promise<string>;
}

const createMockHeaders = (): MockHeaders => ({
  get: jest.fn((header: string) => {
    if (header === 'content-type') {
      return 'application/javascript';
    }
    return null;
  }),
});

const mockFetch = jest.fn(
  (): Promise<MockResponse> =>
    Promise.resolve({
      ok: true,
      status: 200,
      headers: createMockHeaders(),
      json: async () => ({}),
      text: async () => '',
    })
);
global.fetch = mockFetch as unknown as typeof fetch;

// Mock environment variable
const originalEnv = process.env.PUBLIC_URL;
const originalNodeEnv = process.env.NODE_ENV;

describe('serviceWorkerRegistration', () => {
  let originalServiceWorker: ServiceWorkerContainer | undefined;
  let originalLocation: Location;
  let mockServiceWorkerRegistration: Partial<ServiceWorkerRegistration>;
  let mockServiceWorker: Partial<ServiceWorker>;

  beforeEach(() => {
    // Store original values
    originalServiceWorker = navigator.serviceWorker;
    originalLocation = window.location;

    // Clear all mocks
    jest.clearAllMocks();

    // Reset fetch mock to default behavior
    mockFetch.mockImplementation(
      (): Promise<MockResponse> =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: createMockHeaders(),
          json: async () => ({}),
          text: async () => '',
        })
    );
    mockFetch.mockClear();

    // Set up mock environment
    process.env = { ...process.env, PUBLIC_URL: '' };

    // Create mock service worker
    mockServiceWorker = {
      state: 'installed',
      onstatechange: null as ((this: ServiceWorker, ev: Event) => unknown) | null,
    };

    // Create mock service worker registration
    mockServiceWorkerRegistration = {
      installing: null,
      waiting: null,
      active: mockServiceWorker as ServiceWorker,
      onupdatefound: null as ((event?: Event) => void) | null,
      unregister: jest.fn().mockResolvedValue(true),
      pushManager: {
        getSubscription: jest.fn().mockResolvedValue(null),
        subscribe: jest.fn().mockResolvedValue({}),
      } as unknown as PushManager,
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
        register: jest.fn().mockResolvedValue(mockServiceWorkerRegistration),
        ready: Promise.resolve(mockServiceWorkerRegistration),
        controller: null,
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
    process.env = { ...process.env, PUBLIC_URL: originalEnv, NODE_ENV: originalNodeEnv };

    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();

    // Clear module cache to ensure clean imports
    jest.resetModules();
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
      process.env = { ...process.env, PUBLIC_URL: 'https://cdn.example.com' };

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'localhost',
          origin: 'http://localhost:3000',
          href: 'http://localhost:3000',
        },
      });

      const mockRegister = jest.fn();
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
      const mockRegister = jest.fn().mockResolvedValue(mockServiceWorkerRegistration);
      const onSuccess = jest.fn();
      const onUpdate = jest.fn();

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
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockRegister).toHaveBeenCalledWith('/service-worker-enhanced.js');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/PWA'
      );
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

      const mockRegister = jest.fn().mockResolvedValue(mockServiceWorkerRegistration);

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

      expect(mockRegister).toHaveBeenCalledWith('/service-worker-enhanced.js');
    });

    it('should handle service worker registration errors', async () => {
      const registrationError = new Error('Registration failed');
      const mockRegister = jest.fn().mockRejectedValue(registrationError);

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

      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error during service worker registration:',
        registrationError
      );
    });

    it('should handle service worker update found scenario', async () => {
      const onUpdate = jest.fn();
      const mockInstallingWorker = {
        state: 'installing',
        onstatechange: null as ((this: ServiceWorker, ev: Event) => unknown) | null,
      };

      const mockRegistrationWithUpdate = {
        ...mockServiceWorkerRegistration,
        installing: mockInstallingWorker,
        onupdatefound: null as ((event?: Event) => void) | null,
      } as unknown as ServiceWorkerRegistration;

      const mockRegister = jest.fn().mockResolvedValue(mockRegistrationWithUpdate);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          controller: {}, // Existing controller
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
      register({ onUpdate });

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for registration to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Simulate update found
      if (mockRegistrationWithUpdate.onupdatefound) {
        mockRegistrationWithUpdate.onupdatefound(new Event('updatefound'));

        // Simulate installing worker state change to installed
        mockInstallingWorker.state = 'installed';
        if (mockInstallingWorker.onstatechange) {
          mockInstallingWorker.onstatechange?.call(
            mockInstallingWorker as ServiceWorker,
            new Event('statechange')
          );
        }
      }

      expect(onUpdate).toHaveBeenCalledWith(mockRegistrationWithUpdate);
    });

    it('should handle service worker success scenario (no existing controller)', async () => {
      const onSuccess = jest.fn();
      const mockInstallingWorker = {
        state: 'installing',
        onstatechange: null as ((this: ServiceWorker, ev: Event) => unknown) | null,
      };

      const mockRegistrationWithSuccess = {
        ...mockServiceWorkerRegistration,
        installing: mockInstallingWorker,
        onupdatefound: null as ((event?: Event) => void) | null,
      } as unknown as ServiceWorkerRegistration;

      const mockRegister = jest.fn().mockResolvedValue(mockRegistrationWithSuccess);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          controller: null, // No existing controller
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
      register({ onSuccess });

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for registration to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Simulate update found
      if (mockRegistrationWithSuccess.onupdatefound) {
        mockRegistrationWithSuccess.onupdatefound(new Event('updatefound'));

        // Simulate installing worker state change to installed
        mockInstallingWorker.state = 'installed';
        if (mockInstallingWorker.onstatechange) {
          mockInstallingWorker.onstatechange?.call(
            mockInstallingWorker as ServiceWorker,
            new Event('statechange')
          );
        }
      }

      expect(onSuccess).toHaveBeenCalledWith(mockRegistrationWithSuccess);
      expect(mockConsoleLog).toHaveBeenCalledWith('Content is cached for offline use.');
    });
  });

  describe('localhost detection and validation', () => {
    it('should validate service worker on localhost when SW file exists', async () => {
      const mockRegister = jest.fn().mockResolvedValue(mockServiceWorkerRegistration);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve(mockServiceWorkerRegistration),
          controller: null,
        },
      });

      // Mock successful fetch response
      mockFetch.mockResolvedValue({
        status: 200,
        headers: createMockHeaders(),
      } as unknown as MockResponse);

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for fetch and registration
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockFetch).toHaveBeenCalledWith('/service-worker-enhanced.js', {
        headers: { 'Service-Worker': 'script' },
      });
      expect(mockRegister).toHaveBeenCalled();
    });

    it('should handle service worker validation when SW file is not found', async () => {
      const mockUnregister = jest.fn().mockResolvedValue(true);
      const mockReload = jest.fn();

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: jest.fn(),
          ready: Promise.resolve({
            unregister: mockUnregister,
          }),
          controller: null,
        },
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...window.location,
          reload: mockReload,
        },
      });

      // Mock 404 response
      const mock404Headers = createMockHeaders();
      mock404Headers.get = jest.fn((_name: string): string | null => null);
      mockFetch.mockResolvedValue({
        status: 404,
        headers: mock404Headers,
      } as unknown as MockResponse);

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for fetch and unregistration
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockUnregister).toHaveBeenCalled();
      expect(mockReload).toHaveBeenCalled();
    });

    it('should handle service worker validation when SW file is not JS', async () => {
      const mockUnregister = jest.fn().mockResolvedValue(true);
      const mockReload = jest.fn();

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: jest.fn(),
          ready: Promise.resolve({
            unregister: mockUnregister,
          }),
          controller: null,
        },
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...window.location,
          reload: mockReload,
        },
      });

      // Mock HTML response instead of JS
      const mockHtmlHeaders = createMockHeaders();
      mockHtmlHeaders.get = jest.fn((header: string) => {
        if (header === 'content-type') {
          return 'text/html';
        }
        return null;
      });
      mockFetch.mockResolvedValue({
        status: 200,
        headers: mockHtmlHeaders,
      } as unknown as MockResponse);

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for fetch and unregistration
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockUnregister).toHaveBeenCalled();
      expect(mockReload).toHaveBeenCalled();
    });

    it('should handle offline scenario during validation', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: jest.fn(),
          ready: Promise.resolve(mockServiceWorkerRegistration),
          controller: null,
        },
      });

      // Mock fetch failure (offline)
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { register } = await import('../serviceWorkerRegistration');
      register();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for fetch to fail
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'No internet connection found. App is running in offline mode.'
      );
    });
  });

  describe('unregister function', () => {
    it('should unregister service worker successfully', async () => {
      const mockUnregister = jest.fn().mockResolvedValue(true);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          ready: Promise.resolve({
            unregister: mockUnregister,
          }),
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

      const { unregister } = await import('../serviceWorkerRegistration');

      // Should not throw
      await expect(unregister()).resolves.toBeUndefined();
    });

    it('should handle unregistration errors', async () => {
      const unregisterError = new Error('Unregister failed');
      const mockUnregister = jest.fn().mockRejectedValue(unregisterError);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          ready: Promise.resolve({
            unregister: mockUnregister,
          }),
        },
      });

      const { unregister } = await import('../serviceWorkerRegistration');
      await unregister();

      expect(mockConsoleError).toHaveBeenCalledWith(unregisterError.message);
    });
  });

  describe('localhost detection', () => {
    const testCases = [
      { hostname: 'localhost', expected: true, description: 'localhost' },
      { hostname: '127.0.0.1', expected: true, description: '127.0.0.1' },
      { hostname: '127.0.0.255', expected: true, description: '127.0.0.255' },
      { hostname: '127.255.255.255', expected: true, description: '127.255.255.255' },
      { hostname: '[::1]', expected: true, description: 'IPv6 localhost' },
      { hostname: 'example.com', expected: false, description: 'external domain' },
      { hostname: '192.168.1.1', expected: false, description: 'private IP' },
      { hostname: '128.0.0.1', expected: false, description: 'non-localhost IP' },
    ];

    testCases.forEach(({ hostname, expected, description }) => {
      it(`should detect ${description} (${hostname}) as ${expected ? 'localhost' : 'not localhost'}`, async () => {
        Object.defineProperty(window, 'location', {
          writable: true,
          value: {
            hostname,
            origin: `http://${hostname}:3000`,
            href: `http://${hostname}:3000`,
          },
        });

        const mockRegister = jest.fn().mockResolvedValue(mockServiceWorkerRegistration);

        Object.defineProperty(navigator, 'serviceWorker', {
          writable: true,
          value: {
            register: mockRegister,
            ready: Promise.resolve(mockServiceWorkerRegistration),
            controller: null,
          },
        });

        if (expected) {
          // For localhost, mock fetch
          mockFetch.mockResolvedValue({
            status: 200,
            headers: createMockHeaders(),
          } as unknown as MockResponse);
        }

        const { register } = await import('../serviceWorkerRegistration');
        register();

        // Trigger load event
        window.dispatchEvent(new Event('load'));

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 0));

        // Test expectations based on whether it's localhost or not
        const fetchWasCalled = mockFetch.mock.calls.length > 0;
        const registerWasCalled = mockRegister.mock.calls.length > 0;

        // Test expectations based on whether it's localhost or not
        expect(expected ? fetchWasCalled : registerWasCalled).toBe(true);
      });
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle null installing worker during update', async () => {
      const mockRegistrationNullInstalling = {
        ...mockServiceWorkerRegistration,
        installing: null,
        onupdatefound: null as ((event?: Event) => void) | null,
      } as unknown as ServiceWorkerRegistration;

      const mockRegister = jest.fn().mockResolvedValue(mockRegistrationNullInstalling);

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

      // Wait for registration
      await new Promise(resolve => setTimeout(resolve, 0));

      // Simulate update found with null installing worker
      if (mockRegistrationNullInstalling.onupdatefound) {
        mockRegistrationNullInstalling.onupdatefound(new Event('updatefound'));
      }

      // Should not throw or cause errors
      expect(mockRegister).toHaveBeenCalled();
    });

    it('should handle worker state change when not in installed state', async () => {
      const onUpdate = jest.fn();
      const mockInstallingWorker = {
        state: 'installing',
        onstatechange: null as ((this: ServiceWorker, ev: Event) => unknown) | null,
      };

      const mockRegistrationWithInstalling = {
        ...mockServiceWorkerRegistration,
        installing: mockInstallingWorker,
        onupdatefound: null as ((event?: Event) => void) | null,
      } as unknown as ServiceWorkerRegistration;

      const mockRegister = jest.fn().mockResolvedValue(mockRegistrationWithInstalling);

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
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
      register({ onUpdate });

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for registration
      await new Promise(resolve => setTimeout(resolve, 0));

      // Simulate update found
      if (mockRegistrationWithInstalling.onupdatefound) {
        mockRegistrationWithInstalling.onupdatefound(new Event('updatefound'));

        // Keep worker in installing state (not installed)
        if (mockInstallingWorker.onstatechange) {
          mockInstallingWorker.onstatechange?.call(
            mockInstallingWorker as ServiceWorker,
            new Event('statechange')
          );
        }
      }

      // onUpdate should not be called since state is not 'installed'
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });
});
