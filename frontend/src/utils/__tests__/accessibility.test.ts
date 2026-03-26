/**
 * @jest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { announceToScreenReader } from '../accessibility';

describe('accessibility', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
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

    it('should return a cleanup function that removes the element and clears timeout', () => {
      vi.useFakeTimers();

      const cleanup = announceToScreenReader('Cleanup message');

      // Announcement should be in the DOM
      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Cleanup message');

      // Call the cleanup function early (before the 1s timeout)
      expect(cleanup).toBeTypeOf('function');
      cleanup!();

      // Element should be removed immediately
      const removed = document.querySelector('[role="status"]');
      expect(removed).toBeFalsy();

      // Advancing timers should not cause errors (timeout was cleared)
      vi.advanceTimersByTime(1100);

      vi.useRealTimers();
    });

    it('cleanup function handles already-removed element gracefully', () => {
      vi.useFakeTimers();

      const cleanup = announceToScreenReader('Double remove');

      // Manually remove the element first
      const announcement = document.querySelector('[role="status"]');
      if (announcement) document.body.removeChild(announcement);

      // Calling cleanup should not throw
      expect(() => cleanup!()).not.toThrow();

      vi.useRealTimers();
    });

    it('should return undefined when document is undefined (SSR)', () => {
      const originalDocument = globalThis.document;
      // @ts-expect-error — simulating SSR environment
      delete globalThis.document;

      const result = announceToScreenReader('SSR message');
      expect(result).toBeUndefined();

      globalThis.document = originalDocument;
    });

    it('timeout callback handles already-removed element gracefully', () => {
      vi.useFakeTimers();
      announceToScreenReader('Auto-remove');

      // Manually remove the element before timeout fires
      const el = document.querySelector('[role="status"]');
      if (el) document.body.removeChild(el);

      // Advance past timeout — should not throw
      vi.advanceTimersByTime(1100);

      // Element should still not be in DOM
      expect(document.querySelector('[role="status"]')).toBeFalsy();

      vi.useRealTimers();
    });
  });
});
