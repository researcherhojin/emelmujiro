/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

/**
 * Announce message to screen readers
 * Creates a live region that announces messages
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get contrast ratio between two colors
 * Used to ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0;

    const [r, g, b] = rgb.map(c => {
      const sRGB = parseInt(c, 10) / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Generate unique ID for ARIA relationships
 */
export const generateAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Manage focus for better keyboard navigation
 */
export const manageFocus = {
  // Save current focus
  save: (): HTMLElement | null => {
    return document.activeElement as HTMLElement;
  },

  // Restore focus to saved element
  restore: (element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },

  // Focus first focusable element in container
  focusFirst: (container: HTMLElement) => {
    const focusable = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  },

  // Trap focus within container
  trap: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    return {
      firstElement,
      lastElement,
      elements: Array.from(focusableElements),
    };
  },
};

/**
 * Debounce function for reducing motion
 */
export const debounceForA11y = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReader = (element: HTMLElement): boolean => {
  // Check if element or ancestors have aria-hidden
  let current: HTMLElement | null = element;
  while (current) {
    if (current.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    current = current.parentElement;
  }

  // Check if element is visually hidden but not from screen readers
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  return true;
};

/**
 * Format text for screen readers
 */
export const formatForScreenReader = (
  text: string,
  type: 'date' | 'time' | 'number' | 'currency' = 'date'
): string => {
  switch (type) {
    case 'date': {
      // Convert date to more readable format
      const date = new Date(text);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    case 'time': {
      const time = new Date(text);
      return time.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: 'numeric',
      });
    }

    case 'number':
      return text.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    case 'currency':
      return `${text.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원`;

    default:
      return text;
  }
};
