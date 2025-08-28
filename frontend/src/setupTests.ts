/* eslint-disable no-undef */
// Vitest setup file
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { beforeAll, afterAll } from 'vitest';
import React from 'react';

// Mock lucide-react icons - create a Proxy to handle any icon dynamically
vi.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        // Return a mock component for any icon name
        if (typeof prop === 'string') {
          return () => React.createElement('div', null, prop);
        }
        return undefined;
      },
    }
  );
});

// Import CI-specific setup if in CI environment
// Note: Dynamic imports are not supported in test setup files
// CI-specific setup should be handled differently in Vite

// Mock window dialog methods
window.alert = vi.fn();
window.confirm = vi.fn(() => true);
window.prompt = vi.fn(() => null);

// Mock CSS.supports for CSS parsing errors
if (!window.CSS) {
  window.CSS = {} as typeof window.CSS;
}
if (!window.CSS.supports) {
  window.CSS.supports = vi.fn(() => false);
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    this.root =
      (options?.root instanceof Element ? options.root : null) || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold || 0];
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock Service Worker with complete API
const mockServiceWorkerRegistration = {
  installing: null,
  waiting: null,
  active: null,
  onupdatefound: null,
  unregister: vi.fn().mockResolvedValue(true),
  pushManager: {
    getSubscription: vi.fn().mockResolvedValue(null),
    subscribe: vi.fn().mockResolvedValue({}),
  },
};

const mockReady = Promise.resolve(mockServiceWorkerRegistration);

Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: vi.fn(() => Promise.resolve(mockServiceWorkerRegistration)),
    ready: mockReady,
    controller: null,
    getRegistration: vi.fn(() =>
      Promise.resolve(mockServiceWorkerRegistration)
    ),
    getRegistrations: vi.fn(() => Promise.resolve([])),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
});

// Ensure ready.then is always available
if (!navigator.serviceWorker.ready || !navigator.serviceWorker.ready.then) {
  Object.defineProperty(navigator.serviceWorker, 'ready', {
    value: mockReady,
    writable: true,
  });
}

// Mock classList - ensure it's always available
// Ensure document elements have classList
if (!document.documentElement.classList) {
  const mockClassList = {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(() => false),
    toggle: vi.fn(),
    replace: vi.fn(),
    item: vi.fn(),
    toString: vi.fn(() => ''),
    length: 0,
    value: '',
  };

  Object.defineProperty(document.documentElement, 'classList', {
    value: mockClassList,
    writable: true,
    configurable: true,
  });
}

if (!document.body.classList) {
  const mockClassList = {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(() => false),
    toggle: vi.fn(),
    replace: vi.fn(),
    item: vi.fn(),
    toString: vi.fn(() => ''),
    length: 0,
    value: '',
  };

  Object.defineProperty(document.body, 'classList', {
    value: mockClassList,
    writable: true,
    configurable: true,
  });
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost',
    origin: 'http://localhost',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
  },
});

// Suppress console errors and warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn((...args) => {
    // Only suppress known React warnings
    const message = args[0]?.toString() || '';
    if (
      message.includes('Warning: ReactDOM.render') ||
      message.includes('Warning: unmountComponentAtNode') ||
      message.includes('Not implemented: navigation') ||
      message.includes('Not implemented: HTMLFormElement.submit')
    ) {
      return;
    }
    originalError.apply(console, args);
  });

  console.warn = vi.fn((...args) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('componentWillReceiveProps') ||
      message.includes('componentWillUpdate')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  });
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) =>
  setTimeout(cb, 0)
) as unknown as typeof requestAnimationFrame;
global.cancelAnimationFrame = vi.fn((id: number) =>
  clearTimeout(id)
) as unknown as typeof cancelAnimationFrame;

// Mock Notification API
global.Notification = {
  permission: 'default' as NotificationPermission,
  requestPermission: vi
    .fn()
    .mockResolvedValue('granted' as NotificationPermission),
} as unknown as typeof Notification;

// Mock navigator properties
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'ko-KR',
});

// Mock window.gtag for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

(global as typeof globalThis & { gtag?: ReturnType<typeof vi.fn> }).gtag =
  vi.fn();

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue({}),
    text: vi.fn().mockResolvedValue(''),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
  });
}

// Mock performance API
if (!global.performance) {
  const mockPerformance: Partial<Performance> = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  };
  global.performance = mockPerformance as Performance;
}

// Mock document.documentElement.lang
Object.defineProperty(document.documentElement, 'lang', {
  writable: true,
  value: 'ko',
});

// Mock window.innerWidth and innerHeight
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 768,
});
