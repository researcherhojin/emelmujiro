import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import Navbar from '../Navbar';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

// Mock i18n translations
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'company.name': '에멜무지로',
        'links.about': '회사소개',
        'links.services': '서비스',
        'links.blog': '블로그',
        'links.profile': '대표 프로필',
        'actions.contact': '문의하기',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ko',
    },
  }),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders logo', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('에멜무지로')).toBeInTheDocument();
  });

  test('renders navigation items', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('button', { name: '회사소개' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '서비스' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '블로그' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '대표 프로필' })).toBeInTheDocument();
  });

  test('navigates on menu item click', () => {
    renderWithProviders(<Navbar />);

    const aboutButton = screen.getByRole('button', { name: '회사소개' });
    fireEvent.click(aboutButton);
    expect(mockNavigate).toHaveBeenCalledWith('/about');
  });

  test('mobile menu button toggles menu', () => {
    renderWithProviders(<Navbar />);

    // Mobile menu should not be visible initially
    expect(
      screen.queryByText('회사소개', { selector: '.md\\:hidden button' })
    ).not.toBeInTheDocument();

    // Click mobile menu button - find by aria-label
    const menuButton = screen.getByRole('button', {
      name: /accessibility.menu/i,
    });
    fireEvent.click(menuButton);

    // Mobile menu should now be visible
    const mobileMenuItems = screen.getAllByText('회사소개');
    expect(mobileMenuItems.length).toBeGreaterThan(1); // One in desktop, one in mobile
  });

  test('logo navigates to home', () => {
    renderWithProviders(<Navbar />);

    // Find all links and check for the logo link
    const links = screen.getAllByRole('link');
    const logoLink = links.find(link => link.textContent === '에멜무지로');

    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '#/');
  });

  test('applies scroll styles', () => {
    renderWithProviders(<Navbar />);

    const navbar = screen.getByRole('navigation');

    // Initial state
    expect(navbar).toHaveClass('bg-white/98');

    // Simulate scroll
    fireEvent.scroll(window, { target: { scrollY: 100 } });

    // Note: This test might need adjustment based on actual scroll behavior implementation
  });
});
