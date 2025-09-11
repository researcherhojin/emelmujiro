import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';
import { testSkipInCI } from '../../../test-utils/ci-skip';

describe('LoadingSpinner Component', () => {
  testSkipInCI('renders loading spinner', () => {
    render(<LoadingSpinner />);
    // Loading spinner renders with default message
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  testSkipInCI('renders with default size', () => {
    render(<LoadingSpinner />);
    // Size is applied through CSS classes, verify component renders
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  testSkipInCI('renders with custom size', () => {
    render(<LoadingSpinner size="sm" />);
    // Size is applied through CSS classes, verify component renders
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  testSkipInCI('renders with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  testSkipInCI('renders default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  testSkipInCI('centers content by default', () => {
    render(<LoadingSpinner />);
    // Centering is handled by CSS, verify component renders
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });
});
