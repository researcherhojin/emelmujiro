import { vi } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatRelativeTime,
  formatDuration,
  formatFileSize,
  formatTime,
  formatDateRange,
  formatPhoneNumber,
  formatCardNumber,
  formatOrdinal,
  formatPlural,
  formatList,
} from '../i18nFormatters';

// Mock i18n object
const mockI18n = (language: string) => ({
  language,
  t: vi.fn((key: string) => {
    if (key === 'time.now') return 'now';
    return key;
  }),
});

describe('i18nFormatters', () => {
  describe('formatNumber', () => {
    it('should format numbers with Korean locale', () => {
      expect(formatNumber(1234567.89, mockI18n('ko') as any)).toBe(
        '1,234,567.89'
      );
    });

    it('should format numbers with English locale', () => {
      expect(formatNumber(1234567.89, mockI18n('en') as any)).toBe(
        '1,234,567.89'
      );
    });

    it('should handle zero', () => {
      expect(formatNumber(0, mockI18n('ko') as any)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234.56, mockI18n('ko') as any)).toBe('-1,234.56');
    });
  });

  describe('formatCurrency', () => {
    it('should format KRW currency', () => {
      const result = formatCurrency(1234567, mockI18n('ko') as any, 'KRW');
      expect(result).toContain('1');
      expect(result).toContain('234');
      expect(result).toContain('567');
    });

    it('should format USD currency', () => {
      const result = formatCurrency(1234.56, mockI18n('en') as any, 'USD');
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should handle zero amount', () => {
      const result = formatCurrency(0, mockI18n('ko') as any, 'KRW');
      expect(result).toContain('0');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with Korean locale', () => {
      expect(formatPercentage(0.1234, mockI18n('ko') as any)).toBe('12.3%');
    });

    it('should format percentage with English locale', () => {
      expect(formatPercentage(0.85, mockI18n('en') as any)).toBe('85%');
    });

    it('should handle 100%', () => {
      expect(formatPercentage(1, mockI18n('ko') as any)).toBe('100%');
    });

    it('should handle zero percentage', () => {
      expect(formatPercentage(0, mockI18n('ko') as any)).toBe('0%');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T14:30:00');

    it('should format date in Korean short format', () => {
      const result = formatDate(testDate, mockI18n('ko') as any, {
        dateStyle: 'short',
      });
      expect(result).toContain('24');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });

    it('should format date in English medium format', () => {
      const result = formatDate(testDate, mockI18n('en') as any, {
        dateStyle: 'medium',
      });
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should use default format when not specified', () => {
      const result = formatDate(testDate, mockI18n('ko') as any);
      expect(result).toContain('2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent time as "now"', () => {
      const now = new Date();
      const result = formatRelativeTime(now, mockI18n('ko') as any);
      expect(result).toBe('now');
    });

    it('should format past time in minutes', () => {
      const past = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      const result = formatRelativeTime(past, mockI18n('en') as any);
      expect(result).toContain('30');
      expect(result).toContain('minute');
    });

    it('should format past time in hours', () => {
      const past = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const result = formatRelativeTime(past, mockI18n('ko') as any);
      expect(result).toContain('2');
    });

    it('should format past time in days', () => {
      const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      const result = formatRelativeTime(past, mockI18n('en') as any);
      expect(result).toContain('3');
      expect(result).toContain('day');
    });
  });

  describe('formatDuration', () => {
    it('should format duration in minutes only', () => {
      expect(formatDuration(45, mockI18n('ko') as any)).toBe('45분');
    });

    it('should format duration in hours and minutes', () => {
      expect(formatDuration(125, mockI18n('ko') as any)).toBe('2시간 5분');
    });

    it('should format duration in hours only', () => {
      expect(formatDuration(180, mockI18n('en') as any)).toBe('3h');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0, mockI18n('en') as any)).toBe('0m');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500, mockI18n('ko') as any)).toBe('500 바이트');
    });

    it('should format kilobytes', () => {
      const result = formatFileSize(2048, mockI18n('en') as any);
      expect(result).toContain('2');
      expect(result).toContain('KB');
    });

    it('should format megabytes', () => {
      const result = formatFileSize(5242880, mockI18n('ko') as any);
      expect(result).toContain('5');
      expect(result).toContain('MB');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0, mockI18n('ko') as any)).toBe('0 바이트');
    });
  });

  describe('formatTime', () => {
    const testDate = new Date('2024-01-15T14:30:00');

    it('should format time in 12-hour format for English', () => {
      const result = formatTime(testDate, 'en');
      expect(result).toMatch(/PM|AM/);
    });

    it('should format time in 24-hour format for Korean', () => {
      const result = formatTime(testDate, 'ko');
      expect(result).toContain('14');
      expect(result).toContain('30');
    });
  });

  describe('formatDateRange', () => {
    const startDate = new Date('2024-01-15');
    const endDate = new Date('2024-02-20');

    it('should format date range in Korean', () => {
      const result = formatDateRange(startDate, endDate, 'ko');
      expect(result).toContain('2024');
    });

    it('should format date range in English', () => {
      const result = formatDateRange(startDate, endDate, 'en');
      expect(result).toContain('Jan');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format Korean phone number', () => {
      expect(formatPhoneNumber('01012345678', mockI18n('ko') as any)).toBe(
        '010-1234-5678'
      );
    });

    it('should format US phone number', () => {
      expect(formatPhoneNumber('2125551234', mockI18n('en') as any)).toBe(
        '(212) 555-1234'
      );
    });

    it('should handle invalid format', () => {
      expect(formatPhoneNumber('123', mockI18n('ko') as any)).toBe('123');
    });
  });

  describe('formatCardNumber', () => {
    it('should format credit card number', () => {
      expect(formatCardNumber('1234567812345678')).toBe('1234 5678 1234 5678');
    });

    it('should handle partial card number', () => {
      expect(formatCardNumber('12345678')).toBe('1234 5678');
    });

    it('should handle empty string', () => {
      expect(formatCardNumber('')).toBe('');
    });
  });

  describe('formatOrdinal', () => {
    it('should format ordinal in Korean', () => {
      expect(formatOrdinal(1, 'ko')).toBe('1번째');
      expect(formatOrdinal(10, 'ko')).toBe('10번째');
    });

    it('should format ordinal in English', () => {
      expect(formatOrdinal(1, 'en')).toBe('1st');
      expect(formatOrdinal(2, 'en')).toBe('2nd');
      expect(formatOrdinal(3, 'en')).toBe('3rd');
      expect(formatOrdinal(4, 'en')).toBe('4th');
      expect(formatOrdinal(11, 'en')).toBe('11th');
      expect(formatOrdinal(21, 'en')).toBe('21st');
    });
  });

  describe('formatPlural', () => {
    it('should format singular', () => {
      expect(formatPlural(1, 'item', 'items')).toBe('1 item');
    });

    it('should format plural', () => {
      expect(formatPlural(5, 'item', 'items')).toBe('5 items');
    });

    it('should handle zero as plural', () => {
      expect(formatPlural(0, 'item', 'items')).toBe('0 items');
    });
  });

  describe('formatList', () => {
    it('should format Korean list', () => {
      const items = ['사과', '바나나', '오렌지'];
      expect(formatList(items, 'ko')).toBe('사과, 바나나, 오렌지');
    });

    it('should format English list', () => {
      const items = ['apple', 'banana', 'orange'];
      expect(formatList(items, 'en')).toBe('apple, banana, and orange');
    });

    it('should handle two items in English', () => {
      const items = ['apple', 'banana'];
      expect(formatList(items, 'en')).toBe('apple and banana');
    });

    it('should handle single item', () => {
      expect(formatList(['apple'], 'en')).toBe('apple');
    });

    it('should handle empty list', () => {
      expect(formatList([], 'en')).toBe('');
    });
  });
});
