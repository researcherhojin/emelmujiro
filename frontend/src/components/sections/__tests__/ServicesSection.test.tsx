import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Override global i18n mock — returnObjects must return an array for details
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { returnObjects?: boolean }) => {
      if (options?.returnObjects) return ['Detail 1', 'Detail 2'];
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children?: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

import ServicesSection from '../ServicesSection';

describe('ServicesSection Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test('renders section title', () => {
    renderWithRouter(<ServicesSection />);
    expect(screen.getByText('services.title')).toBeInTheDocument();
  });

  test('renders section subtitle', () => {
    renderWithRouter(<ServicesSection />);
    expect(screen.getByText('services.subtitle')).toBeInTheDocument();
  });

  test('renders all service cards', () => {
    renderWithRouter(<ServicesSection />);

    expect(screen.getByText('services.education.title')).toBeInTheDocument();
    expect(screen.getByText('services.consulting.title')).toBeInTheDocument();
    expect(screen.getByText('services.llmGenai.title')).toBeInTheDocument();
    expect(screen.getByText('services.computerVision.title')).toBeInTheDocument();
  });

  test('renders service descriptions', () => {
    renderWithRouter(<ServicesSection />);

    expect(screen.getByText('services.education.description')).toBeInTheDocument();
    expect(screen.getByText('services.consulting.description')).toBeInTheDocument();
    expect(screen.getByText('services.llmGenai.description')).toBeInTheDocument();
  });

  test('renders service detail list items (line 49)', () => {
    renderWithRouter(<ServicesSection />);

    // returnObjects mock returns ['Detail 1', 'Detail 2'] — rendered as <li> items
    const details = screen.getAllByText('Detail 1');
    expect(details.length).toBe(4); // 4 service cards × 1 "Detail 1" each
  });

  test('service cards have proper content', () => {
    renderWithRouter(<ServicesSection />);

    expect(screen.getByText('services.education.description')).toBeInTheDocument();
    expect(screen.getByText('services.consulting.description')).toBeInTheDocument();
    expect(screen.getByText('services.computerVision.description')).toBeInTheDocument();
  });
});
