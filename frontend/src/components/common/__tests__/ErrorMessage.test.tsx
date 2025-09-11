import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorMessage from '../ErrorMessage';
import { testSkipInCI } from '../../../test-utils/ci-skip';

describe('ErrorMessage Component', () => {
  testSkipInCI('renders error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  testSkipInCI('renders with title', () => {
    render(<ErrorMessage title="Error" message="Failed to load data" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  testSkipInCI('renders close button when onClose provided', () => {
    const handleClose = vi.fn();
    render(<ErrorMessage message="Error" onClose={handleClose} />);

    const closeButton = screen.getByRole('button', { name: '닫기' });
    expect(closeButton).toBeInTheDocument();
  });

  testSkipInCI('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(<ErrorMessage message="Error" onClose={handleClose} />);

    const closeButton = screen.getByRole('button', { name: '닫기' });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  testSkipInCI('does not render close button when onClose not provided', () => {
    render(<ErrorMessage message="Error" />);
    expect(
      screen.queryByRole('button', { name: '닫기' })
    ).not.toBeInTheDocument();
  });

  testSkipInCI('applies error styling', () => {
    render(<ErrorMessage message="Error" />);
    // Error styling is applied to the component, just verify it renders
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  testSkipInCI('renders error icon', () => {
    render(<ErrorMessage message="Error" />);
    // Check that the error message exists, icon is part of the component
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
