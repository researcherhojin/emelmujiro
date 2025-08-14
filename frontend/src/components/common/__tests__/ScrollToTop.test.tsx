import { render, fireEvent, screen } from '@testing-library/react';
import ScrollToTop from '../ScrollToTop';
import React from 'react';

// Type definition for motion component props
interface MotionButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
  [key: string]: unknown;
}

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: MotionButtonProps) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ScrollToTop', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = jest.fn();

    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });
  });

  it('does not show button when at top of page', () => {
    render(<ScrollToTop />);

    // Button should not be in the document when at top
    const button = screen.queryByRole('button', { name: /위로/i });
    expect(button).not.toBeInTheDocument();
  });

  it('shows button when scrolled down', () => {
    render(<ScrollToTop />);

    // Simulate scroll down
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 500,
    });

    // Trigger scroll event
    fireEvent.scroll(window);

    // Button should appear
    const button = screen.getByRole('button', { name: /위로/i });
    expect(button).toBeInTheDocument();
  });

  it('scrolls to top when button is clicked', () => {
    render(<ScrollToTop />);

    // Simulate scroll down
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 500,
    });

    // Trigger scroll event to show button
    fireEvent.scroll(window);

    const button = screen.getByRole('button', { name: /위로/i });
    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('removes scroll listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<ScrollToTop />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('hides button when scrolled back to top', () => {
    render(<ScrollToTop />);

    // First scroll down
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 500,
    });
    fireEvent.scroll(window);

    // Button should be visible
    expect(screen.getByRole('button', { name: /위로/i })).toBeInTheDocument();

    // Then scroll back to top
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 100,
    });
    fireEvent.scroll(window);

    // Button should be hidden
    expect(
      screen.queryByRole('button', { name: /위로/i })
    ).not.toBeInTheDocument();
  });
});
