import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CTASection from '../CTASection';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

describe('CTASection', () => {
  it('renders the section label', () => {
    render(<CTASection />);
    expect(screen.getByText('cta.sectionLabel')).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<CTASection />);
    expect(screen.getByText('cta.title')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<CTASection />);
    expect(screen.getByText('cta.subtitle')).toBeInTheDocument();
  });

  it('renders the email CTA link', () => {
    render(<CTASection />);
    const ctaLink = screen.getByText('common.inquireByEmail');
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink.closest('a')).toHaveAttribute(
      'href',
      'mailto:researcherhojin@gmail.com'
    );
  });

  it('has correct aria-label on the section', () => {
    render(<CTASection />);
    const section = screen.getByLabelText('accessibility.ctaSection');
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe('SECTION');
  });

  it('has correct aria-label on the email link', () => {
    render(<CTASection />);
    const link = screen.getByLabelText('cta.emailAriaLabel');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  it('has displayName set', () => {
    expect(CTASection.displayName).toBe('CTASection');
  });

  it('renders headings at correct levels', () => {
    render(<CTASection />);
    const h2 = screen.getByText('cta.sectionLabel');
    expect(h2.tagName).toBe('H2');

    const h3 = screen.getByText('cta.title');
    expect(h3.tagName).toBe('H3');
  });
});
