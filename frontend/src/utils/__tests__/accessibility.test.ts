/**
 * @jest-environment jsdom
 */

import { vi } from 'vitest';
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
  });
});
