import {
  escapeHtml,
  isValidUrl,
  isValidEmail,
  isValidPhone,
  isWithinLength,
  maskSensitiveInfo,
} from '../security';

describe('Security Utilities', () => {
  describe('escapeHtml', () => {
    it('should escape HTML tags', () => {
      const input = '<script>alert("XSS")</script>';
      const result = escapeHtml(input);
      expect(result).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    });

    it('should escape special characters', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
      expect(escapeHtml('&')).toBe('&amp;');
      // Note: The actual implementation uses textContent which doesn't escape quotes
      expect(escapeHtml('"')).toBe('"');
      expect(escapeHtml("'")).toBe("'");
    });

    it('should handle normal text', () => {
      const input = 'Normal text without HTML';
      expect(escapeHtml(input)).toBe(input);
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('isValidUrl', () => {
    it('should validate HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('http://192.168.1.1')).toBe(true);
    });

    it('should validate HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://www.example.com/path')).toBe(true);
      expect(isValidUrl('https://api.example.com/v1/endpoint')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('file:///etc/passwd')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    it('should handle URLs with query parameters', () => {
      expect(isValidUrl('https://example.com?param=value')).toBe(true);
      expect(isValidUrl('https://example.com?a=1&b=2')).toBe(true);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.kr')).toBe(true);
      expect(isValidEmail('user123@subdomain.example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@example')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('a@b.c')).toBe(true);
      expect(isValidEmail('user@localhost.localdomain')).toBe(true);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone formats', () => {
      expect(isValidPhone('010-1234-5678')).toBe(true);
      expect(isValidPhone('01012345678')).toBe(true);
      expect(isValidPhone('+82-10-1234-5678')).toBe(true);
      expect(isValidPhone('(02) 1234-5678')).toBe(true);
      expect(isValidPhone('02 1234 5678')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(isValidPhone('123')).toBe(false); // Too short
      expect(isValidPhone('abc-1234-5678')).toBe(false); // Contains letters
      expect(isValidPhone('!@#$%^&*()')).toBe(false); // Special characters
      expect(isValidPhone('')).toBe(false);
    });

    it('should require minimum 10 digits', () => {
      expect(isValidPhone('123456789')).toBe(false); // 9 digits
      expect(isValidPhone('1234567890')).toBe(true); // 10 digits
    });
  });

  describe('isWithinLength', () => {
    it('should check if string is within length limit', () => {
      expect(isWithinLength('hello', 10)).toBe(true);
      expect(isWithinLength('hello', 5)).toBe(true);
      expect(isWithinLength('hello', 4)).toBe(false);
    });

    it('should handle empty string', () => {
      expect(isWithinLength('', 0)).toBe(true);
      expect(isWithinLength('', 10)).toBe(true);
    });

    it('should handle exact length', () => {
      expect(isWithinLength('12345', 5)).toBe(true);
    });
  });

  describe('maskSensitiveInfo', () => {
    it('should mask middle part of string', () => {
      const result = maskSensitiveInfo('1234567890123456', 3, 4);
      expect(result).toBe('123*********3456');
    });

    it('should use default values', () => {
      const result = maskSensitiveInfo('1234567890');
      expect(result).toBe('123***7890');
    });

    it('should handle short strings', () => {
      // String shorter than visibleStart + visibleEnd
      const result = maskSensitiveInfo('12345', 3, 4);
      expect(result).toBe('12345');
    });

    it('should handle no end visible', () => {
      const result = maskSensitiveInfo('1234567890', 3, 0);
      expect(result).toBe('123*******');
    });

    it('should mask email addresses', () => {
      const email = 'user@example.com';
      const result = maskSensitiveInfo(email, 3, 8);
      expect(result).toBe('use*****mple.com');
    });

    it('should mask phone numbers', () => {
      const phone = '010-1234-5678';
      const result = maskSensitiveInfo(phone, 4, 4);
      expect(result).toBe('010-*****5678');
    });
  });
});
