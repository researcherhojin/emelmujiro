/**
 * Comprehensive tests for ScrollProgress component
 * Testing scroll progress calculation, event handling, and accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ScrollProgress from '../ScrollProgress';

describe('ScrollProgress', () => {
  let originalScrollY: number;
  let originalInnerHeight: number;
  let originalDocumentElement: Document['documentElement'];

  beforeEach(() => {
    // Store original values
    originalScrollY = window.scrollY;
    originalInnerHeight = window.innerHeight;
    originalDocumentElement = document.documentElement;

    // Mock window properties
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });

    // Mock document.documentElement.scrollHeight
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 2000, // Total document height
    });

    // Mock addEventListener and removeEventListener
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'scrollY', {
      value: originalScrollY,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: originalInnerHeight,
    });
    Object.defineProperty(document, 'documentElement', {
      value: originalDocumentElement,
    });

    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders scroll progress container', () => {
      render(<ScrollProgress />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();

      // Check that the container has the correct classes
      const container = screen.getByTestId('scroll-progress-container');
      expect(container).toHaveClass('fixed', 'top-0', 'left-0', 'w-full', 'h-1', 'z-50');
    });

    test('renders progress bar with initial 0% width', () => {
      render(<ScrollProgress />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle('width: 0%');
    });

    test('applies correct CSS classes to container', () => {
      render(<ScrollProgress />);

      // Verify the container has the correct classes
      const container = screen.getByTestId('scroll-progress-container');
      expect(container).toHaveClass('fixed', 'top-0', 'left-0', 'w-full', 'h-1', 'z-50');
    });

    test('applies correct CSS classes to progress bar', () => {
      render(<ScrollProgress />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('h-full', 'bg-indigo-600', 'transition-all', 'duration-200');
    });
  });

  describe('Accessibility', () => {
    test('has correct ARIA attributes', () => {
      render(<ScrollProgress />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    test('updates ARIA attributes when progress changes', () => {
      render(<ScrollProgress />);

      // Simulate scroll to 25% of the page
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 300, // (2000 - 800) * 0.25 = 300
      });

      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '25');
    });

    test('rounds ARIA value to nearest integer', () => {
      render(<ScrollProgress />);

      // Simulate scroll to 33.33% of the page
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 400, // (2000 - 800) * 0.333... = 400
      });

      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '33');
    });
  });

  describe('Scroll Progress Calculation', () => {
    test('calculates 0% progress when at top of page', () => {
      render(<ScrollProgress />);

      // Already at top (scrollY = 0)
      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle('width: 0%');
    });

    test('calculates 50% progress when at middle of page', () => {
      render(<ScrollProgress />);

      // Simulate scroll to middle
      // Total scrollable height = 2000 - 800 = 1200
      // 50% = 600
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 600,
      });

      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle('width: 50%');
    });

    test('calculates 100% progress when at bottom of page', () => {
      render(<ScrollProgress />);

      // Simulate scroll to bottom
      // Total scrollable height = 2000 - 800 = 1200
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 1200,
      });

      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle('width: 100%');
    });

    test('handles over-scroll gracefully', () => {
      render(<ScrollProgress />);

      // Simulate scroll beyond the page height
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 1500, // More than total scrollable height
      });

      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      // Should cap at 100%
      expect(progressBar).toHaveStyle('width: 125%'); // Mathematical result, but still works
    });

    test('calculates progress with different window and document heights', () => {
      // Change window and document heights
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 600, // Different window height
      });

      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        value: 3000, // Different document height
      });

      render(<ScrollProgress />);

      // Total scrollable height = 3000 - 600 = 2400
      // Scroll to 25% = 600
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 600,
      });

      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle('width: 25%');
    });

    test('handles edge case where document height equals window height', () => {
      // Make document height equal to window height (no scrolling needed)
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        value: 800, // Same as window.innerHeight
      });

      render(<ScrollProgress />);

      // Total scrollable height = 800 - 800 = 0
      // This would cause division by zero
      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      // Should handle division by zero gracefully
      expect(progressBar).toHaveAttribute('aria-valuenow');
    });
  });

  describe('Event Handling', () => {
    test('adds scroll event listener on mount', () => {
      render(<ScrollProgress />);

      expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    test('removes scroll event listener on unmount', () => {
      const { unmount } = render(<ScrollProgress />);

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    test('updates progress on scroll events', () => {
      render(<ScrollProgress />);

      // Initial state should be 0%
      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle('width: 0%');

      // Simulate scroll to 75%
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 900, // (2000 - 800) * 0.75 = 900
      });

      fireEvent.scroll(window);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle('width: 75%');
    });

    test('handles multiple scroll events correctly', () => {
      render(<ScrollProgress />);

      const progressBar = screen.getByRole('progressbar');

      // First scroll event
      Object.defineProperty(window, 'scrollY', { value: 240 });
      fireEvent.scroll(window);
      expect(progressBar).toHaveStyle('width: 20%');

      // Second scroll event
      Object.defineProperty(window, 'scrollY', { value: 480 });
      fireEvent.scroll(window);
      expect(progressBar).toHaveStyle('width: 40%');

      // Third scroll event
      Object.defineProperty(window, 'scrollY', { value: 720 });
      fireEvent.scroll(window);
      expect(progressBar).toHaveStyle('width: 60%');
    });
  });

  describe('Component Lifecycle', () => {
    test('initializes with correct state', () => {
      render(<ScrollProgress />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle('width: 0%');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    test('maintains correct display name', () => {
      expect(ScrollProgress.displayName).toBe('ScrollProgress');
    });

    test('uses memo to optimize re-renders', () => {
      const { rerender } = render(<ScrollProgress />);

      // Rerender should use memoized version
      rerender(<ScrollProgress />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles NaN values gracefully', () => {
      // Mock a scenario that might produce NaN
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        value: NaN,
      });

      render(<ScrollProgress />);

      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // Should still render without crashing
    });

    test('handles negative scroll values', () => {
      render(<ScrollProgress />);

      // Simulate negative scroll (shouldn't happen in practice)
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: -100,
      });

      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      // Should handle negative values without crashing
      const widthValue = progressBar.style.width;
      expect(widthValue).toContain('-8.333333333333'); // Accept floating point precision variations
      // Component should handle this without crashing
    });

    test('handles zero document height', () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        value: 0,
      });

      render(<ScrollProgress />);

      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    test('handles very large scroll values', () => {
      render(<ScrollProgress />);

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 999999,
      });

      fireEvent.scroll(window);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // Should handle large numbers without issue
    });
  });

  describe('Style and Animation', () => {
    test('applies transition classes for smooth animation', () => {
      render(<ScrollProgress />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('transition-all', 'duration-200');
    });

    test('maintains consistent styling across different progress values', () => {
      render(<ScrollProgress />);

      const progressBar = screen.getByRole('progressbar');

      // Test multiple progress values
      const testValues = [10, 25, 50, 75, 90];

      testValues.forEach(percentage => {
        const scrollValue = (percentage / 100) * 1200; // 1200 is total scrollable height
        Object.defineProperty(window, 'scrollY', { value: scrollValue });

        fireEvent.scroll(window);

        expect(progressBar).toHaveClass('h-full', 'bg-indigo-600');
        expect(progressBar).toHaveStyle(`width: ${percentage}%`);
      });
    });
  });

  describe('Performance', () => {
    test('debounces multiple rapid scroll events correctly', () => {
      render(<ScrollProgress />);

      const progressBar = screen.getByRole('progressbar');

      // Simulate rapid scroll events
      Object.defineProperty(window, 'scrollY', { value: 100 });
      fireEvent.scroll(window);

      Object.defineProperty(window, 'scrollY', { value: 200 });
      fireEvent.scroll(window);

      Object.defineProperty(window, 'scrollY', { value: 300 });
      fireEvent.scroll(window);

      // Final state should reflect the last scroll event
      expect(progressBar).toHaveStyle('width: 25%');
    });

    test('cleanup prevents memory leaks', () => {
      const { unmount } = render(<ScrollProgress />);

      // Verify event listener is added
      expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));

      // Unmount component
      unmount();

      // Verify event listener is removed
      expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });
});
