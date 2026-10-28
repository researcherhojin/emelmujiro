import React from 'react';
import { vi, describe, it, expect, afterEach } from 'vitest';
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

const rowsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.animate-scroll, .animate-scroll-reverse'));

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

describe('LogosSection', () => {
  afterEach(() => mockReducedMotion(false));

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

  it('duplicates logos for seamless infinite scrolling', () => {
    const { container } = render(<LogosSection />);

    // 4 companies split into 2 rows of 2; each row renders 2 copies (dom-size): 8 images in the DOM.
    expect(container.querySelectorAll('img')).toHaveLength(8);
    // The second copy is aria-hidden, so only the first copy (4 images) is exposed to assistive tech.
    expect(screen.getAllByRole('img')).toHaveLength(4);
  });

  it('renders images with lazy loading (logos are below the fold)', () => {
    // LogosSection sits below the hero and carousel is horizontally
    // scrolling — most logos are off-screen at any given time. Lazy loading
    // defers the fetch until the browser decides they're close to entering
    // the viewport, which dropped wasted bytes on partner logos from ~55 kB
    // to ~0 kB in Lighthouse uses-responsive-images.
    const { container } = render(<LogosSection />);

    const images = container.querySelectorAll('img');
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

  it('pauses on touch start and resumes on touch end', () => {
    const { container } = render(<LogosSection />);
    const rows = rowsOf(container);
    expect(rows).toHaveLength(2);
    const scrollEl = rows[0];

    expect(scrollEl.style.animationPlayState).toBe('');
    fireEvent.touchStart(scrollEl);
    expect(scrollEl.style.animationPlayState).toBe('paused');
    fireEvent.touchEnd(scrollEl);
    expect(scrollEl.style.animationPlayState).toBe('');
  });

  it('button toggles both rows of the section', () => {
    const { container } = render(<LogosSection />);
    const rows = rowsOf(container);
    const button = screen.getByRole('button', { name: 'carousel.pauseLogos' });

    fireEvent.click(button);
    rows.forEach((row) => {
      expect(row.style.animationPlayState).toBe('paused');
      expect(row).toHaveAttribute('data-playing', 'false');
    });

    fireEvent.click(screen.getByRole('button', { name: 'carousel.playLogos' }));
    rows.forEach((row) => {
      expect(row.style.animationPlayState).toBe('');
      expect(row).toHaveAttribute('data-playing', 'true');
    });
  });

  it('touchend after a pause leaves the row paused', () => {
    const { container } = render(<LogosSection />);
    const row = rowsOf(container)[0];

    fireEvent.click(screen.getByRole('button', { name: 'carousel.pauseLogos' }));
    fireEvent.touchStart(row);
    fireEvent.touchEnd(row);
    expect(row.style.animationPlayState).toBe('paused');
  });

  it('starts paused under reduced motion and the button offers play', () => {
    mockReducedMotion(true);
    const { container } = render(<LogosSection />);
    rowsOf(container).forEach((row) => {
      expect(row.style.animationPlayState).toBe('paused');
      expect(row).toHaveAttribute('data-playing', 'false');
    });

    fireEvent.click(screen.getByRole('button', { name: 'carousel.playLogos' }));
    rowsOf(container).forEach((row) => {
      expect(row).toHaveAttribute('data-playing', 'true');
      expect(row.style.animationPlayState).toBe('');
    });
  });

  it('hides exactly half of each row from assistive tech', () => {
    const { container } = render(<LogosSection />);
    rowsOf(container).forEach((row) => {
      expect(row.children).toHaveLength(4);
      expect(row.querySelectorAll(':scope > [aria-hidden="true"]')).toHaveLength(2);
      row.querySelectorAll(':scope > [aria-hidden="true"] img').forEach((img) => {
        expect(img).toHaveAttribute('alt', '');
      });
    });
  });
});
