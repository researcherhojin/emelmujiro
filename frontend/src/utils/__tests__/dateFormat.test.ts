import { formatDate } from '../dateFormat';

describe('DateFormat Utility', () => {
  describe('formatDate', () => {
    it('should format date string in Korean format', () => {
      const dateString = '2025-01-15';
      const result = formatDate(dateString);
      expect(result).toBe('2025년 1월 15일');
    });

    it('should format ISO date string', () => {
      const dateString = '2025-12-25T10:30:00Z';
      const result = formatDate(dateString);
      expect(result).toBe('2025년 12월 25일');
    });

    it('should format date with different months', () => {
      expect(formatDate('2025-03-01')).toBe('2025년 3월 1일');
      expect(formatDate('2025-06-15')).toBe('2025년 6월 15일');
      expect(formatDate('2025-09-30')).toBe('2025년 9월 30일');
      expect(formatDate('2025-12-31')).toBe('2025년 12월 31일');
    });

    it('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29';
      const result = formatDate(leapYearDate);
      expect(result).toBe('2024년 2월 29일');
    });

    it('should handle timestamps', () => {
      const timestamp = '2025-01-15T14:30:00.000Z';
      const result = formatDate(timestamp);
      expect(result).toBe('2025년 1월 15일');
    });

    it('should handle invalid date strings', () => {
      const invalidDate = 'invalid-date';
      const result = formatDate(invalidDate);
      expect(result).toBe('Invalid Date');
    });

    it('should handle empty string', () => {
      const result = formatDate('');
      expect(result).toBe('Invalid Date');
    });

    it('should handle dates from different years', () => {
      expect(formatDate('2020-01-01')).toBe('2020년 1월 1일');
      expect(formatDate('2023-07-15')).toBe('2023년 7월 15일');
      expect(formatDate('2030-12-31')).toBe('2030년 12월 31일');
    });

    it('should handle single digit days and months correctly', () => {
      expect(formatDate('2025-01-01')).toBe('2025년 1월 1일');
      expect(formatDate('2025-01-09')).toBe('2025년 1월 9일');
      expect(formatDate('2025-10-01')).toBe('2025년 10월 1일');
    });

    it('should handle date objects converted to string', () => {
      const date = new Date('2025-05-20');
      const result = formatDate(date.toISOString());
      expect(result).toBe('2025년 5월 20일');
    });
  });
});
