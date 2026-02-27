import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LogosSection from '../LogosSection';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      if (options?.name) return `${key} ${options.name}`;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
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

  it('duplicates logos for infinite scrolling (logos appear twice)', () => {
    render(<LogosSection />);

    const images = screen.getAllByRole('img');
    // 4 companies split into 2 rows: first row has ceil(4/2)=2, second row has 2
    // Each row is duplicated: (2*2) + (2*2) = 8 total images
    expect(images).toHaveLength(8);
  });

  it('renders images with lazy loading', () => {
    render(<LogosSection />);

    const images = screen.getAllByRole('img');
    images.forEach((img) => {
      expect(img).toHaveAttribute('loading', 'lazy');
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

    const h2 = screen.getByText('logos.sectionLabel');
    expect(h2.tagName).toBe('H2');

    const h3 = screen.getByText('logos.title');
    expect(h3.tagName).toBe('H3');
  });
});
