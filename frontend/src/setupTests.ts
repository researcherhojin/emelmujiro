/* eslint-disable no-undef */
// Vitest setup file
import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// React Testing Library cleanup (vitest config handles mock clearing/restoring via clearMocks + restoreMocks + mockReset)
afterEach(() => {
  cleanup();
});

// Global mock for react-i18next — default for all test files
// Tests needing custom t() behavior (e.g. opts.count formatting) can override with vi.mock()
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children?: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock lucide-react icons — Proxy creates and caches any icon component on demand
vi.mock('lucide-react', () => {
  const createIcon = (name: string) => {
    const Component = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
      (props, ref) => {
        return React.createElement(
          'svg',
          {
            ...props,
            ref,
            'data-testid': `icon-${name}`,
            'aria-label': name,
          },
          React.createElement('title', null, name)
        );
      }
    );
    Component.displayName = name;
    return Component;
  };

  const cache: Record<string, unknown> = {};

  return new Proxy(cache, {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      if (prop === 'default') return {};
      if (typeof prop === 'string') {
        if (!(prop in target)) {
          target[prop] = createIcon(prop);
        }
        return target[prop];
      }
      return undefined;
    },
  });
});

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');

  // Create motion components that just render the element with props
  const createMotionComponent = (element: string) => {
    return React.forwardRef(
      (props: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLElement>) => {
        const { children, ...rest } = props;
        // Remove motion-specific props
        const filteredProps = Object.keys(rest).reduce((acc: Record<string, unknown>, key) => {
          if (
            !key.startsWith('animate') &&
            !key.startsWith('initial') &&
            !key.startsWith('exit') &&
            !key.startsWith('transition') &&
            !key.startsWith('whileHover') &&
            !key.startsWith('whileTap') &&
            !key.startsWith('whileDrag') &&
            !key.startsWith('whileFocus') &&
            !key.startsWith('whileInView') &&
            !key.startsWith('variants') &&
            !key.startsWith('layout') &&
            !key.startsWith('drag')
          ) {
            acc[key] = rest[key];
          }
          return acc;
        }, {});

        return React.createElement(element, { ...filteredProps, ref }, children);
      }
    );
  };

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => createMotionComponent(prop),
      }
    ),
    AnimatePresence: ({ children }: React.PropsWithChildren) =>
      React.createElement(React.Fragment, null, children),
    useAnimation: () => ({
      start: vi.fn(),
      set: vi.fn(),
      stop: vi.fn(),
      mount: vi.fn(),
    }),
    useMotionValue: (initial: unknown) => ({
      get: () => initial,
      set: vi.fn(),
      onChange: vi.fn(),
      destroy: vi.fn(),
      isAnimating: () => false,
    }),
    useTransform: (value: unknown, _inputRange: unknown[], _outputRange: unknown[]) => value,
    useSpring: (value: unknown) => value,
    useScroll: () => ({
      scrollX: { get: () => 0 },
      scrollY: { get: () => 0 },
      scrollXProgress: { get: () => 0 },
      scrollYProgress: { get: () => 0 },
    }),
    useViewportScroll: () => ({
      scrollX: { get: () => 0 },
      scrollY: { get: () => 0 },
      scrollXProgress: { get: () => 0 },
      scrollYProgress: { get: () => 0 },
    }),
    useReducedMotion: () => false,
    usePresence: () => [true, vi.fn()],
    useIsPresent: () => true,
    useAnimate: () => [null, vi.fn()],
    useAnimationControls: () => ({
      start: vi.fn(),
      set: vi.fn(),
      stop: vi.fn(),
      mount: vi.fn(),
    }),
    useInView: () => true,
    domAnimation: {},
    LazyMotion: ({ children }: React.PropsWithChildren) => children,
  };
});

