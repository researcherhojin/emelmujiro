import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../NotFound';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 404 message', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('페이지를 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('renders button to navigate home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const homeButton = screen.getByRole('button', { name: /홈으로 이동/i });
    expect(homeButton).toBeInTheDocument();

    // Click the button and check navigation
    fireEvent.click(homeButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('has proper styling classes', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    // Check that the 404 heading and message are rendered with proper structure
    const heading = screen.getByText('404');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-6xl', 'font-bold', 'text-indigo-600');

    const message = screen.getByText('페이지를 찾을 수 없습니다.');
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass('text-gray-600');
  });
});
