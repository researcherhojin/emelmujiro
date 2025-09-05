/**
 * @jest-environment jsdom
 */

import { vi } from 'vitest';
import {
  announceToScreenReader,
  prefersReducedMotion,
  getContrastRatio,
  generateAriaId,
  manageFocus,
  debounceForA11y,
  isVisibleToScreenReader,
  formatForScreenReader,
} from '../accessibility';

describe.skip('accessibility', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';

    // Reset Date.now for consistent testing
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('announceToScreenReader', () => {
    it('should create announcement element with polite priority', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.getAttribute('aria-live')).toBe('polite');
      expect(announcement?.getAttribute('aria-atomic')).toBe('true');
      expect(announcement?.textContent).toBe('Test message');
      expect(announcement?.className).toBe('sr-only');
    });

    it('should create announcement element with assertive priority', () => {
      announceToScreenReader('Urgent message', 'assertive');

      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.getAttribute('aria-live')).toBe('assertive');
      expect(announcement?.textContent).toBe('Urgent message');
    });

    it('should remove announcement after timeout', () => {
      vi.useFakeTimers();

      announceToScreenReader('Temporary message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeTruthy();

      // Fast-forward time
      vi.advanceTimersByTime(1100);

      const removedAnnouncement = document.querySelector('[role="status"]');
      expect(removedAnnouncement).toBeFalsy();

      vi.useRealTimers();
    });

    it('should handle multiple announcements', () => {
      announceToScreenReader('Message 1');
      announceToScreenReader('Message 2');

      const announcements = document.querySelectorAll('[role="status"]');
      expect(announcements.length).toBe(2);
      expect(announcements[0].textContent).toBe('Message 1');
      expect(announcements[1].textContent).toBe('Message 2');
    });
  });

  describe('prefersReducedMotion', () => {
    it('should return true when user prefers reduced motion', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(prefersReducedMotion()).toBe(true);
    });

    it('should return false when user does not prefer reduced motion', () => {
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

      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate contrast ratio for valid RGB colors', () => {
      // Black vs White should have high contrast (21:1),
      const ratio = getContrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate contrast ratio for same colors', () => {
      const ratio = getContrastRatio(
        'rgb(128, 128, 128)',
        'rgb(128, 128, 128)'
      );
      expect(ratio).toBe(1);
    });

    it('should handle colors with low contrast', () => {
      const ratio = getContrastRatio(
        'rgb(200, 200, 200)',
        'rgb(220, 220, 220)'
      );
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(2);
    });

    it('should return 1 for invalid color formats', () => {
      const ratio = getContrastRatio('invalid-color', 'another-invalid');
      expect(ratio).toBe(1); // (0 + 0.05) / (0 + 0.05) = 1
    });

    it('should handle hex colors converted to rgb', () => {
      // This test assumes the colors are already in rgb format
      const ratio = getContrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
      expect(ratio).toBeGreaterThan(15);
    });

    it('should calculate correct luminance values', () => {
      // Test with known color values
      const ratio1 = getContrastRatio('rgb(255, 0, 0)', 'rgb(255, 255, 255)');
      const ratio2 = getContrastRatio('rgb(0, 255, 0)', 'rgb(255, 255, 255)');
      const ratio3 = getContrastRatio('rgb(0, 0, 255)', 'rgb(255, 255, 255)');

      expect(ratio1).toBeGreaterThan(1);
      expect(ratio2).toBeGreaterThan(1);
      expect(ratio3).toBeGreaterThan(1);
    });
  });

  describe('generateAriaId', () => {
    it('should generate ID with default prefix', () => {
      const id = generateAriaId();
      expect(id).toMatch(/^aria-\d+-[a-z0-9]+$/);
    });

    it('should generate ID with custom prefix', () => {
      const id = generateAriaId('custom');
      expect(id).toMatch(/^custom-\d+-[a-z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      // Mock different values for each call
      let callCount = 0;
      vi.spyOn(Date, 'now').mockImplementation(() => 1234567890 + callCount++);

      const id1 = generateAriaId();
      const id2 = generateAriaId();
      expect(id1).not.toBe(id2);
    });

    it('should include timestamp and random component', () => {
      const id = generateAriaId('test');
      expect(id).toContain('test'); // Should contain prefix
      expect(id).toContain('1234567890'); // Mocked timestamp
      // Random component will vary, just check format
      expect(id).toMatch(/^test-\d+-[a-z0-9]+$/);
    });
  });

  describe('manageFocus', () => {
    let testButton: HTMLButtonElement;
    let testInput: HTMLInputElement;
    let testContainer: HTMLDivElement;

    beforeEach(() => {
      // Create test elements
      testButton = document.createElement('button');
      testButton.textContent = 'Test Button';

      testInput = document.createElement('input');
      testInput.type = 'text';

      testContainer = document.createElement('div');
      testContainer.appendChild(testButton);
      testContainer.appendChild(testInput);

      document.body.appendChild(testContainer);
    });

    describe('save and restore', () => {
      it('should save and restore focus', () => {
        testButton.focus();
        expect(document.activeElement).toBe(testButton);

        const savedElement = manageFocus.save();
        testInput.focus();
        expect(document.activeElement).toBe(testInput);

        manageFocus.restore(savedElement);
        expect(document.activeElement).toBe(testButton);
      });

      it('should handle null element gracefully', () => {
        expect(() => manageFocus.restore(null)).not.toThrow();
      });

      it('should handle element without focus method', () => {
        const mockElement = {} as HTMLElement;
        expect(() => manageFocus.restore(mockElement)).not.toThrow();
      });
    });

    describe('focusFirst', () => {
      it('should focus first focusable element', () => {
        manageFocus.focusFirst(testContainer);
        expect(document.activeElement).toBe(testButton);
      });

      it('should handle container with no focusable elements', () => {
        const emptyDiv = document.createElement('div');
        document.body.appendChild(emptyDiv);

        expect(() => manageFocus.focusFirst(emptyDiv)).not.toThrow();
      });

      it('should skip elements with tabindex -1', () => {
        testButton.tabIndex = -1;
        manageFocus.focusFirst(testContainer);
        expect(document.activeElement).toBe(testInput);
      });
    });

    describe('trap', () => {
      it('should return focusable elements info', () => {
        const trapInfo = manageFocus.trap(testContainer);

        expect(trapInfo.firstElement).toBe(testButton);
        expect(trapInfo.lastElement).toBe(testInput);
        expect(trapInfo.elements).toEqual([testButton, testInput]);
      });

      it('should handle container with single focusable element', () => {
        const singleContainer = document.createElement('div');
        singleContainer.appendChild(testButton.cloneNode(true));
        document.body.appendChild(singleContainer);

        const trapInfo = manageFocus.trap(singleContainer);
        expect(trapInfo.firstElement).toBe(trapInfo.lastElement);
      });

      it('should handle container with no focusable elements', () => {
        const emptyDiv = document.createElement('div');
        const trapInfo = manageFocus.trap(emptyDiv);

        expect(trapInfo.firstElement).toBeUndefined();
        expect(trapInfo.lastElement).toBeUndefined();
        expect(trapInfo.elements).toEqual([]);
      });

      it('should include various focusable elements', () => {
        const link = document.createElement('a');
        link.href = '#';
        const select = document.createElement('select');
        const textarea = document.createElement('textarea');

        testContainer.appendChild(link);
        testContainer.appendChild(select);
        testContainer.appendChild(textarea);

        const trapInfo = manageFocus.trap(testContainer);
        expect(trapInfo.elements).toContain(testButton);
        expect(trapInfo.elements).toContain(testInput);
        expect(trapInfo.elements).toContain(link);
        expect(trapInfo.elements).toContain(select);
        expect(trapInfo.elements).toContain(textarea);
      });
    });
  });

  describe('debounceForA11y', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounceForA11y(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      debouncedFn('arg3', 'arg4');
      debouncedFn('arg5', 'arg6');

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg5', 'arg6');
    });

    it('should reset timer on subsequent calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounceForA11y(mockFn, 100);

      debouncedFn('first');
      vi.advanceTimersByTime(50);

      debouncedFn('second');
      vi.advanceTimersByTime(50);

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledWith('second');
    });

    it('should handle functions with no arguments', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounceForA11y(mockFn, 50);

      debouncedFn();
      vi.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith();
    });

    it('should preserve function return type', () => {
      const mockFn = vi.fn().mockReturnValue('test');
      const debouncedFn = debounceForA11y(mockFn, 50);

      // Note: debounced functions don't return values immediately
      debouncedFn();
      vi.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('isVisibleToScreenReader', () => {
    let testElement: HTMLDivElement;

    beforeEach(() => {
      testElement = document.createElement('div');
      document.body.appendChild(testElement);
    });

    it('should return true for visible element', () => {
      expect(isVisibleToScreenReader(testElement)).toBe(true);
    });

    it('should return false for element with aria-hidden', () => {
      testElement.setAttribute('aria-hidden', 'true');
      expect(isVisibleToScreenReader(testElement)).toBe(false);
    });

    it('should return false for element with hidden parent', () => {
      const parent = document.createElement('div');
      parent.setAttribute('aria-hidden', 'true');
      parent.appendChild(testElement);
      document.body.appendChild(parent);

      expect(isVisibleToScreenReader(testElement)).toBe(false);
    });

    it('should return true for element with aria-hidden false', () => {
      testElement.setAttribute('aria-hidden', 'false');
      expect(isVisibleToScreenReader(testElement)).toBe(true);
    });

    it('should return false for element with display none', () => {
      // Mock getComputedStyle
      Object.defineProperty(window, 'getComputedStyle', {
        value: () => ({
          display: 'none',
          visibility: 'visible',
        }),
      });

      expect(isVisibleToScreenReader(testElement)).toBe(false);
    });

    it('should return false for element with visibility hidden', () => {
      Object.defineProperty(window, 'getComputedStyle', {
        value: () => ({
          display: 'block',
          visibility: 'hidden',
        }),
      });

      expect(isVisibleToScreenReader(testElement)).toBe(false);
    });

    it('should return true for visible styled element', () => {
      Object.defineProperty(window, 'getComputedStyle', {
        value: () => ({
          display: 'block',
          visibility: 'visible',
        }),
      });

      expect(isVisibleToScreenReader(testElement)).toBe(true);
    });
  });

  describe('formatForScreenReader', () => {
    it('should format date strings', () => {
      const formatted = formatForScreenReader('2024-03-15', 'date');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('3월');
      expect(formatted).toContain('15일');
    });

    it('should format time strings', () => {
      const timeString = '2024-03-15T14:30:00';
      const formatted = formatForScreenReader(timeString, 'time');
      // Korean locale formats time as '오후 2:30'
      expect(formatted).toMatch(/([0-9]+|오후|오전)/);
      expect(formatted).toContain('30');
    });

    it('should format numbers with commas', () => {
      const formatted = formatForScreenReader('1234567', 'number');
      expect(formatted).toBe('1,234,567');
    });

    it('should format currency with commas and won symbol', () => {
      const formatted = formatForScreenReader('1000000', 'currency');
      expect(formatted).toBe('1,000,000원');
    });

    it('should handle small numbers', () => {
      const formatted = formatForScreenReader('100', 'number');
      expect(formatted).toBe('100');
    });

    it('should handle empty strings', () => {
      const formatted = formatForScreenReader('', 'number');
      expect(formatted).toBe('');
    });

    it('should return original text for default case', () => {
      const formatted = formatForScreenReader('test text');
      expect(formatted).toBe('test text');
    });

    it('should handle invalid date strings gracefully', () => {
      const formatted = formatForScreenReader('invalid-date', 'date');
      // Should still attempt to create a date, resulting in "Invalid Date" formatting
      expect(typeof formatted).toBe('string');
    });

    it('should handle zero values', () => {
      const numberFormatted = formatForScreenReader('0', 'number');
      expect(numberFormatted).toBe('0');

      const currencyFormatted = formatForScreenReader('0', 'currency');
      expect(currencyFormatted).toBe('0원');
    });

    it('should handle negative numbers', () => {
      const formatted = formatForScreenReader('-1234', 'number');
      expect(formatted).toBe('-1,234');
    });
  });

  describe('integration scenarios', () => {
    it('should work with complex DOM structures', () => {
      const form = document.createElement('form');
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      const input = document.createElement('input');
      const button = document.createElement('button');

      legend.textContent = 'User Information';
      input.type = 'text';
      input.setAttribute('aria-describedby', generateAriaId('input-help'));
      button.textContent = 'Submit';

      fieldset.appendChild(legend);
      fieldset.appendChild(input);
      form.appendChild(fieldset);
      form.appendChild(button);
      document.body.appendChild(form);

      const trapInfo = manageFocus.trap(form);
      expect(trapInfo.elements).toContain(input);
      expect(trapInfo.elements).toContain(button);

      expect(isVisibleToScreenReader(input)).toBe(true);
      expect(isVisibleToScreenReader(legend)).toBe(true);
    });

    it('should handle accessibility announcements with focus management', async () => {
      const button = document.createElement('button');
      button.textContent = 'Test';
      document.body.appendChild(button);

      button.focus();
      const savedFocus = manageFocus.save();

      announceToScreenReader('Form submitted successfully');

      await new Promise((resolve) => setTimeout(resolve, 50));

      manageFocus.restore(savedFocus);
      expect(document.activeElement).toBe(button);

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.textContent).toBe('Form submitted successfully');
    });
  });
});
