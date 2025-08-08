import {
  escapeHtml,
  isValidUrl,
  isValidEmail,
  isValidPhone,
  isWithinLength,
  maskSensitiveInfo,
} from '../security';

describe('Security Utils', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
        '&lt;script&gt;alert("XSS")&lt;/script&gt;'
      );
      expect(escapeHtml('Hello & goodbye')).toBe('Hello &amp; goodbye');
      expect(escapeHtml('"quotes" and \'apostrophes\'')).toBe('"quotes" and \'apostrophes\'');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle normal text without special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
      expect(isValidUrl('https://sub.example.com:8080')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.kr')).toBe(true);
      expect(isValidEmail('123@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('010-1234-5678')).toBe(true);
      expect(isValidPhone('01012345678')).toBe(true);
      expect(isValidPhone('+82 10 1234 5678')).toBe(true);
      expect(isValidPhone('(02) 1234-5678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc-defg-hijk')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('12345')).toBe(false); // Too short
    });
  });

  describe('isWithinLength', () => {
    it('should check string length correctly', () => {
      expect(isWithinLength('Hello', 10)).toBe(true);
      expect(isWithinLength('Hello', 5)).toBe(true);
      expect(isWithinLength('Hello', 4)).toBe(false);
      expect(isWithinLength('', 0)).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(isWithinLength('Test', 4)).toBe(true); // Exact length
      expect(isWithinLength('안녕하세요', 5)).toBe(true); // Unicode characters
    });
  });

  describe('maskSensitiveInfo', () => {
    it('should mask sensitive information correctly', () => {
      expect(maskSensitiveInfo('1234567890123456', 4, 4)).toBe('1234********3456');
      expect(maskSensitiveInfo('johndoe@example.com', 3, 4)).toBe('joh************.com');
      expect(maskSensitiveInfo('010-1234-5678')).toBe('010******5678');
    });

    it('should handle short strings', () => {
      expect(maskSensitiveInfo('12345', 3, 4)).toBe('12345'); // Too short to mask
      expect(maskSensitiveInfo('1234567', 3, 4)).toBe('1234567'); // Exactly at limit
    });

    it('should handle custom visible lengths', () => {
      expect(maskSensitiveInfo('secret-password', 2, 2)).toBe('se***********rd');
      expect(maskSensitiveInfo('confidential', 0, 0)).toBe('************');
    });

    it('should handle edge cases', () => {
      expect(maskSensitiveInfo('', 3, 4)).toBe('');
      expect(maskSensitiveInfo('abc', 1, 1)).toBe('a*c');
    });
  });
});
