import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
  default: () => (
    <a href="#main-content" data-testid="skip-link">
      Skip to content
    </a>
  ),
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
          <Route path="/" element={children ? <Layout>{children}</Layout> : <Layout />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('Layout', () => {
  it('renders the Navbar, Footer, and SkipLink', () => {
    renderLayout();

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('skip-link')).toBeInTheDocument();
  });

  it('renders a main element with correct accessibility attributes', () => {
    renderLayout();

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('aria-label', 'accessibility.mainContent');
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

  it('applies min-h-screen and flex layout classes to the wrapper div', () => {
    renderLayout();

    const wrapper = screen.getByRole('main').parentElement;
    expect(wrapper).toHaveClass('min-h-screen');
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('flex-col');
  });

  describe('KakaoTalk banner', () => {
    beforeEach(() => {
      (window as Record<string, unknown>).__isKakaoInApp = true;
      (window as Record<string, unknown>).__isKakaoAndroid = false;
    });

    afterEach(() => {
      delete (window as Record<string, unknown>).__isKakaoInApp;
      delete (window as Record<string, unknown>).__isKakaoAndroid;
    });

    it('shows banner on iOS KakaoTalk', () => {
      renderLayout();
      expect(screen.getByText('common.kakaoBanner')).toBeInTheDocument();
      expect(screen.getByText('common.openExternal')).toBeInTheDocument();
    });

    it('opens external browser when button clicked', () => {
      renderLayout();
      const openBtn = screen.getByText('common.openExternal');
      // Should not throw when clicked
      fireEvent.click(openBtn);
    });

    it('dismisses banner when close button clicked', () => {
      renderLayout();
      expect(screen.getByText('common.kakaoBanner')).toBeInTheDocument();

      const closeBtn = screen.getByLabelText('common.close');
      fireEvent.click(closeBtn);

      expect(screen.queryByText('common.kakaoBanner')).not.toBeInTheDocument();
    });

    it('does not show banner on Android KakaoTalk', () => {
      (window as Record<string, unknown>).__isKakaoAndroid = true;
      renderLayout();
      expect(screen.queryByText('common.kakaoBanner')).not.toBeInTheDocument();
    });
  });
});
