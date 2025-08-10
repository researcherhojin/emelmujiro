/* eslint-disable no-undef */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

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
    this.root = (options?.root instanceof Element ? options.root : null) || null;
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

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn(() => Promise.resolve()),
    ready: Promise.resolve({
      unregister: jest.fn(() => Promise.resolve()),
    }),
  },
});

// Mock classList - ensure it's always available
if (typeof DOMTokenList === 'undefined') {
  // Create a simple mock for classList if DOMTokenList doesn't exist
  Object.defineProperty(Element.prototype, 'classList', {
    get: function () {
      const self = this;
      return {
        add: function (...tokens: string[]) {
          tokens.forEach(token => {
            const className = self.className || '';
            if (!this.contains(token)) {
              self.className = className + (className ? ' ' : '') + token;
            }
          });
        },
        remove: function (...tokens: string[]) {
          tokens.forEach(token => {
            const className = self.className || '';
            self.className = className
              .replace(new RegExp(`(^|\\s)${token}(\\s|$)`, 'g'), ' ')
              .trim();
          });
        },
        contains: function (token: string) {
          const className = self.className || '';
          return new RegExp(`(^|\\s)${token}(\\s|$)`).test(className);
        },
        toggle: function (token: string, force?: boolean) {
          if (force === undefined) {
            if (this.contains(token)) {
              this.remove(token);
              return false;
            } else {
              this.add(token);
              return true;
            }
          } else {
            if (force) {
              this.add(token);
            } else {
              this.remove(token);
            }
            return force;
          }
        },
      };
    },
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
