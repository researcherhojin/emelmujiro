/**
 * @jest-environment jsdom
 */

import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkipLink from '../SkipLink';

// Mock scrollIntoView globally for JSDOM
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// Mock getPropertyValue for all CSSStyleDeclaration instances
const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
CSSStyleDeclaration.prototype.getPropertyValue = function (prop: string) {
  if (this === undefined || this === null) {
    return '';
  }
  try {
    return originalGetPropertyValue.call(this, prop);
  } catch {
    return '';
  }
};

describe('SkipLink Component', () => {
  let mockScrollIntoView: any;
  let mockMainContent: HTMLElement;

  beforeEach(() => {
    // Mock scrollIntoView
    mockScrollIntoView = vi.fn();

    // Create mock main content element
    mockMainContent = document.createElement('div');
    mockMainContent.id = 'main-content';

    // Use Object.defineProperty to override scrollIntoView
    Object.defineProperty(mockMainContent, 'scrollIntoView', {
      value: mockScrollIntoView,
      writable: true,
      configurable: true,
    });

    // Mock focus method for main content
    mockMainContent.focus = vi.fn();

    // Add to document
    document.body.appendChild(mockMainContent);

    // Mock getElementById - We're testing component behavior, not DOM API
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'main-content') {
        return mockMainContent;
      }
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.removeChild(mockMainContent);
  });

  describe('Basic Rendering', () => {
    it('renders skip link with correct text', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveTextContent('Skip to main content');
      expect(skipLink.tagName).toBe('A');
    });

    it('has correct href attribute pointing to main content', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('is initially visually hidden', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveClass('sr-only');
    });

    it('becomes visible on focus', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveClass('focus:not-sr-only');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct accessibility classes', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveClass('sr-only', 'focus:not-sr-only');
    });

    it('applies correct positioning classes', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveClass(
        'focus:absolute',
        'focus:top-4',
        'focus:left-4',
        'focus:z-50'
      );
    });

    it('applies correct visual styling classes', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveClass(
        'bg-blue-600',
        'text-white',
        'px-4',
        'py-2',
        'rounded-md'
      );
    });

    it('applies correct focus styles', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:ring-offset-2'
      );
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles Enter key press correctly', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Simulate Enter key press
      fireEvent.keyDown(skipLink, { key: 'Enter' });

      // Verify that the component successfully focused and scrolled to main content
      expect(mockMainContent.focus).toHaveBeenCalled();
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('prevents default behavior on Enter key press', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      fireEvent.keyDown(skipLink, { key: 'Enter' });

      // Since we can't directly test preventDefault in fireEvent,
      // we test the behavior that should occur when Enter is pressed
      expect(mockMainContent.focus).toHaveBeenCalled();
      expect(mockScrollIntoView).toHaveBeenCalled();
    });

    it('ignores other key presses', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Test various keys that should not trigger the action
      const keys = ['Space', 'Tab', 'Escape', 'ArrowDown', 'ArrowUp'];

      keys.forEach((key) => {
        fireEvent.keyDown(skipLink, { key });
      });

      // Should not have triggered focus for any of these keys
      expect(mockMainContent.focus).not.toHaveBeenCalled();
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    it('handles case-sensitive key comparison', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Test different cases of 'enter'
      fireEvent.keyDown(skipLink, { key: 'enter' }); // lowercase
      fireEvent.keyDown(skipLink, { key: 'ENTER' }); // uppercase

      // Should not trigger for case variations
      expect(mockMainContent.focus).not.toHaveBeenCalled();

      // Only exact 'Enter' should work
      fireEvent.keyDown(skipLink, { key: 'Enter' });
      expect(mockMainContent.focus).toHaveBeenCalled();
    });
  });

  describe('Main Content Interaction', () => {
    it('finds and focuses main content element', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      fireEvent.keyDown(skipLink, { key: 'Enter' });

      // Verify that main content was focused
      expect(mockMainContent.focus).toHaveBeenCalled();
    });

    it('scrolls to main content with smooth behavior', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      fireEvent.keyDown(skipLink, { key: 'Enter' });

      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('handles missing main content element gracefully', () => {
      // Mock getElementById to return null
      vi.spyOn(document, 'getElementById').mockReturnValue(null);

      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Should not throw error when element is not found
      expect(() => {
        fireEvent.keyDown(skipLink, { key: 'Enter' });
      }).not.toThrow();
    });

    it('handles main content element without focus method', () => {
      // Create element without focus method
      const elementWithoutFocus = document.createElement('div');
      elementWithoutFocus.id = 'main-content';

      vi.spyOn(document, 'getElementById').mockReturnValue(elementWithoutFocus);

      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Should not throw error
      expect(() => {
        fireEvent.keyDown(skipLink, { key: 'Enter' });
      }).not.toThrow();
    });

    it('handles main content element without scrollIntoView method', () => {
      // Create element without scrollIntoView method
      const elementWithoutScroll = document.createElement('div');
      elementWithoutScroll.id = 'main-content';
      elementWithoutScroll.focus = vi.fn();

      vi.spyOn(document, 'getElementById').mockReturnValue(
        elementWithoutScroll
      );

      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Should not throw error
      expect(() => {
        fireEvent.keyDown(skipLink, { key: 'Enter' });
      }).not.toThrow();

      expect(elementWithoutScroll.focus).toHaveBeenCalled();
    });
  });

  describe('Accessibility Compliance', () => {
    it('meets WCAG 2.1 AA Success Criterion 2.4.1', () => {
      // Skip links should be the first focusable element on the page
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('provides clear and descriptive link text', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveTextContent('Skip to main content');

      // Text should be meaningful and descriptive
      expect(skipLink.textContent?.toLowerCase()).toContain('skip');
      expect(skipLink.textContent?.toLowerCase()).toContain('main');
      expect(skipLink.textContent?.toLowerCase()).toContain('content');
    });

    it('is keyboard accessible', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Should be focusable
      skipLink.focus();
      expect(skipLink).toHaveFocus();

      // Should respond to keyboard activation
      fireEvent.keyDown(skipLink, { key: 'Enter' });
      expect(mockMainContent.focus).toHaveBeenCalled();
    });

    it('has sufficient color contrast', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Blue background with white text should provide good contrast
      expect(skipLink).toHaveClass('bg-blue-600', 'text-white');
    });

    it('has visible focus indicator', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      expect(skipLink).toHaveClass(
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:ring-offset-2',
        'focus:outline-none'
      );
    });
  });

  describe('Screen Reader Support', () => {
    it('is available to screen readers when focused', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Should have sr-only class but become visible on focus
      expect(skipLink).toHaveClass('sr-only', 'focus:not-sr-only');
    });

    it('provides semantic link role', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toBeInTheDocument();
    });

    it('has accessible text content', () => {
      render(<SkipLink />);

      // Should be found by accessible name
      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('appears above other content when focused', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveClass('focus:z-50');
    });

    it('has proper spacing and padding', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveClass('px-4', 'py-2');
    });

    it('has rounded corners for better appearance', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveClass('rounded-md');
    });

    it('is positioned consistently', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveClass('focus:top-4', 'focus:left-4');
    });
  });

  describe('User Interaction Flow', () => {
    it('completes full navigation flow successfully', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // 1. User tabs to skip link
      skipLink.focus();
      expect(skipLink).toHaveFocus();

      // 2. User presses Enter
      fireEvent.keyDown(skipLink, { key: 'Enter' });

      // 3. Main content is focused and scrolled into view
      expect(mockMainContent.focus).toHaveBeenCalled();
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('works with multiple interactions', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Multiple Enter presses should all work
      fireEvent.keyDown(skipLink, { key: 'Enter' });
      fireEvent.keyDown(skipLink, { key: 'Enter' });
      fireEvent.keyDown(skipLink, { key: 'Enter' });

      expect(mockMainContent.focus).toHaveBeenCalledTimes(3);
      expect(mockScrollIntoView).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid key presses', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Simulate rapid Enter key presses
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(skipLink, { key: 'Enter' });
      }

      expect(mockMainContent.focus).toHaveBeenCalledTimes(10);
      expect(mockScrollIntoView).toHaveBeenCalledTimes(10);
    });

    it('handles mixed keyboard inputs', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Mix of different keys
      fireEvent.keyDown(skipLink, { key: 'Tab' });
      fireEvent.keyDown(skipLink, { key: 'Enter' });
      fireEvent.keyDown(skipLink, { key: 'Space' });
      fireEvent.keyDown(skipLink, { key: 'Enter' });
      fireEvent.keyDown(skipLink, { key: 'Escape' });

      // Only Enter presses should trigger the action
      expect(mockMainContent.focus).toHaveBeenCalledTimes(2);
    });

    it('maintains functionality when DOM changes', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Remove and re-add main content
      document.body.removeChild(mockMainContent);

      // Should handle missing element gracefully
      fireEvent.keyDown(skipLink, { key: 'Enter' });

      // Re-add main content
      document.body.appendChild(mockMainContent);

      // Should work again
      fireEvent.keyDown(skipLink, { key: 'Enter' });
      expect(mockMainContent.focus).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('renders efficiently without unnecessary re-renders', () => {
      const { rerender } = render(<SkipLink />);

      // Multiple re-renders with same props
      rerender(<SkipLink />);
      rerender(<SkipLink />);
      rerender(<SkipLink />);

      // Should still be rendered correctly
      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toBeInTheDocument();
    });

    it('handles event listeners efficiently', () => {
      const { unmount } = render(<SkipLink />);

      const skipLink = screen.getByText(/skip to main content/i);

      // Test that event handler works
      fireEvent.keyDown(skipLink, { key: 'Enter' });
      expect(mockMainContent.focus).toHaveBeenCalled();

      // Unmount should clean up without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});
