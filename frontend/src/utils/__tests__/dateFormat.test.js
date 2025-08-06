import { formatDate } from '../dateFormat';

describe('dateFormat', () => {
    describe('formatDate', () => {
        it('should format date in Korean format', () => {
            const date = '2024-01-15';
            const formatted = formatDate(date);
            expect(formatted).toBe('2024년 1월 15일');
        });

        it('should handle datetime strings', () => {
            const datetime = '2024-03-20T10:30:00Z';
            const formatted = formatDate(datetime);
            expect(formatted).toBe('2024년 3월 20일');
        });

        it('should handle different date formats', () => {
            const dates = [
                { input: '2024-12-25', expected: '2024년 12월 25일' },
                { input: '2024-01-01', expected: '2024년 1월 1일' },
                { input: '2024-07-15', expected: '2024년 7월 15일' },
            ];

            dates.forEach(({ input, expected }) => {
                expect(formatDate(input)).toBe(expected);
            });
        });

        it('should handle invalid dates', () => {
            const invalidDate = 'invalid-date';
            const formatted = formatDate(invalidDate);
            expect(formatted).toBe('Invalid Date');
        });
    });
});