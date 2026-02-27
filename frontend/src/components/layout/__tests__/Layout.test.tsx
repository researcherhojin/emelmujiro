import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Mock child components to isolate Layout behavior
vi.mock('../../common/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('../../common/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../../common/SkipLink', () => ({
  default: () => <a data-testid="skip-link">Skip to content</a>,
}));

vi.mock('../../common/PWAInstallButton', () => ({
  default: () => <button data-testid="pwa-install">Install</button>,
}));

vi.mock('../../../hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: vi.fn(),
}));

vi.mock('../../../utils/accessibility', () => ({
  announceToScreenReader: vi.fn(),
}));

import Layout from '../Layout';

const renderLayout = (children?: React.ReactNode) => {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={children ? <Layout>{children}</Layout> : <Layout />}
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('Layout', () => {
  it('renders the Navbar, Footer, SkipLink, and PWAInstallButton', () => {
    renderLayout();

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('skip-link')).toBeInTheDocument();
    expect(screen.getByTestId('pwa-install')).toBeInTheDocument();
  });

  it('renders a main element with correct accessibility attributes', () => {
    renderLayout();

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('aria-label', 'Main content');
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('renders children when provided instead of Outlet', () => {
    renderLayout(<div data-testid="child-content">Hello World</div>);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('includes a screen-reader-only announcements region', () => {
    renderLayout();

    const announceRegion = document.getElementById('page-announcements');
    expect(announceRegion).toBeInTheDocument();
    expect(announceRegion).toHaveAttribute('role', 'status');
    expect(announceRegion).toHaveAttribute('aria-live', 'polite');
    expect(announceRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('includes keyboard shortcuts help for screen readers', () => {
    renderLayout();

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Press / to focus search')).toBeInTheDocument();
    expect(screen.getByText('Press Alt+H to go home')).toBeInTheDocument();
    expect(screen.getByText('Press Alt+B to go to blog')).toBeInTheDocument();
    expect(
      screen.getByText('Press Alt+C to go to contact')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Press Alt+P to go to profile')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Press Escape to close modals')
    ).toBeInTheDocument();
  });

  it('applies min-h-screen and flex layout classes to the wrapper div', () => {
    renderLayout();

    const wrapper = screen.getByRole('main').parentElement;
    expect(wrapper).toHaveClass('min-h-screen');
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('flex-col');
  });
});
