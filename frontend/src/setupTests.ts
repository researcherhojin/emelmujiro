/* eslint-disable no-undef */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Import CI-specific setup if in CI environment
// Note: Dynamic imports are not supported in test setup files
// CI-specific setup should be handled differently in Vite

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
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

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
}

global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock Service Worker with complete API
const mockServiceWorkerRegistration = {
  installing: null,
  waiting: null,
  active: null,
  onupdatefound: null,
  unregister: jest.fn().mockResolvedValue(true),
  pushManager: {
    getSubscription: jest.fn().mockResolvedValue(null),
    subscribe: jest.fn().mockResolvedValue({}),
  },
};

const mockReady = Promise.resolve(mockServiceWorkerRegistration);

Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn(() => Promise.resolve(mockServiceWorkerRegistration)),
    ready: mockReady,
    controller: null,
    getRegistration: jest.fn(() =>
      Promise.resolve(mockServiceWorkerRegistration)
    ),
    getRegistrations: jest.fn(() => Promise.resolve([])),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
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
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(() => false),
    toggle: jest.fn(),
    replace: jest.fn(),
    item: jest.fn(),
    toString: jest.fn(() => ''),
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
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(() => false),
    toggle: jest.fn(),
    replace: jest.fn(),
    item: jest.fn(),
    toString: jest.fn(() => ''),
    length: 0,
    value: '',
  };

  Object.defineProperty(document.body, 'classList', {
    value: mockClassList,
    writable: true,
    configurable: true,
  });
}

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost',
    origin: 'http://localhost',
    pathname: '/',
    search: '',
    hash: '',
    reload: jest.fn(),
  },
});

// Suppress console errors and warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn((...args) => {
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

  console.warn = jest.fn((...args) => {
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

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn((_key: string): string | null => null),
  setItem: jest.fn((_key: string, _value: string): void => undefined),
  removeItem: jest.fn((_key: string): void => undefined),
  clear: jest.fn((): void => undefined),
  key: jest.fn((_index: number): string | null => null),
  length: 0,
};
global.localStorage = localStorageMock as Storage;

// Mock sessionStorage
global.sessionStorage = localStorageMock as Storage;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) =>
  setTimeout(cb, 0)
) as unknown as typeof requestAnimationFrame;
global.cancelAnimationFrame = jest.fn((id: number) =>
  clearTimeout(id)
) as unknown as typeof cancelAnimationFrame;

// Mock Notification API
global.Notification = {
  permission: 'default' as NotificationPermission,
  requestPermission: jest
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

(global as typeof globalThis & { gtag?: jest.Mock }).gtag = jest.fn();

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
  });
}

// Mock performance API
if (!global.performance) {
  const mockPerformance: Partial<Performance> = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
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
