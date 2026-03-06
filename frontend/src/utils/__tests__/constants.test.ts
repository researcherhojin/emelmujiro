import * as constants from '../constants';

vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

describe('constants', () => {
  describe('Inquiry Type Map', () => {
    it('should have getInquiryTypeMap defined and return correct keys', () => {
      const map = constants.getInquiryTypeMap();
      expect(map).toBeDefined();
      expect(typeof map).toBe('object');
      expect(map.consulting).toBe('constants.inquiryTypes.consulting');
      expect(map.education).toBe('constants.inquiryTypes.education');
      expect(map.llm).toBe('constants.inquiryTypes.llm');
      expect(map.data).toBe('constants.inquiryTypes.data');
    });
  });
  describe('Contact Information', () => {
    it('should have CONTACT_EMAIL defined', () => {
      expect(constants.CONTACT_EMAIL).toBeDefined();
      expect(typeof constants.CONTACT_EMAIL).toBe('string');
      expect(constants.CONTACT_EMAIL).toContain('@');
    });
  });
  describe('Form Limits', () => {
    it('should have FORM_LIMITS defined', () => {
      expect(constants.FORM_LIMITS).toBeDefined();
      expect(typeof constants.FORM_LIMITS).toBe('object');
      expect(constants.FORM_LIMITS.name).toHaveProperty('min');
      expect(constants.FORM_LIMITS.name).toHaveProperty('max');
      expect(constants.FORM_LIMITS.email).toHaveProperty('min');
      expect(constants.FORM_LIMITS.email).toHaveProperty('max');
      expect(constants.FORM_LIMITS.message).toHaveProperty('min');
      expect(constants.FORM_LIMITS.message).toHaveProperty('max');
    });

    it('should have valid form limits', () => {
      expect(constants.FORM_LIMITS.name.min).toBeLessThanOrEqual(
        constants.FORM_LIMITS.name.max
      );
      expect(constants.FORM_LIMITS.email.min).toBeLessThanOrEqual(
        constants.FORM_LIMITS.email.max
      );
      expect(constants.FORM_LIMITS.message.min).toBeLessThanOrEqual(
        constants.FORM_LIMITS.message.max
      );
    });
  });
  describe('Business Hours', () => {
    it('should have getBusinessHours defined', () => {
      const hours = constants.getBusinessHours();
      expect(hours).toBeDefined();
      expect(typeof hours).toBe('object');
      expect(hours.weekdays).toBeDefined();
      expect(hours.weekends).toBeDefined();
    });
  });
  describe('Response Time', () => {
    it('should have getResponseTime defined', () => {
      const responseTime = constants.getResponseTime();
      expect(responseTime).toBeDefined();
      expect(typeof responseTime).toBe('string');
    });
  });
  describe('Service Categories', () => {
    it('should have getServiceCategories defined', () => {
      const categories = constants.getServiceCategories();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should have valid service category structure', () => {
      constants.getServiceCategories().forEach((category) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('features');
      });
    });
  });
  describe('Animation Duration', () => {
    it('should have ANIMATION_DURATION defined', () => {
      expect(constants.ANIMATION_DURATION).toBeDefined();
      expect(typeof constants.ANIMATION_DURATION).toBe('object');
      expect(constants.ANIMATION_DURATION.fast).toBeDefined();
      expect(constants.ANIMATION_DURATION.normal).toBeDefined();
      expect(constants.ANIMATION_DURATION.slow).toBeDefined();
    });

    it('should have valid animation durations', () => {
      expect(constants.ANIMATION_DURATION.fast).toBeLessThan(
        constants.ANIMATION_DURATION.normal
      );
      expect(constants.ANIMATION_DURATION.normal).toBeLessThan(
        constants.ANIMATION_DURATION.slow
      );
    });
  });
  describe('Breakpoints', () => {
    it('should have BREAKPOINTS defined', () => {
      expect(constants.BREAKPOINTS).toBeDefined();
      expect(typeof constants.BREAKPOINTS).toBe('object');
      expect(constants.BREAKPOINTS.xs).toBeDefined();
      expect(constants.BREAKPOINTS.sm).toBeDefined();
      expect(constants.BREAKPOINTS.md).toBeDefined();
      expect(constants.BREAKPOINTS.lg).toBeDefined();
      expect(constants.BREAKPOINTS.xl).toBeDefined();
    });

    it('should have ascending breakpoint values', () => {
      expect(constants.BREAKPOINTS.xs).toBeLessThan(constants.BREAKPOINTS.sm);
      expect(constants.BREAKPOINTS.sm).toBeLessThan(constants.BREAKPOINTS.md);
      expect(constants.BREAKPOINTS.md).toBeLessThan(constants.BREAKPOINTS.lg);
      expect(constants.BREAKPOINTS.lg).toBeLessThan(constants.BREAKPOINTS.xl);
    });
  });
  describe('API Endpoints', () => {
    it('should have API_ENDPOINTS defined', () => {
      expect(constants.API_ENDPOINTS).toBeDefined();
      expect(typeof constants.API_ENDPOINTS).toBe('object');
      expect(constants.API_ENDPOINTS.blog).toBeDefined();
      expect(constants.API_ENDPOINTS.contact).toBeDefined();
      expect(constants.API_ENDPOINTS.newsletter).toBeDefined();
      expect(constants.API_ENDPOINTS.auth).toBeDefined();
    });

    it('should have valid API endpoint paths', () => {
      Object.values(constants.API_ENDPOINTS).forEach((endpoint) => {
        expect(typeof endpoint).toBe('string');
        expect(endpoint).toMatch(/^\/api\//);
      });
    });
  });
  describe('Storage Keys', () => {
    it('should have STORAGE_KEYS defined', () => {
      expect(constants.STORAGE_KEYS).toBeDefined();
      expect(typeof constants.STORAGE_KEYS).toBe('object');
      expect(constants.STORAGE_KEYS.authToken).toBeDefined();
      expect(constants.STORAGE_KEYS.userPreferences).toBeDefined();
      expect(constants.STORAGE_KEYS.theme).toBeDefined();
      expect(constants.STORAGE_KEYS.language).toBeDefined();
    });

    it('should have unique storage keys', () => {
      const values = Object.values(constants.STORAGE_KEYS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });
  describe('Languages', () => {
    it('should have getLanguages defined', () => {
      const languages = constants.getLanguages();
      expect(languages).toBeDefined();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
    });

    it('should have valid language structure', () => {
      constants.getLanguages().forEach((lang) => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
      });
    });

    it('should include Korean and English', () => {
      const codes = constants.getLanguages().map((lang) => lang.code);
      expect(codes).toContain('ko');
      expect(codes).toContain('en');
    });
  });
  describe('Default Meta', () => {
    it('should have getDefaultMeta defined', () => {
      const meta = constants.getDefaultMeta();
      expect(meta).toBeDefined();
      expect(typeof meta).toBe('object');
      expect(meta.title).toBeDefined();
      expect(meta.description).toBeDefined();
      expect(meta.keywords).toBeDefined();
      expect(meta.ogImage).toBeDefined();
    });

    it('should have valid meta values', () => {
      const meta = constants.getDefaultMeta();
      expect(typeof meta.title).toBe('string');
      expect(typeof meta.description).toBe('string');
      expect(typeof meta.keywords).toBe('string');
      expect(typeof meta.ogImage).toBe('string');
      expect(meta.title.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
    });
  });
});
