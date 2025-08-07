import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ProblemChild = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock the logger module to avoid console output
jest.mock('../../../utils/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Mock console.error
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByText(/페이지를 불러오는 도중 오류가 발생했습니다/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('logs error to console', () => {
    const logger = require('../../../utils/logger');

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check that logger.error was called with the error
    expect(logger.error).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Error caught by boundary:', expect.any(Error));
    expect(logger.debug).toHaveBeenCalled();
  });

  it('handles reload button click', () => {
    // Mock window.location.reload
    const originalReload = window.location.reload;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: jest.fn() },
    });

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: '다시 시도' });
    fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalled();

    // Restore original reload
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: originalReload },
    });
  });

  it('applies correct styling to error UI', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorTitle = screen.getByText('문제가 발생했습니다');
    expect(errorTitle).toHaveClass('text-2xl', 'font-bold', 'text-red-600');

    const errorMessage = screen.getByText(/페이지를 불러오는 도중 오류가 발생했습니다/);
    expect(errorMessage).toHaveClass('text-gray-500');

    const reloadButton = screen.getByRole('button', { name: '다시 시도' });
    expect(reloadButton).toHaveClass('bg-indigo-600', 'text-white');
  });

  it('catches errors from nested components', () => {
    const DeepChild = () => {
      throw new Error('Deep error');
    };

    const MiddleComponent = () => <DeepChild />;

    render(
      <ErrorBoundary>
        <MiddleComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
  });

  it('recovers when error is resolved', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();

    // Re-render without error
    rerender(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    // Error boundary should still show error state
    // (React error boundaries don't automatically reset)
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
  });

  it('handles multiple children with one failing', () => {
    render(
      <ErrorBoundary>
        <div>First child</div>
        <ProblemChild shouldThrow={true} />
        <div>Third child</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    expect(screen.queryByText('First child')).not.toBeInTheDocument();
    expect(screen.queryByText('Third child')).not.toBeInTheDocument();
  });

  it('centers error content on screen', () => {
    const { container } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorContainer = container.firstChild;
    expect(errorContainer).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'min-h-screen'
    );
  });

  describe('getDerivedStateFromError', () => {
    it('updates state when error occurs', () => {
      const error = new Error('Test error');
      const newState = ErrorBoundary.getDerivedStateFromError(error);

      expect(newState).toEqual({ hasError: true });
    });
  });
});
