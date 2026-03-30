import { describe, it, expect, vi } from 'vitest';
import { getTeachingHistory } from '../profileData';
import type { TeachingItem } from '../profileData';

vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

describe('profileData', () => {
  describe('getTeachingHistory', () => {
    it('should return a non-empty array', () => {
      const history = getTeachingHistory();
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should have valid structure for each teaching item', () => {
      const history = getTeachingHistory();
      history.forEach((item: TeachingItem) => {
        expect(item.organization).toBeDefined();
        expect(typeof item.organization).toBe('string');
        expect(item.organization.trim()).not.toBe('');

        expect(item.title).toBeDefined();
        expect(typeof item.title).toBe('string');
        expect(item.title.trim()).not.toBe('');

        expect(item.year).toBeDefined();
        expect(typeof item.year).toBe('number');
      });
    });

    it('should have optional upcoming flag as boolean when present', () => {
      const history = getTeachingHistory();
      history.forEach((item: TeachingItem) => {
        if (item.upcoming !== undefined) {
          expect(typeof item.upcoming).toBe('boolean');
        }
      });
    });

    it('should have optional visibleAfter as string when present', () => {
      const history = getTeachingHistory();
      history.forEach((item: TeachingItem) => {
        if (item.visibleAfter !== undefined) {
          expect(typeof item.visibleAfter).toBe('string');
          // Should be a valid ISO date string
          expect(item.visibleAfter).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      });
    });

    it('should be ordered by year descending', () => {
      const history = getTeachingHistory();
      for (let i = 1; i < history.length; i++) {
        expect(history[i].year).toBeLessThanOrEqual(history[i - 1].year);
      }
    });

    it('should span multiple years', () => {
      const history = getTeachingHistory();
      const years = new Set(history.map((item) => item.year));
      expect(years.size).toBeGreaterThan(1);
    });
  });
});
