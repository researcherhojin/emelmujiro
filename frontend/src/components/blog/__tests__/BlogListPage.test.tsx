import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogListPage from '../BlogListPage';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('BlogListPage', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <HelmetProvider>
        <MemoryRouter>{component}</MemoryRouter>
      </HelmetProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the under construction message', () => {
    renderWithProviders(<BlogListPage />);

    expect(screen.getByText('블로그 준비 중')).toBeInTheDocument();
    expect(
      screen.getByText('더 나은 콘텐츠로 곧 찾아뵙겠습니다')
    ).toBeInTheDocument();
  });

  it('shows information about backend system construction', () => {
    renderWithProviders(<BlogListPage />);

    expect(
      screen.getByText(/현재 백엔드 시스템을 구축 중입니다/)
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
