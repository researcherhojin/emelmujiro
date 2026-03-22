import { vi, describe, it, expect, beforeEach, test } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import Navbar from '../Navbar';

// Mock useNavigate
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/', hash: '', search: '', state: null, key: 'default' };
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock NotificationBell
vi.mock('../NotificationBell', () => ({
  default: () => <div data-testid="notification-bell">Bell</div>,
}));

// Mock AuthContext to allow toggling isAuthenticated
const mockIsAuthenticated = { value: false };
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockIsAuthenticated.value ? { id: 1, role: 'admin' } : null,
    isAuthenticated: mockIsAuthenticated.value,
    loading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
    clearError: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock i18n translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'ko',
    },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLocation.pathname = '/';
    mockLocation.hash = '';
    mockIsAuthenticated.value = false;
    // Reset scrollY
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  test('renders logo', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('common.companyName')).toBeInTheDocument();
  });

  test('renders navigation items', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('button', { name: 'common.about' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.blog' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.profile' })).toBeInTheDocument();
  });

  test('navigates on menu item click', () => {
    renderWithProviders(<Navbar />);

    const aboutButton = screen.getByRole('button', { name: 'common.about' });
    fireEvent.click(aboutButton);
    expect(mockNavigate).toHaveBeenCalledWith('/about');
  });

  test('mobile menu button toggles menu', () => {
    renderWithProviders(<Navbar />);

    // Mobile menu should not be visible initially
    expect(
      screen.queryByText('common.about', { selector: '.md\\:hidden button' })
    ).not.toBeInTheDocument();

    // Click mobile menu button - find by aria-label
    const menuButton = screen.getByRole('button', {
      name: 'accessibility.menu',
    });
    fireEvent.click(menuButton);

    // Mobile menu should now be visible
    const mobileMenuItems = screen.getAllByText('common.about');
    expect(mobileMenuItems.length).toBeGreaterThan(1); // One in desktop, one in mobile
  });

  test('logo navigates to home', () => {
    renderWithProviders(<Navbar />);

    // Find all links and check for the logo link
    const links = screen.getAllByRole('link');
    const logoLink = links.find((link) => link.textContent === 'common.companyName');

    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('applies scroll styles', () => {
    renderWithProviders(<Navbar />);

    const navbar = screen.getByRole('navigation');

    // Initial state - check that navbar exists
    expect(navbar).toBeInTheDocument();

    // Simulate scroll
    fireEvent.scroll(window, { target: { scrollY: 100 } });

    // Note: This test might need adjustment based on actual scroll behavior implementation
  });

  // --- New tests for uncovered lines ---

  it('adds shadow-md class when scrolled past 50px', () => {
    renderWithProviders(<Navbar />);
    const navbar = screen.getByRole('navigation');

    // Initially no shadow-md
    expect(navbar.className).not.toContain('shadow-md');

    // Scroll past threshold
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    act(() => {
      fireEvent.scroll(window);
    });

    expect(navbar.className).toContain('shadow-md');
  });

  it('removes shadow-md class when scrolled back up', () => {
    renderWithProviders(<Navbar />);
    const navbar = screen.getByRole('navigation');

    // Scroll down first
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    act(() => {
      fireEvent.scroll(window);
    });
    expect(navbar.className).toContain('shadow-md');

    // Scroll back up
    Object.defineProperty(window, 'scrollY', { value: 10, writable: true });
    act(() => {
      fireEvent.scroll(window);
    });
    expect(navbar.className).not.toContain('shadow-md');
  });

  it('toggles mobile menu open and closed', () => {
    renderWithProviders(<Navbar />);

    const menuButton = screen.getByRole('button', { name: 'accessibility.menu' });

    // Open mobile menu
    fireEvent.click(menuButton);
    expect(screen.getAllByText('common.about').length).toBeGreaterThan(1);

    // Close mobile menu
    fireEvent.click(menuButton);
    // Only desktop items should remain
    expect(screen.getAllByText('common.about')).toHaveLength(1);
  });

  it('navigates to contact page and closes mobile menu on contact click', () => {
    renderWithProviders(<Navbar />);

    // Open mobile menu first
    const menuButton = screen.getByRole('button', { name: 'accessibility.menu' });
    fireEvent.click(menuButton);

    // Find the mobile contact button (there are two: desktop + mobile)
    const contactButtons = screen.getAllByRole('button', { name: 'common.contact' });
    // Click the mobile one (last one)
    fireEvent.click(contactButtons[contactButtons.length - 1]);

    expect(mockNavigate).toHaveBeenCalledWith('/contact');
    // Mobile menu should be closed (only desktop items remain)
    expect(screen.getAllByText('common.about')).toHaveLength(1);
  });

  it('calls language switch and navigates on language button click', () => {
    renderWithProviders(<Navbar />);

    // Find language switch button by aria-label
    const langButtons = screen.getAllByRole('button', { name: 'common.switchLanguage' });
    // Click the desktop one
    fireEvent.click(langButtons[0]);

    // Should navigate to the English version of the current path
    expect(mockNavigate).toHaveBeenCalledWith('/en');
  });

  it('closes mobile menu when a mobile nav item is clicked', () => {
    renderWithProviders(<Navbar />);

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: 'accessibility.menu' });
    fireEvent.click(menuButton);

    // Click a mobile nav item (get the second occurrence which is in the mobile menu)
    const aboutButtons = screen.getAllByText('common.about');
    fireEvent.click(aboutButtons[aboutButtons.length - 1]);

    // Menu should close
    expect(screen.getAllByText('common.about')).toHaveLength(1);
    expect(mockNavigate).toHaveBeenCalledWith('/about');
  });

  it('cleans up scroll listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderWithProviders(<Navbar />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('navigates to blog path on click', () => {
    renderWithProviders(<Navbar />);

    const blogButton = screen.getByRole('button', { name: 'common.blog' });
    fireEvent.click(blogButton);

    expect(mockNavigate).toHaveBeenCalledWith('/blog');
  });

  it('highlights active nav item when pathname matches (line 59)', () => {
    mockLocation.pathname = '/about';
    mockLocation.hash = '';

    renderWithProviders(<Navbar />);

    const aboutButton = screen.getByRole('button', { name: 'common.about' });
    // Should have active styling
    expect(aboutButton.className).toContain('text-gray-900');
  });

  it('navigates to path when nav item clicked (handleNavigation)', () => {
    renderWithProviders(<Navbar />);

    const aboutButton = screen.getByRole('button', { name: 'common.about' });
    fireEvent.click(aboutButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('applies inactive styling to non-active nav items (branch lines 116-144)', () => {
    mockLocation.pathname = '/about';
    renderWithProviders(<Navbar />);

    // Blog is NOT active when on /about — should have inactive text-gray-600 (not bare text-gray-900)
    const blogButton = screen.getByRole('button', { name: 'common.blog' });
    expect(blogButton.className).toContain('text-gray-600');
    // Active items get `text-gray-900` without prefix; inactive have it only as `hover:text-gray-900`
    const classes = blogButton.className.split(' ');
    expect(classes).not.toContain('text-gray-900');
    expect(classes).toContain('hover:text-gray-900');
  });

  it('shows X icon when mobile menu is open and Menu icon when closed (line 168)', () => {
    renderWithProviders(<Navbar />);

    // Initially Menu icon
    expect(screen.getByTestId('icon-Menu')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-X')).not.toBeInTheDocument();

    // Open menu — should show X icon
    fireEvent.click(screen.getByRole('button', { name: 'accessibility.menu' }));
    expect(screen.getByTestId('icon-X')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-Menu')).not.toBeInTheDocument();
  });

  it('shows KO label and switches to ko when currentLang is en (line 60 else branch)', async () => {
    // Re-mock useLocalizedPath to return 'en' as current language
    const useLocalizedPathModule = await import('../../../hooks/useLocalizedPath');
    const spy = vi.spyOn(useLocalizedPathModule, 'useLocalizedPath').mockReturnValue({
      currentLang: 'en',
      localizedPath: (p: string) => `/en${p === '/' ? '' : p}`,
      localizedNavigate: vi.fn(),
      switchLanguagePath: (lang: string) => (lang === 'ko' ? '/about' : '/en/about'),
    });

    renderWithProviders(<Navbar />);

    // When currentLang is 'en', the button should show "KO"
    const langButtons = screen.getAllByRole('button', { name: 'common.switchLanguage' });
    expect(langButtons[0]).toHaveTextContent('KO');

    // Click should navigate to Korean path (targetLang = 'ko' since currentLang is 'en')
    fireEvent.click(langButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/about');

    spy.mockRestore();
  });

  it('renders NotificationBell when authenticated (lines 120, 144)', () => {
    mockIsAuthenticated.value = true;
    renderWithProviders(<Navbar />);

    // NotificationBell should render (both desktop and mobile)
    const bells = screen.getAllByTestId('notification-bell');
    expect(bells.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render NotificationBell when not authenticated', () => {
    mockIsAuthenticated.value = false;
    renderWithProviders(<Navbar />);

    expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument();
  });

  it('applies active styling to mobile nav items (mobile branch lines 116-144)', () => {
    mockLocation.pathname = '/about';
    renderWithProviders(<Navbar />);

    // Open mobile menu
    fireEvent.click(screen.getByRole('button', { name: 'accessibility.menu' }));

    // Mobile "about" button should have active class (bg-gray-50)
    const mobileAboutButtons = screen.getAllByText('common.about');
    const mobileButton = mobileAboutButtons[mobileAboutButtons.length - 1];
    expect(mobileButton.className).toContain('text-gray-900');

    // Mobile "blog" button should have inactive class
    const mobileBlogButtons = screen.getAllByText('common.blog');
    const mobileBlogButton = mobileBlogButtons[mobileBlogButtons.length - 1];
    expect(mobileBlogButton.className).toContain('text-gray-600');
  });
});
