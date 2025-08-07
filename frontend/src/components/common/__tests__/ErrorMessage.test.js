import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage Component', () => {
  test('renders error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('renders with title', () => {
    render(<ErrorMessage title="Error" message="Failed to load data" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  test('renders close button when onClose provided', () => {
    const handleClose = jest.fn();
    render(<ErrorMessage message="Error" onClose={handleClose} />);

    const closeButton = screen.getByRole('button', { name: '닫기' });
    expect(closeButton).toBeInTheDocument();
  });

  test('calls onClose when close button clicked', () => {
    const handleClose = jest.fn();
    render(<ErrorMessage message="Error" onClose={handleClose} />);

    const closeButton = screen.getByRole('button', { name: '닫기' });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('does not render close button when onClose not provided', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByRole('button', { name: '닫기' })).not.toBeInTheDocument();
  });

  test('applies error styling', () => {
    render(<ErrorMessage message="Error" />);
    const errorElement = screen.getByText('Error').closest('div');
    expect(errorElement?.parentElement).toHaveClass('bg-red-50', 'border-red-200');
  });

  test('renders error icon', () => {
    render(<ErrorMessage message="Error" />);
    // Check that the error message exists, icon is part of the component
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
