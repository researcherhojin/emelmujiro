import React from 'react';
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

  test('renders retry button when onRetry provided', () => {
    const handleRetry = jest.fn();
    render(<ErrorMessage message="Error" onRetry={handleRetry} />);
    
    const retryButton = screen.getByRole('button', { name: '다시 시도' });
    expect(retryButton).toBeInTheDocument();
  });

  test('calls onRetry when retry button clicked', () => {
    const handleRetry = jest.fn();
    render(<ErrorMessage message="Error" onRetry={handleRetry} />);
    
    const retryButton = screen.getByRole('button', { name: '다시 시도' });
    fireEvent.click(retryButton);
    
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  test('does not render retry button when onRetry not provided', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  });

  test('applies error styling', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('bg-red-50', 'border-red-200');
  });

  test('renders error icon', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});