import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AboutPage from '../AboutPage';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options?.returnObjects) return key;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

describe('AboutPage', () => {
  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <HelmetProvider>
          <AboutPage />
        </HelmetProvider>
      </MemoryRouter>
    );
  };

  it('renders about page with main heading', () => {
    renderWithRouter();

    expect(screen.getByText('about.title')).toBeInTheDocument();
  });

  it('renders company introduction section', () => {
    renderWithRouter();

    expect(screen.getByText('about.subtitle')).toBeInTheDocument();
    expect(screen.getByText('about.sectionLabel')).toBeInTheDocument();
  });

  it('renders mission section', () => {
    renderWithRouter();

    expect(screen.getByText('about.mission.title')).toBeInTheDocument();
    expect(screen.getByText('about.mission.description')).toBeInTheDocument();
  });

  it('renders timeline section', () => {
    renderWithRouter();

    expect(screen.getByText('about.journey.title')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('renders core values section', () => {
    renderWithRouter();

    expect(screen.getByText('about.values.title')).toBeInTheDocument();

    // Check for actual core value items from the component (i18n keys)
    expect(screen.getByText('about.values.practical.title')).toBeInTheDocument();
    expect(screen.getByText('about.values.custom.title')).toBeInTheDocument();
    expect(screen.getByText('about.values.latest.title')).toBeInTheDocument();
  });

  it('renders values section label', () => {
    renderWithRouter();

    expect(screen.getByText('about.values.sectionLabel')).toBeInTheDocument();
  });

  it('renders company stats section', () => {
    renderWithRouter();

    expect(screen.getByText('1,000+')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByText('30+')).toBeInTheDocument();
    expect(screen.getByText('4.8+')).toBeInTheDocument();
  });

  it('renders contact CTA section', () => {
    renderWithRouter();

    expect(screen.getByText('about.ctaTitle')).toBeInTheDocument();
    expect(screen.getByText('common.inquireProject')).toBeInTheDocument();
  });

  it('has link to contact page in CTA section', () => {
    renderWithRouter();

    const ctaLink = screen.getByText('common.inquireProject');
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink.closest('a')).toHaveAttribute('href', '/contact');
  });

  it('renders with proper semantic structure', () => {
    renderWithRouter();

    // Check that sections exist by looking for section headings (i18n keys)
    expect(screen.getByText('about.mission.title')).toBeInTheDocument();
    expect(screen.getByText('about.values.title')).toBeInTheDocument();
    expect(screen.getByText('about.achievements.title')).toBeInTheDocument();
  });

  it('renders values and services with their content', () => {
    renderWithRouter();

    // Check that value items are rendered (i18n keys)
    expect(screen.getByText('about.values.practical.title')).toBeInTheDocument();
    expect(screen.getByText('about.values.custom.title')).toBeInTheDocument();
    expect(screen.getByText('about.values.latest.title')).toBeInTheDocument();
  });

  it('displays timeline section', () => {
    renderWithRouter();

    expect(screen.getByText('about.journey.title')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('displays all value descriptions', () => {
    renderWithRouter();

    expect(screen.getByText('about.values.practical.description')).toBeInTheDocument();
    expect(screen.getByText('about.values.custom.description')).toBeInTheDocument();
    expect(screen.getByText('about.values.latest.description')).toBeInTheDocument();
  });
});
