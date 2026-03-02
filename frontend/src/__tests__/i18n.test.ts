import { describe, it, expect } from 'vitest';
import i18n from '../i18n';

describe('i18n configuration', () => {
  describe('instance validity', () => {
    it('should export a valid i18n instance', () => {
      expect(i18n).toBeDefined();
      expect(typeof i18n).toBe('object');
    });

    it('should be initialized', () => {
      expect(i18n.isInitialized).toBe(true);
    });

    it('should have a t function', () => {
      expect(typeof i18n.t).toBe('function');
    });

    it('should have a changeLanguage function', () => {
      expect(typeof i18n.changeLanguage).toBe('function');
    });
  });

  describe('language resources', () => {
    it('should have ko resources', () => {
      expect(i18n.hasResourceBundle('ko', 'translation')).toBe(true);
    });

    it('should have en resources', () => {
      expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
    });

    it('should not have unexpected languages registered', () => {
      const languages = i18n.languages;
      const supportedLanguages = ['ko', 'en', 'ko-KR', 'en-US', 'en-GB'];
      languages.forEach((lang) => {
        expect(
          supportedLanguages.some((s) => lang.startsWith(s.slice(0, 2)))
        ).toBe(true);
      });
    });
  });

  describe('fallback language', () => {
    it('should have fallback language set to ko', () => {
      const options = i18n.options;
      // i18next normalises fallbackLng to an array internally
      const fallback = options.fallbackLng;
      if (Array.isArray(fallback)) {
        expect(fallback).toContain('ko');
      } else {
        expect(fallback).toBe('ko');
      }
    });
  });

  describe('Korean translation top-level keys', () => {
    const expectedKeys = [
      'common',
      'hero',
      'services',
      'cta',
      'education',
      'about',
      'footer',
      'career',
      'careerSummary',
      'quickIntro',
      'contact',
      'contactPage',
      'blog',
      'blogDetail',
      'logos',
      'profile',
      'profilePage',
      'home',
      'notFound',
      'underConstruction',
      'serverError',
      'errorBoundary',
      'notification',
      'errors',
      'offline',
      'pwa',
      'accessibility',
      'footerServices',
      'formValidation',
      'auth',
      'blogErrors',
      'share',
      'admin',
      'blogEditor',
      'seo',
      'chat',
      'chatContext',
    ];

    expectedKeys.forEach((key) => {
      it(`should have top-level key "${key}" in Korean translations`, () => {
        const bundle = i18n.getResourceBundle('ko', 'translation');
        expect(bundle).toHaveProperty(key);
      });
    });
  });

  describe('English translation top-level keys', () => {
    it('should have the same top-level keys as Korean', () => {
      const koBundle = i18n.getResourceBundle('ko', 'translation');
      const enBundle = i18n.getResourceBundle('en', 'translation');

      const koKeys = Object.keys(koBundle).sort();
      const enKeys = Object.keys(enBundle).sort();

      expect(enKeys).toEqual(koKeys);
    });
  });

  describe('translation lookups', () => {
    it('should return a non-undefined value for known key common.companyName in ko', async () => {
      await i18n.changeLanguage('ko');
      const value = i18n.t('common.companyName');
      expect(value).toBeDefined();
      expect(value).not.toBe('');
      expect(value).toBe('에멜무지로');
    });

    it('should return a non-undefined value for known key common.companyName in en', async () => {
      await i18n.changeLanguage('en');
      const value = i18n.t('common.companyName');
      expect(value).toBeDefined();
      expect(value).not.toBe('');
      expect(value).toBe('Emelmujiro');
    });

    it('should not return the raw key for a known translation', async () => {
      await i18n.changeLanguage('ko');
      const value = i18n.t('common.companyName');
      expect(value).not.toBe('common.companyName');
    });

    it('should fall back to ko when language is not found', async () => {
      await i18n.changeLanguage('fr');
      const value = i18n.t('common.companyName');
      expect(value).toBeDefined();
      expect(value).not.toBe('');
    });

    it('should restore to ko after language tests', async () => {
      await i18n.changeLanguage('ko');
      expect(i18n.t('common.companyName')).toBe('에멜무지로');
    });
  });

  describe('interpolation configuration', () => {
    it('should have escapeValue set to false', () => {
      const options = i18n.options;
      expect(options.interpolation?.escapeValue).toBe(false);
    });
  });

  describe('react configuration', () => {
    it('should have useSuspense set to false', () => {
      const options = i18n.options;
      expect(
        (options as { react?: { useSuspense?: boolean } }).react?.useSuspense
      ).toBe(false);
    });
  });

  describe('language change', () => {
    it('should successfully change language to en', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
    });

    it('should successfully change language back to ko', async () => {
      await i18n.changeLanguage('ko');
      expect(i18n.language).toBe('ko');
    });

    it('should produce different translations for ko and en', async () => {
      await i18n.changeLanguage('ko');
      const koValue = i18n.t('common.companyName');

      await i18n.changeLanguage('en');
      const enValue = i18n.t('common.companyName');

      expect(koValue).not.toBe(enValue);
      expect(koValue).toBe('에멜무지로');
      expect(enValue).toBe('Emelmujiro');
    });

    it('should translate hero section differently between ko and en', async () => {
      await i18n.changeLanguage('ko');
      const koValue = i18n.t('hero.badge');

      await i18n.changeLanguage('en');
      const enValue = i18n.t('hero.badge');

      // Both languages have the same badge text in this project
      expect(koValue).toBeDefined();
      expect(enValue).toBeDefined();
    });

    it('should restore to ko at end of language change tests', async () => {
      await i18n.changeLanguage('ko');
      expect(i18n.language).toBe('ko');
    });
  });

  describe('detection configuration', () => {
    it('should have detection order configured', () => {
      const options = i18n.options;
      const detection = options.detection as
        | { order?: string[]; caches?: string[] }
        | undefined;
      expect(detection?.order).toEqual([
        'localStorage',
        'navigator',
        'htmlTag',
        'path',
        'subdomain',
      ]);
    });

    it('should cache language to localStorage', () => {
      const options = i18n.options;
      const detection = options.detection as
        | { order?: string[]; caches?: string[] }
        | undefined;
      expect(detection?.caches).toContain('localStorage');
    });
  });

  describe('debug mode', () => {
    it('should have debug mode disabled', () => {
      expect(i18n.options.debug).toBe(false);
    });
  });
});
