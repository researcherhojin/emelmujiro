import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  test('renders loading spinner', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  test('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  test('renders with custom size', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  test('renders with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-spinner" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-spinner');
  });

  test('centers content by default', () => {
    const { container } = render(<LoadingSpinner />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
  });
});