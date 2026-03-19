import * as constants from '../constants';

describe('constants', () => {
  describe('Site URL', () => {
    it('should have SITE_URL defined as a valid HTTPS URL', () => {
      expect(constants.SITE_URL).toBeDefined();
      expect(typeof constants.SITE_URL).toBe('string');
      expect(constants.SITE_URL).toMatch(/^https:\/\//);
    });

    it('should not have a trailing slash', () => {
      expect(constants.SITE_URL.endsWith('/')).toBe(false);
    });
  });
  describe('Contact Information', () => {
    it('should have CONTACT_EMAIL defined', () => {
      expect(constants.CONTACT_EMAIL).toBeDefined();
      expect(typeof constants.CONTACT_EMAIL).toBe('string');
      expect(constants.CONTACT_EMAIL).toContain('@');
    });
  });
});
