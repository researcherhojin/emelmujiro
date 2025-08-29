/* eslint-disable no-undef */
// Vitest setup file
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { beforeAll, afterAll } from 'vitest';
import React from 'react';

// Mock lucide-react icons - comprehensive mock for all icons
vi.mock('lucide-react', () => {
  // Create a generic icon component factory
  const createIcon = (name: string) => {
    const Component = React.forwardRef<
      SVGSVGElement,
      React.SVGProps<SVGSVGElement>
    >((props, ref) => {
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
    });
    Component.displayName = name;
    return Component;
  };

  // Create LucideIcon type mock
  const LucideIcon = createIcon('LucideIcon');

  // Common icons that might be used
  const iconNames = [
    'Code',
    'GraduationCap',
    'BarChart3',
    'Database',
    'CheckCircle',
    'XCircle',
    'AlertCircle',
    'InfoIcon',
    'ChevronDown',
    'ChevronUp',
    'ChevronLeft',
    'ChevronRight',
    'Menu',
    'X',
    'Search',
    'Plus',
    'Minus',
    'Edit',
    'Trash',
    'Settings',
    'User',
    'Users',
    'Home',
    'Mail',
    'Phone',
    'Calendar',
    'Clock',
    'Download',
    'Upload',
    'File',
    'Folder',
    'Heart',
    'Star',
    'Globe',
    'Link',
    'Copy',
    'Check',
    'Save',
    'RefreshCw',
    'MoreVertical',
    'MoreHorizontal',
    'Eye',
    'EyeOff',
    'Lock',
    'Unlock',
    'Key',
    'Shield',
    'AlertTriangle',
    'HelpCircle',
    'MessageSquare',
    'Send',
    'Paperclip',
    'Image',
    'Video',
    'Mic',
    'Play',
    'Pause',
    'SkipForward',
    'SkipBack',
    'Volume2',
    'VolumeX',
    'Wifi',
    'WifiOff',
    'Bluetooth',
    'Battery',
    'BatteryLow',
    'Power',
    'Zap',
    'Cloud',
    'Sun',
    'Moon',
    'Droplet',
    'Wind',
    'Loader',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'CornerUpRight',
    'Hash',
    'AtSign',
    'DollarSign',
    'Percent',
    'Filter',
    'SortAsc',
    'BookOpen',
    'Book',
    'Bookmark',
    'Award',
    'Flag',
    'MapPin',
    'Navigation',
    'Compass',
    'Map',
    'Move',
    'Maximize',
    'Minimize',
    'LogIn',
    'LogOut',
    'UserPlus',
    'UserMinus',
    'UserCheck',
    'UserX',
    'Bell',
    'BellOff',
    'Inbox',
    'Archive',
    'Package',
    'ShoppingCart',
    'CreditCard',
    'Gift',
    'Briefcase',
    'Coffee',
    'Camera',
    'Layers',
    'Layout',
    'Grid',
    'List',
    'AlignLeft',
    'AlignCenter',
    'AlignRight',
    'Bold',
    'Italic',
    'Underline',
    'Link2',
    'Unlink',
    'Type',
    'FileText',
    'FilePlus',
    'FileMinus',
    'FolderPlus',
    'FolderMinus',
    'Printer',
    'Monitor',
    'Smartphone',
    'Tablet',
    'Laptop',
    'HardDrive',
    'Server',
    'Cpu',
    'Activity',
    'BarChart',
    'BarChart2',
    'PieChart',
    'TrendingUp',
    'TrendingDown',
    'Target',
    'Award',
    'ThumbsUp',
    'ThumbsDown',
    'ExternalLink',
    'Github',
    'Linkedin',
    'Twitter',
    'Facebook',
    'Instagram',
    'LayoutDashboard',
    'Trash2',
    'FileCode',
    'Languages',
    'UserCircle',
    'Bot',
    'MessageCircle',
    'ArrowUpRight',
    'Building2',
    'GraduationCap2',
    'Sparkles',
    'Brain',
    'Rocket',
    'ChartBar',
    'Share2',
    'Copy2',
    'AlertOctagon',
    'Info',
    'CheckCircle2',
    'XCircle2',
    'ArrowRight2',
    'ArrowLeft2',
    'Construction',
    'Building',
    'CalendarCheck',
    'Code2',
    'Lightbulb',
  ];

  // Create all icon exports
  const icons: Record<
    string,
    React.ForwardRefExoticComponent<
      React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
    >
  > = {
    LucideIcon,
  };

  iconNames.forEach((name) => {
    icons[name] = createIcon(name);
  });

  // Return a Proxy that creates any icon on demand
  return new Proxy(icons, {
    get: (target, prop) => {
      // Handle special module exports
      if (prop === '__esModule') return true;
      if (prop === 'default') return {};

      // Return existing icon if available
      if (prop in target) {
        return target[prop as string];
      }

      // Return a mock component for any icon name
      if (typeof prop === 'string') {
        return createIcon(prop);
      }

      return undefined;
    },
  });
});

// Import CI-specific setup if in CI environment
// Note: Dynamic imports are not supported in test setup files
// CI-specific setup should be handled differently in Vite

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
// gtag is already defined in @types/global.d.ts

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
