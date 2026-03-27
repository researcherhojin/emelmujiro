import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock i18n module
vi.mock('../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

// Mock analytics
vi.mock('../utils/analytics', () => ({
  trackPageView: vi.fn(),
}));

// Mock constants
vi.mock('../utils/constants', () => ({
  SITE_URL: 'https://example.com',
}));

// Mock Layout component
vi.mock('../components/layout/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

// Mock UnifiedLoading
vi.mock('../components/common/UnifiedLoading', () => ({
  PageLoading: () => <div data-testid="page-loading">Loading...</div>,
}));

// Mock ErrorBoundary
vi.mock('../components/common/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock context providers as pass-throughs
vi.mock('../contexts/BlogContext', () => ({
  BlogProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../contexts/UIContext', () => ({
  UIProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock all lazy-loaded components to lightweight stubs
vi.mock('../components/common/SEOHelmet', () => ({
  default: () => <div data-testid="seo-helmet">SEOHelmet</div>,
}));

vi.mock('../components/common/StructuredData', () => ({
  default: ({ type }: { type: string }) => (
    <div data-testid={`structured-data-${type}`}>StructuredData</div>
  ),
}));

vi.mock('../components/common/WebVitalsDashboard', () => ({
  default: () => <div data-testid="web-vitals">WebVitalsDashboard</div>,
}));

vi.mock('../components/sections/HeroSection', () => ({
  default: () => <div data-testid="hero-section">HeroSection</div>,
}));

vi.mock('../components/sections/ServicesSection', () => ({
  default: () => <div data-testid="services-section">ServicesSection</div>,
}));

vi.mock('../components/sections/LogosSection', () => ({
  default: () => <div data-testid="logos-section">LogosSection</div>,
}));

vi.mock('../components/sections/CTASection', () => ({
  default: () => <div data-testid="cta-section">CTASection</div>,
}));

vi.mock('../components/pages/ProfilePage', () => ({
  default: () => <div data-testid="profile-page">ProfilePage</div>,
}));

// AboutPage route removed — component file retained for potential restoration

vi.mock('../components/pages/SharePage', () => ({
  default: () => <div data-testid="share-page">SharePage</div>,
}));

vi.mock('../components/common/NotFound', () => ({
  default: () => <div data-testid="not-found">NotFound</div>,
}));

vi.mock('../components/pages/ContactPage', () => ({
  default: () => <div data-testid="contact-page">ContactPage</div>,
}));

vi.mock('../components/blog/BlogListPage', () => ({
  default: () => <div data-testid="blog-list-page">BlogListPage</div>,
}));

vi.mock('../components/blog/BlogDetail', () => ({
  default: () => <div data-testid="blog-detail">BlogDetail</div>,
}));

vi.mock('../components/blog/BlogEditor', () => ({
  default: () => <div data-testid="blog-editor">BlogEditor</div>,
}));

vi.mock('../components/pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">LoginPage</div>,
}));

// Helper: set URL before importing App so createBrowserRouter picks it up
const setUrl = (pathname: string) => {
  Object.defineProperty(window, 'location', {
    writable: true,
    configurable: true,
    value: {
      href: `http://localhost${pathname}`,
      pathname,
      origin: 'http://localhost',
      hostname: 'localhost',
      port: '',
      protocol: 'http:',
      search: '',
      hash: '',
      reload: vi.fn(),
    },
  });
  // Also push state so the history API reflects the path
  window.history.pushState({}, '', pathname);
};

describe('App', () => {
  beforeEach(() => {
    // Reset App module between tests so createBrowserRouter re-reads the URL
    vi.resetModules();
  });

  it('renders the homepage with all sections at /', async () => {
    setUrl('/');
    const { default: App } = await import('../App');

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    expect(screen.getByTestId('services-section')).toBeInTheDocument();
    expect(screen.getByTestId('logos-section')).toBeInTheDocument();
    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
    expect(screen.getByTestId('web-vitals')).toBeInTheDocument();
    expect(window.__appLoaded).toBe(true);
  });

  it('renders the contact page at /contact', async () => {
    setUrl('/contact');
    const { default: App } = await import('../App');

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('contact-page')).toBeInTheDocument();
    });
  });

  it('renders the blog list page at /blog', async () => {
    setUrl('/blog');
    const { default: App } = await import('../App');

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('blog-list-page')).toBeInTheDocument();
    });
  });

  it('renders the blog detail page at /blog/:id', async () => {
    setUrl('/blog/123');
    const { default: App } = await import('../App');

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('blog-detail')).toBeInTheDocument();
    });
  });

  it('renders the blog editor at /blog/new', async () => {
    setUrl('/blog/new');
    const { default: App } = await import('../App');

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
    });
  });

  it('renders the profile page at /profile', async () => {
    setUrl('/profile');
    const { default: App } = await import('../App');

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });
  });

  it('renders the share page at /share', async () => {
    setUrl('/share');
    const { default: App } = await import('../App');

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('share-page')).toBeInTheDocument();
    });
  });

  it('renders the login page at /login', async () => {
    setUrl('/login');
    const { default: App } = await import('../App');

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('renders NotFound for unknown routes', async () => {
    setUrl('/some/unknown/route');
    const { default: App } = await import('../App');

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });
  });
});
