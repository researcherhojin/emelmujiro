import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';

// Mock useNavigate — vi.hoisted ensures mockNavigate is available when vi.mock is hoisted
const { mockNavigate, mockTrackCtaClick } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockTrackCtaClick: vi.fn(),
}));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock analytics
vi.mock('../../../utils/analytics', () => ({
  trackCtaClick: (...args: unknown[]) => mockTrackCtaClick(...args),
}));

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

describe('HeroSection Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  test('renders main heading', () => {
    renderWithRouter(<HeroSection />);

    // Check that the heading is rendered (h1 element specifically),
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain('hero.titleLine1');
    expect(heading.textContent).toContain('hero.titleLine2');
  });

  test('renders subheading', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText(/hero.descriptionLine1/)).toBeInTheDocument();
  });

  test('renders call to action button linking to contact page', () => {
    renderWithRouter(<HeroSection />);

    // HeroSection has a CTA Link to /contact
    const ctaLink = screen.getByText(/common.inquireProject/);
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink.closest('a')).toHaveAttribute('href', '/contact');
  });

  test('calls trackCtaClick with "hero" when CTA link is clicked', () => {
    renderWithRouter(<HeroSection />);
    const ctaLink = screen.getByText(/common.inquireProject/);
    fireEvent.click(ctaLink);
    expect(mockTrackCtaClick).toHaveBeenCalledWith('hero');
  });
});
