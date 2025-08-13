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

describe('i18nFormatters', () => {
  describe('formatNumber', () => {
    it('should format numbers with Korean locale', () => {
      expect(formatNumber(1234567.89, 'ko')).toBe('1,234,567.89');
    });

    it('should format numbers with English locale', () => {
      expect(formatNumber(1234567.89, 'en')).toBe('1,234,567.89');
    });

    it('should handle zero', () => {
      expect(formatNumber(0, 'ko')).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234.56, 'ko')).toBe('-1,234.56');
    });
  });

  describe('formatCurrency', () => {
    it('should format KRW currency', () => {
      const result = formatCurrency(1234567, 'ko', 'KRW');
      expect(result).toContain('1');
      expect(result).toContain('234');
      expect(result).toContain('567');
    });

    it('should format USD currency', () => {
      const result = formatCurrency(1234.56, 'en', 'USD');
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should handle zero amount', () => {
      const result = formatCurrency(0, 'ko', 'KRW');
      expect(result).toContain('0');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with Korean locale', () => {
      expect(formatPercentage(0.1234, 'ko')).toBe('12%');
    });

    it('should format percentage with English locale', () => {
      expect(formatPercentage(0.85, 'en')).toBe('85%');
    });

    it('should handle 100%', () => {
      expect(formatPercentage(1, 'ko')).toBe('100%');
    });

    it('should handle 0%', () => {
      expect(formatPercentage(0, 'en')).toBe('0%');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15');

    it('should format date in Korean short format', () => {
      const result = formatDate(testDate, 'ko', 'short');
      expect(result).toContain('24');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });

    it('should format date in English medium format', () => {
      const result = formatDate(testDate, 'en', 'medium');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format date in long format', () => {
      const result = formatDate(testDate, 'ko', 'long');
      expect(result).toContain('2024');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format future time in Korean', () => {
      const result = formatRelativeTime(2, 'day', 'ko');
      expect(result).toContain('2');
    });

    it('should format past time in English', () => {
      const result = formatRelativeTime(-1, 'hour', 'en');
      expect(result).toContain('1');
      expect(result).toContain('ago');
    });

    it('should handle singular units', () => {
      const result = formatRelativeTime(1, 'minute', 'en');
      expect(result).toContain('1');
    });
  });

  describe('formatDuration', () => {
    it('should format duration in seconds', () => {
      expect(formatDuration(45, 'ko')).toBe('45초');
    });

    it('should format duration in minutes and seconds', () => {
      expect(formatDuration(125, 'en')).toBe('2분 5초');
    });

    it('should format duration in hours', () => {
      expect(formatDuration(3665, 'ko')).toBe('1시간 1분 5초');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0, 'en')).toBe('0초');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500, 'ko')).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(2048, 'en')).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(5242880, 'ko')).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824, 'en')).toBe('1 GB');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0, 'ko')).toBe('0 B');
    });
  });

  describe('formatTime', () => {
    const testDate = new Date('2024-01-15T14:30:45');

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
    const endDate = new Date('2024-01-20');

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
      expect(formatPhoneNumber('01012345678', 'ko')).toBe('010-1234-5678');
    });

    it('should format US phone number', () => {
      expect(formatPhoneNumber('2125551234', 'en')).toBe('(212) 555-1234');
    });

    it('should handle invalid format', () => {
      expect(formatPhoneNumber('123', 'ko')).toBe('123');
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
      expect(formatOrdinal(2, 'ko')).toBe('2번째');
      expect(formatOrdinal(10, 'ko')).toBe('10번째');
    });

    it('should format ordinal in English', () => {
      expect(formatOrdinal(1, 'en')).toBe('1st');
      expect(formatOrdinal(2, 'en')).toBe('2nd');
      expect(formatOrdinal(3, 'en')).toBe('3rd');
      expect(formatOrdinal(4, 'en')).toBe('4th');
      expect(formatOrdinal(11, 'en')).toBe('11th');
      expect(formatOrdinal(21, 'en')).toBe('21st');
      expect(formatOrdinal(22, 'en')).toBe('22nd');
      expect(formatOrdinal(23, 'en')).toBe('23rd');
    });
  });

  describe('formatPlural', () => {
    it('should format plural in Korean', () => {
      expect(formatPlural(0, 'item', 'items', 'ko')).toBe('0 items');
      expect(formatPlural(1, 'item', 'items', 'ko')).toBe('1 item');
      expect(formatPlural(5, 'item', 'items', 'ko')).toBe('5 items');
    });

    it('should format plural in English', () => {
      expect(formatPlural(0, 'item', 'items', 'en')).toBe('0 items');
      expect(formatPlural(1, 'item', 'items', 'en')).toBe('1 item');
      expect(formatPlural(10, 'item', 'items', 'en')).toBe('10 items');
    });
  });

  describe('formatList', () => {
    const items = ['apple', 'banana', 'orange'];

    it('should format list in Korean', () => {
      const result = formatList(items, 'ko');
      expect(result).toContain('apple');
      expect(result).toContain('banana');
      expect(result).toContain('orange');
    });

    it('should format list in English', () => {
      const result = formatList(items, 'en');
      expect(result).toBe('apple, banana, and orange');
    });

    it('should handle single item', () => {
      expect(formatList(['apple'], 'en')).toBe('apple');
    });

    it('should handle two items', () => {
      const result = formatList(['apple', 'banana'], 'en');
      expect(result).toBe('apple and banana');
    });

    it('should handle empty list', () => {
      expect(formatList([], 'en')).toBe('');
    });
  });
});
