import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogListPage from '../BlogListPage';

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

    expect(screen.getByText('블로그 준비 중')).toBeInTheDocument();
    expect(
      screen.getByText('더 나은 콘텐츠로 곧 찾아뵙겠습니다')
    ).toBeInTheDocument();
  });

  it('shows wait message', () => {
    renderWithProviders(<BlogListPage />);

    expect(
      screen.getByText(/양질의 AI 인사이트와 기술 트렌드를 준비하고 있으니/)
    ).toBeInTheDocument();
  });

  it('renders the back to main button', () => {
    renderWithProviders(<BlogListPage />);

    const backButton = screen.getByText('메인으로 돌아가기');
    expect(backButton).toBeInTheDocument();
  });

  it('navigates to home when back button is clicked', () => {
    renderWithProviders(<BlogListPage />);

    const backButton = screen.getByText('메인으로 돌아가기');
    backButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