// Mock react-helmet-async to prevent classList errors
vi.mock('react-helmet-async', () => {
  const React = require('react');

  // Mock Helmet component that just renders children without DOM manipulation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Helmet = ({ children }: { children?: React.ReactNode }) => {
    // Don't render anything to DOM, just return null
    // This prevents any classList manipulation errors
    return null;
  };

  // Mock HelmetProvider
  const HelmetProvider = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
  };

  // Mock HelmetData class
  class HelmetData {
    context = {
      helmet: {
        title: { toComponent: () => null },
        meta: { toComponent: () => null },
        link: { toComponent: () => null },
        script: { toComponent: () => null },
        style: { toComponent: () => null },
        base: { toComponent: () => null },
        noscript: { toComponent: () => null },
        htmlAttributes: { toComponent: () => null },
        bodyAttributes: { toComponent: () => null },
      },
    };
  }

  return {
    Helmet,
    HelmetProvider,
    HelmetData,
  };
});

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
  readonly scrollMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    this.root = (options?.root instanceof Element ? options.root : null) || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.scrollMargin = '0px';
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold || 0];
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock navigator.serviceWorker (minimal — PWA removed, but main.tsx cleanup and blogCache still reference it)
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    getRegistrations: vi.fn(() => Promise.resolve([])),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
});

// Mock classList - ensure it's always available
// Create a proper classList mock
const createClassListMock = () => ({
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(() => false),
  toggle: vi.fn(),
  replace: vi.fn(),
  item: vi.fn(),
  toString: vi.fn(() => ''),
  length: 0,
  value: '',
  forEach: vi.fn(),
  entries: vi.fn(),
  keys: vi.fn(),
  values: vi.fn(),
});

// Always ensure classList is available on document elements
const documentElementClassList = createClassListMock();
const documentBodyClassList = createClassListMock();

Object.defineProperty(document.documentElement, 'classList', {
  get() {
    return documentElementClassList;
  },
  set() {
    /* ignore */
  },
  configurable: true,
});

Object.defineProperty(document.body, 'classList', {
  get() {
    return documentBodyClassList;
  },
  set() {
    /* ignore */
  },
  configurable: true,
});

// Global mock for getPropertyValue to prevent errors in CI
const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
CSSStyleDeclaration.prototype.getPropertyValue = function (prop: string) {
  if (this === undefined || this === null) {
    return '';
  }
  try {
    return originalGetPropertyValue.call(this, prop);
  } catch {
    return '';
  }
};

// Global mock for scrollIntoView
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// Ensure style property exists
if (!document.documentElement.style) {
  Object.defineProperty(document.documentElement, 'style', {
    value: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
      getPropertyValue: vi.fn(() => ''),
    },
    writable: true,
    configurable: true,
  });
}

// Also ensure classList is available on any created elements
const originalCreateElement = document.createElement.bind(document);
document.createElement = function (tagName: string) {
  const element = originalCreateElement(tagName);
  if (!element.classList) {
    Object.defineProperty(element, 'classList', {
      value: createClassListMock(),
      writable: true,
      configurable: true,
    });
  }
  return element;
};

// Patch Element prototype to ensure classList is always available
const ensureClassList = (element: Element | HTMLElement | null): void => {
  if (element && !element.classList) {
    Object.defineProperty(element, 'classList', {
      value: createClassListMock(),
      writable: true,
      configurable: true,
    });
  }
};

// Override querySelector methods to ensure classList
const originalQuerySelector = document.querySelector.bind(document);
document.querySelector = function (selector: string) {
  const element = originalQuerySelector(selector);
  if (element) {
    ensureClassList(element);
  }
  return element;
};

const originalQuerySelectorAll = document.querySelectorAll.bind(document);
document.querySelectorAll = function (selector: string) {
  const elements = originalQuerySelectorAll(selector);
  elements.forEach((element) => ensureClassList(element));
  return elements;
};

// Ensure classList for getElementById
const originalGetElementById = document.getElementById.bind(document);
document.getElementById = function (id: string): HTMLElement | null {
  const element = originalGetElementById(id);
  if (element) {
    ensureClassList(element);
  }
  return element;
};

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

// Mock history API for react-router
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    replaceState: vi.fn(),
    pushState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    length: 1,
    scrollRestoration: 'auto',
    state: null,
  },
});

// Also set globalHistory for compatibility
(global as unknown as { globalHistory: History }).globalHistory = window.history;

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
    if (message.includes('componentWillReceiveProps') || message.includes('componentWillUpdate')) {
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

// Mock navigator properties
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'ko-KR',
});

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
