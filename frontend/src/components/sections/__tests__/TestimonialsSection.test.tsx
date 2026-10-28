import React from 'react';
import { vi, describe, it, expect, afterEach } from 'vitest';
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

const rowsOf = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      '.animate-scroll-testimonial, .animate-scroll-testimonial-reverse'
    )
  );

const mockReducedMotion = (matches: boolean) => {
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion') ? matches : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList
  );
};

describe('TestimonialsSection', () => {
  afterEach(() => mockReducedMotion(false));

  it('renders section title and subtitle', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText('testimonials.title')).toBeInTheDocument();
    expect(screen.getByText('testimonials.subtitle')).toBeInTheDocument();
  });

  it('renders enterprise and government testimonials', () => {
    render(<TestimonialsSection />);
    // Enterprise row (8 items x 2 copies = 16) + Government row (8 items x 2 copies = 16) = 32 cards
    // Reduced from 5x copies to 2x for dom-size optimization (see tailwind.config.js).
    const cards = screen.getAllByText('testimonials.enterprise1');
    expect(cards.length).toBe(2); // 2 copies of the first enterprise testimonial
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

  it('pauses on touch start and resumes on touch end', () => {
    const { container } = render(<TestimonialsSection />);
    const rows = rowsOf(container);
    expect(rows).toHaveLength(2);

    rows.forEach((row) => {
      fireEvent.touchStart(row);
      expect(row.style.animationPlayState).toBe('paused');
      fireEvent.touchEnd(row);
      expect(row.style.animationPlayState).toBe('');
    });
  });

  it('button toggles both rows of the section', () => {
    const { container } = render(<TestimonialsSection />);
    const rows = rowsOf(container);

    fireEvent.click(screen.getByRole('button', { name: 'carousel.pauseTestimonials' }));
    rows.forEach((row) => {
      expect(row.style.animationPlayState).toBe('paused');
      expect(row).toHaveAttribute('data-playing', 'false');
    });

    fireEvent.click(screen.getByRole('button', { name: 'carousel.playTestimonials' }));
    rows.forEach((row) => {
      expect(row.style.animationPlayState).toBe('');
      expect(row).toHaveAttribute('data-playing', 'true');
    });
  });

  it('touchend after a pause leaves the row paused', () => {
    const { container } = render(<TestimonialsSection />);
    const row = rowsOf(container)[0];

    fireEvent.click(screen.getByRole('button', { name: 'carousel.pauseTestimonials' }));
    fireEvent.touchStart(row);
    fireEvent.touchEnd(row);
    expect(row.style.animationPlayState).toBe('paused');
  });

  it('starts paused under reduced motion and the button offers play', () => {
    mockReducedMotion(true);
    const { container } = render(<TestimonialsSection />);
    rowsOf(container).forEach((row) => {
      expect(row.style.animationPlayState).toBe('paused');
      expect(row).toHaveAttribute('data-playing', 'false');
    });

    fireEvent.click(screen.getByRole('button', { name: 'carousel.playTestimonials' }));
    rowsOf(container).forEach((row) => {
      expect(row).toHaveAttribute('data-playing', 'true');
      expect(row.style.animationPlayState).toBe('');
    });
  });

  it('hides exactly half of each row from assistive tech', () => {
    const { container } = render(<TestimonialsSection />);
    rowsOf(container).forEach((row) => {
      expect(row.children).toHaveLength(16);
      expect(row.querySelectorAll(':scope > [aria-hidden="true"]')).toHaveLength(8);
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
