import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogListPage from '../BlogListPage';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BlogListPage', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <HelmetProvider>
        <MemoryRouter>{component}</MemoryRouter>
      </HelmetProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the under construction message', () => {
    renderWithProviders(<BlogListPage />);

    expect(screen.getByText('blog.preparing')).toBeInTheDocument();
    expect(screen.getByText('blog.preparingSubtitle')).toBeInTheDocument();
  });

  it('shows wait message', () => {
    renderWithProviders(<BlogListPage />);

    expect(screen.getByText('blog.preparingDescription')).toBeInTheDocument();
  });

  it('renders the back to main button', () => {
    renderWithProviders(<BlogListPage />);

    const backButton = screen.getByText('blog.backToMain');
    expect(backButton).toBeInTheDocument();
  });

  it('navigates to home when back button is clicked', () => {
    renderWithProviders(<BlogListPage />);

    const backButton = screen.getByText('blog.backToMain');
    backButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
