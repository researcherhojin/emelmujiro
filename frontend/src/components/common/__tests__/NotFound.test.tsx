import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../NotFound';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock window.history.back
const mockBack = jest.fn();
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    ...window.history,
    back: mockBack,
  },
});

describe('NotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBack.mockClear();
  });

  it('renders 404 message', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument();
  });

  it('renders button to navigate home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const homeButton = screen.getByRole('button', { name: /홈페이지로 이동/i });
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

    const backButton = screen.getByRole('button', { name: /이전 페이지로 돌아가기/i });
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
    expect(heading).toHaveClass('text-8xl', 'sm:text-9xl', 'font-black', 'text-gray-900');

    const message = screen.getByText('페이지를 찾을 수 없습니다');
    expect(message).toBeInTheDocument();
  });

  it('renders navigation links to major pages', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const aboutButton = screen.getByRole('button', { name: /회사소개 페이지로 이동/i });
    const profileButton = screen.getByRole('button', { name: /대표 프로필 페이지로 이동/i });
    const contactButton = screen.getByRole('button', { name: /문의하기 페이지로 이동/i });
    const blogButton = screen.getByRole('button', { name: /블로그 페이지로 이동/i });

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
