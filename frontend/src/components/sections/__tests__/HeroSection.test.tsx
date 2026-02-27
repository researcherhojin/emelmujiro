import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
}));

describe('HeroSection Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
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

  test('renders call to action button', () => {
    renderWithRouter(<HeroSection />);

    // HeroSection now only has one CTA button with an arrow
    const ctaButton = screen.getByText(/common.inquireProject/);
    expect(ctaButton).toBeInTheDocument();
  });
});
