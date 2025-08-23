import * as constants from '../constants';

describe('constants', () => {
  describe('Inquiry Type Map', () => {
    it('should have INQUIRY_TYPE_MAP defined', () => {
      expect(constants.INQUIRY_TYPE_MAP).toBeDefined();
      expect(typeof constants.INQUIRY_TYPE_MAP).toBe('object');
      expect(constants.INQUIRY_TYPE_MAP.consulting).toBe('AI 컨설팅');
      expect(constants.INQUIRY_TYPE_MAP.education).toBe('기업 AI 교육');
      expect(constants.INQUIRY_TYPE_MAP.llm).toBe('LLM 솔루션');
      expect(constants.INQUIRY_TYPE_MAP.data).toBe('데이터 분석');
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
    it('should have BUSINESS_HOURS defined', () => {
      expect(constants.BUSINESS_HOURS).toBeDefined();
      expect(typeof constants.BUSINESS_HOURS).toBe('object');
      expect(constants.BUSINESS_HOURS.weekdays).toBeDefined();
      expect(constants.BUSINESS_HOURS.weekends).toBeDefined();
    });
  });

  describe('Response Time', () => {
    it('should have RESPONSE_TIME defined', () => {
      expect(constants.RESPONSE_TIME).toBeDefined();
      expect(typeof constants.RESPONSE_TIME).toBe('string');
    });
  });

  describe('Service Categories', () => {
    it('should have SERVICE_CATEGORIES defined', () => {
      expect(constants.SERVICE_CATEGORIES).toBeDefined();
      expect(Array.isArray(constants.SERVICE_CATEGORIES)).toBe(true);
      expect(constants.SERVICE_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('should have valid service category structure', () => {
      constants.SERVICE_CATEGORIES.forEach((category) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('features');
        expect(Array.isArray(category.features)).toBe(true);
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
    it('should have LANGUAGES defined', () => {
      expect(constants.LANGUAGES).toBeDefined();
      expect(Array.isArray(constants.LANGUAGES)).toBe(true);
      expect(constants.LANGUAGES.length).toBeGreaterThan(0);
    });

    it('should have valid language structure', () => {
      constants.LANGUAGES.forEach((lang) => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
      });
    });

    it('should include Korean and English', () => {
      const codes = constants.LANGUAGES.map((lang) => lang.code);
      expect(codes).toContain('ko');
      expect(codes).toContain('en');
    });
  });

  describe('Default Meta', () => {
    it('should have DEFAULT_META defined', () => {
      expect(constants.DEFAULT_META).toBeDefined();
      expect(typeof constants.DEFAULT_META).toBe('object');
      expect(constants.DEFAULT_META.title).toBeDefined();
      expect(constants.DEFAULT_META.description).toBeDefined();
      expect(constants.DEFAULT_META.keywords).toBeDefined();
      expect(constants.DEFAULT_META.ogImage).toBeDefined();
    });

    it('should have valid meta values', () => {
      expect(typeof constants.DEFAULT_META.title).toBe('string');
      expect(typeof constants.DEFAULT_META.description).toBe('string');
      expect(typeof constants.DEFAULT_META.keywords).toBe('string');
      expect(typeof constants.DEFAULT_META.ogImage).toBe('string');
      expect(constants.DEFAULT_META.title.length).toBeGreaterThan(0);
      expect(constants.DEFAULT_META.description.length).toBeGreaterThan(0);
    });
  });
});
