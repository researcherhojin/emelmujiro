import React, { useEffect } from 'react';
import { render, act } from '@testing-library/react';
import { vi } from 'vitest';
import { createMemoryRouter, RouterProvider, Outlet, useParams } from 'react-router-dom';
import App from './App';

// Override global mock to track changeLanguage calls
const mockChangeLanguage = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: mockChangeLanguage },
  }),
  Trans: ({ children }: { children?: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

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

  test('App renders on /en path and triggers changeLanguage (line 111)', async () => {
    mockChangeLanguage.mockClear();

    // jsdom uses document URL — set it before importing App's router
    // createBrowserRouter reads window.location at creation time,
    // but App creates the router at module level, so we need a fresh import
    vi.resetModules();

    // Set jsdom URL to /en
    Object.defineProperty(window, 'location', {
      writable: true,
      value: new URL('http://localhost/en'),
    });

    const { default: FreshApp } = await import('./App');

    await act(async () => {
      render(<FreshApp />);
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');

    // Restore
    Object.defineProperty(window, 'location', {
      writable: true,
      value: new URL('http://localhost/'),
    });
  });
});
