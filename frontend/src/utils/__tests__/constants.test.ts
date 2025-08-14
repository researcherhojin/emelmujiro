import * as constants from '../constants';

describe('constants', () => {
  describe('API configuration', () => {
    it('should have API_URL defined', () => {
      expect(constants.API_URL).toBeDefined();
      expect(typeof constants.API_URL).toBe('string');
    });

    it('should have API_TIMEOUT defined', () => {
      expect(constants.API_TIMEOUT).toBeDefined();
      expect(typeof constants.API_TIMEOUT).toBe('number');
      expect(constants.API_TIMEOUT).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    it('should have DEFAULT_PAGE_SIZE defined', () => {
      expect(constants.DEFAULT_PAGE_SIZE).toBeDefined();
      expect(typeof constants.DEFAULT_PAGE_SIZE).toBe('number');
      expect(constants.DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
    });

    it('should have MAX_PAGE_SIZE defined', () => {
      expect(constants.MAX_PAGE_SIZE).toBeDefined();
      expect(typeof constants.MAX_PAGE_SIZE).toBe('number');
      expect(constants.MAX_PAGE_SIZE).toBeGreaterThanOrEqual(
        constants.DEFAULT_PAGE_SIZE
      );
    });
  });

  describe('Storage keys', () => {
    it('should have LOCAL_STORAGE_KEYS defined', () => {
      expect(constants.LOCAL_STORAGE_KEYS).toBeDefined();
      expect(typeof constants.LOCAL_STORAGE_KEYS).toBe('object');
    });

    it('should have SESSION_STORAGE_KEYS defined', () => {
      expect(constants.SESSION_STORAGE_KEYS).toBeDefined();
      expect(typeof constants.SESSION_STORAGE_KEYS).toBe('object');
    });
  });

  describe('Routes', () => {
    it('should have ROUTES defined', () => {
      expect(constants.ROUTES).toBeDefined();
      expect(typeof constants.ROUTES).toBe('object');
    });

    it('should have essential routes', () => {
      expect(constants.ROUTES).toHaveProperty('HOME');
      expect(constants.ROUTES).toHaveProperty('ABOUT');
      expect(constants.ROUTES).toHaveProperty('CONTACT');
      expect(constants.ROUTES).toHaveProperty('BLOG');
    });
  });

  describe('Validation', () => {
    it('should have VALIDATION_RULES defined', () => {
      expect(constants.VALIDATION_RULES).toBeDefined();
      expect(typeof constants.VALIDATION_RULES).toBe('object');
    });

    it('should have email validation pattern', () => {
      expect(constants.VALIDATION_RULES).toHaveProperty('email');
      expect(constants.VALIDATION_RULES.email).toHaveProperty('pattern');
    });

    it('should have phone validation pattern', () => {
      expect(constants.VALIDATION_RULES).toHaveProperty('phone');
      expect(constants.VALIDATION_RULES.phone).toHaveProperty('pattern');
    });
  });

  describe('Error messages', () => {
    it('should have ERROR_MESSAGES defined', () => {
      expect(constants.ERROR_MESSAGES).toBeDefined();
      expect(typeof constants.ERROR_MESSAGES).toBe('object');
    });

    it('should have network error message', () => {
      expect(constants.ERROR_MESSAGES).toHaveProperty('NETWORK_ERROR');
      expect(typeof constants.ERROR_MESSAGES.NETWORK_ERROR).toBe('string');
    });

    it('should have validation error message', () => {
      expect(constants.ERROR_MESSAGES).toHaveProperty('VALIDATION_ERROR');
      expect(typeof constants.ERROR_MESSAGES.VALIDATION_ERROR).toBe('string');
    });
  });

  describe('Feature flags', () => {
    it('should have FEATURE_FLAGS defined', () => {
      expect(constants.FEATURE_FLAGS).toBeDefined();
      expect(typeof constants.FEATURE_FLAGS).toBe('object');
    });

    it('should have dark mode flag', () => {
      expect(constants.FEATURE_FLAGS).toHaveProperty('ENABLE_DARK_MODE');
      expect(typeof constants.FEATURE_FLAGS.ENABLE_DARK_MODE).toBe('boolean');
    });

    it('should have PWA flag', () => {
      expect(constants.FEATURE_FLAGS).toHaveProperty('ENABLE_PWA');
      expect(typeof constants.FEATURE_FLAGS.ENABLE_PWA).toBe('boolean');
    });
  });

  describe('Date formats', () => {
    it('should have DATE_FORMATS defined', () => {
      expect(constants.DATE_FORMATS).toBeDefined();
      expect(typeof constants.DATE_FORMATS).toBe('object');
    });

    it('should have short date format', () => {
      expect(constants.DATE_FORMATS).toHaveProperty('SHORT');
      expect(typeof constants.DATE_FORMATS.SHORT).toBe('string');
    });

    it('should have long date format', () => {
      expect(constants.DATE_FORMATS).toHaveProperty('LONG');
      expect(typeof constants.DATE_FORMATS.LONG).toBe('string');
    });
  });

  describe('Breakpoints', () => {
    it('should have BREAKPOINTS defined', () => {
      expect(constants.BREAKPOINTS).toBeDefined();
      expect(typeof constants.BREAKPOINTS).toBe('object');
    });

    it('should have mobile breakpoint', () => {
      expect(constants.BREAKPOINTS).toHaveProperty('MOBILE');
      expect(typeof constants.BREAKPOINTS.MOBILE).toBe('number');
    });

    it('should have tablet breakpoint', () => {
      expect(constants.BREAKPOINTS).toHaveProperty('TABLET');
      expect(typeof constants.BREAKPOINTS.TABLET).toBe('number');
    });

    it('should have desktop breakpoint', () => {
      expect(constants.BREAKPOINTS).toHaveProperty('DESKTOP');
      expect(typeof constants.BREAKPOINTS.DESKTOP).toBe('number');
    });
  });

  describe('Limits', () => {
    it('should have MAX_FILE_SIZE defined', () => {
      expect(constants.MAX_FILE_SIZE).toBeDefined();
      expect(typeof constants.MAX_FILE_SIZE).toBe('number');
      expect(constants.MAX_FILE_SIZE).toBeGreaterThan(0);
    });

    it('should have MAX_MESSAGE_LENGTH defined', () => {
      expect(constants.MAX_MESSAGE_LENGTH).toBeDefined();
      expect(typeof constants.MAX_MESSAGE_LENGTH).toBe('number');
      expect(constants.MAX_MESSAGE_LENGTH).toBeGreaterThan(0);
    });

    it('should have DEBOUNCE_DELAY defined', () => {
      expect(constants.DEBOUNCE_DELAY).toBeDefined();
      expect(typeof constants.DEBOUNCE_DELAY).toBe('number');
      expect(constants.DEBOUNCE_DELAY).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Social media links', () => {
    it('should have SOCIAL_LINKS defined', () => {
      expect(constants.SOCIAL_LINKS).toBeDefined();
      expect(typeof constants.SOCIAL_LINKS).toBe('object');
    });

    it('should have GitHub link', () => {
      expect(constants.SOCIAL_LINKS).toHaveProperty('GITHUB');
      expect(typeof constants.SOCIAL_LINKS.GITHUB).toBe('string');
    });

    it('should have LinkedIn link', () => {
      expect(constants.SOCIAL_LINKS).toHaveProperty('LINKEDIN');
      expect(typeof constants.SOCIAL_LINKS.LINKEDIN).toBe('string');
    });
  });

  describe('Animation durations', () => {
    it('should have ANIMATION_DURATION defined', () => {
      expect(constants.ANIMATION_DURATION).toBeDefined();
      expect(typeof constants.ANIMATION_DURATION).toBe('object');
    });

    it('should have short animation duration', () => {
      expect(constants.ANIMATION_DURATION).toHaveProperty('SHORT');
      expect(typeof constants.ANIMATION_DURATION.SHORT).toBe('number');
    });

    it('should have medium animation duration', () => {
      expect(constants.ANIMATION_DURATION).toHaveProperty('MEDIUM');
      expect(typeof constants.ANIMATION_DURATION.MEDIUM).toBe('number');
    });

    it('should have long animation duration', () => {
      expect(constants.ANIMATION_DURATION).toHaveProperty('LONG');
      expect(typeof constants.ANIMATION_DURATION.LONG).toBe('number');
    });
  });
});
