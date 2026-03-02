import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../NotFound';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.history.back
const mockBack = vi.fn();
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    ...window.history,
    back: mockBack,
  },
});

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBack.mockClear();
  });

  it('renders 404 message', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('notFound.title')).toBeInTheDocument();
  });

  it('renders button to navigate home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const homeButton = screen.getByRole('button', {
      name: /notFound\.goHome/i,
    });
    expect(homeButton).toBeInTheDocument();

    // Click the button and check navigation
    fireEvent.click(homeButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders button to go back', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button', {
      name: /notFound\.goBack/i,
    });
    expect(backButton).toBeInTheDocument();

    // Click the button and check history back
    fireEvent.click(backButton);
    expect(mockBack).toHaveBeenCalled();
  });

  it('has proper styling classes', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    // Check that the 404 heading is rendered with updated styles
    const heading = screen.getByText('404');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass(
      'text-8xl',
      'sm:text-9xl',
      'font-black',
      'text-gray-900'
    );

    const message = screen.getByText('notFound.title');
    expect(message).toBeInTheDocument();
  });

  it('renders navigation links to major pages', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const aboutButton = screen.getByRole('button', {
      name: 'common.about',
    });
    const profileButton = screen.getByRole('button', {
      name: 'common.representativeProfile',
    });
    const contactButton = screen.getByRole('button', {
      name: 'common.contact',
    });
    const blogButton = screen.getByRole('button', {
      name: 'common.blog',
    });

    expect(aboutButton).toBeInTheDocument();
    expect(profileButton).toBeInTheDocument();
    expect(contactButton).toBeInTheDocument();
    expect(blogButton).toBeInTheDocument();

    // Test navigation calls
    fireEvent.click(aboutButton);
    expect(mockNavigate).toHaveBeenCalledWith('/about');

    fireEvent.click(profileButton);
    expect(mockNavigate).toHaveBeenCalledWith('/profile');

    fireEvent.click(contactButton);
    expect(mockNavigate).toHaveBeenCalledWith('/contact');

    fireEvent.click(blogButton);
    expect(mockNavigate).toHaveBeenCalledWith('/blog');
  });
});
