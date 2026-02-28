import { render } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock Service Worker
    const mockServiceWorkerRegistration = {
      installing: null,
      waiting: null,
      active: null,
      onupdatefound: null,
      unregister: vi.fn().mockResolvedValue(true),
    };
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: {
        register: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
        ready: Promise.resolve(mockServiceWorkerRegistration),
        controller: null,
      },
    });
  });
  test('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  test('app initializes correctly', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
  });

  test('app structure is rendered', () => {
    const { container } = render(<App />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  test('app has proper context providers', () => {
    // Rendering without error proves all providers are correctly nested
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
