import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ContactPage from '../ContactPage';

// Mock SEOHelmet
vi.mock('../../common/SEOHelmet', () => ({
  default: function MockSEOHelmet() {
    return null;
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ContactPage Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the under construction message', () => {
    renderWithRouter(<ContactPage />);

    expect(screen.getByText('문의 기능 준비 중')).toBeInTheDocument();
    expect(
      screen.getByText('온라인 문의 양식을 준비하고 있습니다')
    ).toBeInTheDocument();
  });

  it('displays the contact email address', () => {
    renderWithRouter(<ContactPage />);

    const emailLink = screen.getByText('researcherhojin@gmail.com');
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest('a')).toHaveAttribute(
      'href',
      'mailto:researcherhojin@gmail.com'
    );
  });

  it('displays backend construction notice', () => {
    renderWithRouter(<ContactPage />);

    expect(
      screen.getByText(/현재 백엔드 시스템을 구축 중입니다/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/이메일로 직접 문의해주시면 빠르게 답변드리겠습니다/)
    ).toBeInTheDocument();
  });

  it('navigates to home when button is clicked', () => {
    renderWithRouter(<ContactPage />);

    const homeButton = screen.getByText('메인으로 돌아가기');
    fireEvent.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
