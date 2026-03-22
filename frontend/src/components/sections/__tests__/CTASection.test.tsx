import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CTASection from '../CTASection';

// Mock analytics
const mockTrackCtaClick = vi.fn();
vi.mock('../../../utils/analytics', () => ({
  trackCtaClick: (...args: unknown[]) => mockTrackCtaClick(...args),
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
    const label = screen.getByText('cta.sectionLabel');
    expect(label.tagName).toBe('SPAN');

    const h2 = screen.getByText('cta.title');
    expect(h2.tagName).toBe('H2');
  });

  it('calls trackCtaClick with "cta" when CTA link is clicked', () => {
    renderWithRouter(<CTASection />);
    const ctaLink = screen.getByText('common.inquireProject');
    fireEvent.click(ctaLink);
    expect(mockTrackCtaClick).toHaveBeenCalledWith('cta');
  });
});
