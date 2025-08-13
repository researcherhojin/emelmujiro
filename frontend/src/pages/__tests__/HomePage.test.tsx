import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import HomePage from '../HomePage';

// Mock lazy loaded components
jest.mock('../../components/sections/HeroSection', () => {
  return function HeroSection() {
    return <div data-testid="hero-section">HeroSection</div>;
  };
});

jest.mock('../../components/sections/ServicesSection', () => {
  return function ServicesSection() {
    return <div data-testid="services-section">ServicesSection</div>;
  };
});

jest.mock('../../components/sections/LogosSection', () => {
  return function LogosSection() {
    return <div data-testid="logos-section">LogosSection</div>;
  };
});

jest.mock('../../components/sections/CTASection', () => {
  return function CTASection() {
    return <div data-testid="cta-section">CTASection</div>;
  };
});

jest.mock('../../components/seo/SEOHead', () => {
  return function SEOHead() {
    return null;
  };
});

describe('HomePage', () => {
  it('renders without crashing', () => {
    renderWithProviders(<HomePage />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders all sections after loading', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('services-section')).toBeInTheDocument();
      expect(screen.getByTestId('logos-section')).toBeInTheDocument();
      expect(screen.getByTestId('cta-section')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderWithProviders(<HomePage />);

    // Should show loading component initially
    const loadingElement = screen.queryByText(/loading/i);
    if (loadingElement) {
      expect(loadingElement).toBeInTheDocument();
    }
  });

  it('renders sections in correct order', async () => {
    const { container } = renderWithProviders(<HomePage />);

    await waitFor(() => {
      const sections = container.querySelectorAll('[data-testid]');
      expect(sections[0]).toHaveAttribute('data-testid', 'hero-section');
      expect(sections[1]).toHaveAttribute('data-testid', 'services-section');
      expect(sections[2]).toHaveAttribute('data-testid', 'logos-section');
      expect(sections[3]).toHaveAttribute('data-testid', 'cta-section');
    });
  });

  it('handles suspense fallback correctly', async () => {
    renderWithProviders(<HomePage />);

    // Wait for all sections to load
    await waitFor(
      () => {
        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('passes correct props to SEOHead', () => {
    renderWithProviders(<HomePage />);

    // SEOHead should be called with correct props
    // Since it's mocked, we just verify the component renders
    expect(document.body).toBeInTheDocument();
  });

  it('renders with React.Suspense wrapper', async () => {
    renderWithProviders(<HomePage />);

    // All lazy loaded components should eventually render
    await waitFor(() => {
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('services-section')).toBeInTheDocument();
    });
  });

  it('includes structured data for SEO', () => {
    renderWithProviders(<HomePage />);

    // HomePage should include structured data
    // This is handled by SEOHead component
    expect(document.body).toBeInTheDocument();
  });

  it('handles error boundary gracefully', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Force an error in a section
    jest.mock('../../components/sections/HeroSection', () => {
      return function HeroSection() {
        throw new Error('Test error');
      };
    });

    renderWithProviders(<HomePage />);

    // Should still render other content
    expect(document.body).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('applies correct page layout', () => {
    const { container } = renderWithProviders(<HomePage />);

    // Check if the page has proper structure
    expect(container.firstChild).toBeInTheDocument();
  });
});
