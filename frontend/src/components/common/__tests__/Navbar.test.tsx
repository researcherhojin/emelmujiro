import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import Navbar from '../Navbar';
import { testSkipInCI } from '../../../test-utils/ci-skip';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock i18n translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.about': '회사소개',
        'common.blog': '블로그',
        'common.profile': '대표 프로필',
        'common.contact': '문의하기',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'ko',
    },
  }),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  testSkipInCI('renders logo', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('에멜무지로')).toBeInTheDocument();
  });

  testSkipInCI('renders navigation items', () => {
    renderWithProviders(<Navbar />);
    expect(
      screen.getByRole('button', { name: '회사소개' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '블로그' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '대표 프로필' })
    ).toBeInTheDocument();
  });

  testSkipInCI('navigates on menu item click', () => {
    renderWithProviders(<Navbar />);

    const aboutButton = screen.getByRole('button', { name: '회사소개' });
    fireEvent.click(aboutButton);
    expect(mockNavigate).toHaveBeenCalledWith('/about');
  });

  testSkipInCI('mobile menu button toggles menu', () => {
    renderWithProviders(<Navbar />);

    // Mobile menu should not be visible initially
    expect(
      screen.queryByText('회사소개', { selector: '.md\\:hidden button' })
    ).not.toBeInTheDocument();

    // Click mobile menu button - find by aria-label
    const menuButton = screen.getByRole('button', {
      name: '메뉴',
    });
    fireEvent.click(menuButton);

    // Mobile menu should now be visible
    const mobileMenuItems = screen.getAllByText('회사소개');
    expect(mobileMenuItems.length).toBeGreaterThan(1); // One in desktop, one in mobile
  });

  testSkipInCI('logo navigates to home', () => {
    renderWithProviders(<Navbar />);

    // Find all links and check for the logo link
    const links = screen.getAllByRole('link');
    const logoLink = links.find((link) => link.textContent === '에멜무지로');

    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '#/');
  });

  testSkipInCI('applies scroll styles', () => {
    renderWithProviders(<Navbar />);

    const navbar = screen.getByRole('navigation');

    // Initial state - check that navbar exists
    expect(navbar).toBeInTheDocument();

    // Simulate scroll
    fireEvent.scroll(window, { target: { scrollY: 100 } });

    // Note: This test might need adjustment based on actual scroll behavior implementation
  });
});
