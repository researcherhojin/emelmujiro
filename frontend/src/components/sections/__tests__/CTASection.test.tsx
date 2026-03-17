import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CTASection from '../CTASection';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CTASection', () => {
  it('renders the section label', () => {
    renderWithRouter(<CTASection />);
    expect(screen.getByText('cta.sectionLabel')).toBeInTheDocument();
  });

  it('renders the title', () => {
    renderWithRouter(<CTASection />);
    expect(screen.getByText('cta.title')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderWithRouter(<CTASection />);
    expect(screen.getByText('cta.subtitle')).toBeInTheDocument();
  });

  it('renders the CTA link to contact page', () => {
    renderWithRouter(<CTASection />);
    const ctaLink = screen.getByText('common.inquireProject');
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink.closest('a')).toHaveAttribute('href', '/contact');
  });

  it('has correct aria-label on the section', () => {
    renderWithRouter(<CTASection />);
    const section = screen.getByLabelText('accessibility.ctaSection');
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe('SECTION');
  });

  it('has displayName set', () => {
    expect(CTASection.displayName).toBe('CTASection');
  });

  it('renders headings at correct levels', () => {
    renderWithRouter(<CTASection />);
    const h2 = screen.getByText('cta.sectionLabel');
    expect(h2.tagName).toBe('H2');

    const h3 = screen.getByText('cta.title');
    expect(h3.tagName).toBe('H3');
  });
});
