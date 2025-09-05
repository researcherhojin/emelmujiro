import { vi } from 'vitest';
import { waitFor as rtlWaitFor } from '@testing-library/react';
import type { waitForOptions } from '@testing-library/react';

/**
 * Enhanced waitFor with better timeout handling for CI environments
 */
export const waitFor = async (
  callback: () => void | Promise<void>,
  options?: waitForOptions
) => {
  const timeout = process.env.CI ? 10000 : 5000;
  return rtlWaitFor(callback, {
    timeout,
    ...options,
  });
};

/**
 * Safe getByRole wrapper that handles multiple elements
 */
export const safeGetByRole = (
  container: HTMLElement,
  role: string,
  options?: any
): HTMLElement | null => {
  try {
    const elements = container.querySelectorAll(`[role="${role}"]`);
    if (elements.length === 0) return null;

    if (options?.name) {
      const nameRegex =
        typeof options.name === 'string'
          ? new RegExp(options.name, 'i')
          : options.name;

      for (const element of elements) {
        const text = element.textContent || '';
        const ariaLabel = element.getAttribute('aria-label') || '';
        const title = element.getAttribute('title') || '';

        if (
          nameRegex.test(text) ||
          nameRegex.test(ariaLabel) ||
          nameRegex.test(title)
        ) {
          return element as HTMLElement;
        }
      }
    }

    return elements[0] as HTMLElement;
  } catch {
    return null;
  }
};

/**
 * Find button with flexible matching
 */
export const findButton = (
  container: HTMLElement,
  text: string | RegExp
): HTMLElement | null => {
  const buttons = container.querySelectorAll(
    'button, [role="button"], input[type="button"], input[type="submit"]'
  );
  const textMatcher = typeof text === 'string' ? new RegExp(text, 'i') : text;

  for (const button of buttons) {
    const buttonText = button.textContent || '';
    const ariaLabel = button.getAttribute('aria-label') || '';

    if (textMatcher.test(buttonText) || textMatcher.test(ariaLabel)) {
      return button as HTMLElement;
    }
  }

  return null;
};

/**
 * Find heading with flexible matching
 */
export const findHeading = (
  container: HTMLElement,
  text: string | RegExp,
  level?: number
): HTMLElement | null => {
  const selector = level ? `h${level}` : 'h1, h2, h3, h4, h5, h6';
  const headings = container.querySelectorAll(selector);
  const textMatcher = typeof text === 'string' ? new RegExp(text, 'i') : text;

  for (const heading of headings) {
    const headingText = heading.textContent || '';

    if (textMatcher.test(headingText)) {
      return heading as HTMLElement;
    }
  }

  return null;
};

/**
 * Wait for element to be visible
 */
export const waitForElement = async (
  getFn: () => HTMLElement | null,
  options?: { timeout?: number }
): Promise<HTMLElement> => {
  const timeout = options?.timeout || (process.env.CI ? 10000 : 5000);
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = getFn();
    if (element && element.offsetParent !== null) {
      return element;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error('Element not found within timeout');
};

/**
 * Mock IntersectionObserver for tests
 */
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver as any;
};

/**
 * Mock ResizeObserver for tests
 */
export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  window.ResizeObserver = mockResizeObserver as any;
};

/**
 * Setup common test mocks
 */
export const setupCommonMocks = () => {
  mockIntersectionObserver();
  mockResizeObserver();

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock scrollTo
  window.scrollTo = vi.fn();

  // Mock requestAnimationFrame
  window.requestAnimationFrame = vi.fn((cb) => {
    cb(0);
    return 0;
  });

  // Mock performance.mark and measure
  if (!window.performance) {
    (window as any).performance = {};
  }
  window.performance.mark = vi.fn();
  window.performance.measure = vi.fn();
};
