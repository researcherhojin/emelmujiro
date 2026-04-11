import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LogosSection from '../LogosSection';

// Override global i18n mock — this test needs custom t() behavior
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      if (options?.name) return `${key} ${options.name}`;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock constants - provide a smaller set for testing
vi.mock('../../../constants', () => ({
  PARTNER_COMPANIES: [
    {
      id: 'company-a',
      name: 'Company A',
      logo: '/logos/a.svg',
      category: 'enterprise',
      description: 'Description A',
    },
    {
      id: 'company-b',
      name: 'Company B',
      logo: '/logos/b.svg',
      category: 'enterprise',
      description: 'Description B',
    },
    {
      id: 'company-c',
      name: 'Company C',
      logo: '/logos/c.svg',
      category: 'education',
      description: 'Description C',
    },
    {
      id: 'company-d',
      name: 'Company D',
      logo: '/logos/d.svg',
      category: 'public',
      description: 'Description D',
    },
  ],
}));

describe('LogosSection', () => {
  it('renders the section label', () => {
    render(<LogosSection />);
    expect(screen.getByText('logos.sectionLabel')).toBeInTheDocument();
  });

  it('renders the section title', () => {
    render(<LogosSection />);
    expect(screen.getByText('logos.title')).toBeInTheDocument();
  });

  it('renders partner company logos with alt text', () => {
    render(<LogosSection />);

    // The t mock returns "logos.logoAlt CompanyName"
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);

    // Each company should appear in alt text
    const altTexts = images.map((img) => img.getAttribute('alt'));
    expect(altTexts).toContain('logos.logoAlt Company A');
    expect(altTexts).toContain('logos.logoAlt Company B');
    expect(altTexts).toContain('logos.logoAlt Company C');
    expect(altTexts).toContain('logos.logoAlt Company D');
  });

  it('triplicates logos for seamless infinite scrolling', () => {
    render(<LogosSection />);

    const images = screen.getAllByRole('img');
    // 4 companies split into 2 rows: first row has ceil(4/2)=2, second row has 2
    // Each row is tripled: (2*3) + (2*3) = 12 total images
    expect(images).toHaveLength(12);
  });

  it('renders images with lazy loading (logos are below the fold)', () => {
    // LogosSection sits below the hero and carousel is horizontally
    // scrolling — most logos are off-screen at any given time. Lazy loading
    // defers the fetch until the browser decides they're close to entering
    // the viewport, which dropped wasted bytes on partner logos from ~55 kB
    // to ~0 kB in Lighthouse uses-responsive-images.
    render(<LogosSection />);

    const images = screen.getAllByRole('img');
    images.forEach((img) => {
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    });
  });

  it('has partners section id', () => {
    const { container } = render(<LogosSection />);
    const section = container.querySelector('#partners');
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe('SECTION');
  });

  it('has displayName set', () => {
    expect(LogosSection.displayName).toBe('LogosSection');
  });

  it('renders heading elements at correct levels', () => {
    render(<LogosSection />);

    const label = screen.getByText('logos.sectionLabel');
    expect(label.tagName).toBe('SPAN');

    const h2 = screen.getByText('logos.title');
    expect(h2.tagName).toBe('H2');
  });

  it('pauses animation on touch start and resumes on touch end', () => {
    const { container } = render(<LogosSection />);

    const scrollContainers = container.querySelectorAll('.animate-scroll, .animate-scroll-reverse');
    expect(scrollContainers.length).toBeGreaterThan(0);

    const scrollEl = scrollContainers[0] as HTMLElement;

    fireEvent.touchStart(scrollEl);
    expect(scrollEl.style.animationPlayState).toBe('paused');

    fireEvent.touchEnd(scrollEl);
    expect(scrollEl.style.animationPlayState).toBe('running');
  });
});
