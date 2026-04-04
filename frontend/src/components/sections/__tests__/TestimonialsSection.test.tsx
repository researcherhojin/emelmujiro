import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TestimonialsSection from '../TestimonialsSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

describe('TestimonialsSection', () => {
  it('renders section title and subtitle', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText('testimonials.title')).toBeInTheDocument();
    expect(screen.getByText('testimonials.subtitle')).toBeInTheDocument();
  });

  it('renders enterprise and government testimonials', () => {
    render(<TestimonialsSection />);
    // Enterprise row (8 items x 5 copies = 40) + Government row (8 items x 5 copies = 40) = 80 cards
    const cards = screen.getAllByText('testimonials.enterprise1');
    expect(cards.length).toBe(5); // 5 copies of the first enterprise testimonial
  });

  it('renders source link to hrd.go.kr', () => {
    render(<TestimonialsSection />);
    const link = screen.getByText('testimonials.source');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', 'https://www.hrd.go.kr');
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
    expect(link.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has aria-label on section', () => {
    const { container } = render(<TestimonialsSection />);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'testimonials.sectionLabel');
  });

  it('has displayName set', () => {
    expect(TestimonialsSection.displayName).toBe('TestimonialsSection');
  });

  it('pauses animation on touch start and resumes on touch end', () => {
    const { container } = render(<TestimonialsSection />);

    const scrollContainers = container.querySelectorAll(
      '.animate-scroll-testimonial, .animate-scroll-testimonial-reverse'
    );
    expect(scrollContainers.length).toBe(2);

    // Test both rows
    scrollContainers.forEach((el) => {
      const htmlEl = el as HTMLElement;

      fireEvent.touchStart(htmlEl);
      expect(htmlEl.style.animationPlayState).toBe('paused');

      fireEvent.touchEnd(htmlEl);
      expect(htmlEl.style.animationPlayState).toBe('running');
    });
  });

  it('renders testimonial cards with quote icon and program text', () => {
    render(<TestimonialsSection />);
    // Government row has cvProgram and startupProgram
    const cvPrograms = screen.getAllByText('testimonials.cvProgram');
    expect(cvPrograms.length).toBeGreaterThan(0);

    const startupPrograms = screen.getAllByText('testimonials.startupProgram');
    expect(startupPrograms.length).toBeGreaterThan(0);
  });
});
