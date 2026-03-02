import { describe, it, expect, vi } from 'vitest';

vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

import { getServices, services } from '../footerData';
import type { Services, ServiceDetail } from '../footerData';

describe('footerData', () => {
  const expectedKeys = [
    'ai-education',
    'ai-consulting',
    'llm-genai',
    'computer-vision',
  ];

  describe('getServices()', () => {
    it('should return an object with all expected service keys', () => {
      const result = getServices();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expectedKeys.forEach((key) => {
        expect(result).toHaveProperty(key);
      });
    });

    it('should return exactly the expected number of services', () => {
      const result = getServices();
      const keys = Object.keys(result);

      expect(keys).toHaveLength(expectedKeys.length);
      expect(keys.sort()).toEqual(expectedKeys.sort());
    });

    it('should have required fields for each service', () => {
      const result = getServices();

      Object.entries(result).forEach(
        ([key, service]: [string, ServiceDetail]) => {
          expect(service.title).toBeDefined();
          expect(typeof service.title).toBe('string');
          expect(service.title.trim()).not.toBe('');

          expect(service.description).toBeDefined();
          expect(typeof service.description).toBe('string');
          expect(service.description.trim()).not.toBe('');

          expect(service.icon).toBeDefined();
          // lucide-react icons are globally mocked as Proxy objects in setupTests.ts
          expect(service.icon).toBeTruthy();

          expect(service.details).toBeDefined();
          expect(Array.isArray(service.details)).toBe(true);
          expect(service.details.length).toBeGreaterThan(0);

          service.details.forEach((detail) => {
            expect(typeof detail).toBe('string');
            expect(detail.trim()).not.toBe('');
          });
        }
      );
    });

    it('should have 6 details for each service', () => {
      const result = getServices();

      Object.values(result).forEach((service: ServiceDetail) => {
        expect(service.details).toHaveLength(6);
      });
    });

    it('should use i18n translation keys for titles', () => {
      const result = getServices();

      expect(result['ai-education'].title).toBe(
        'footerServices.education.title'
      );
      expect(result['ai-consulting'].title).toBe(
        'footerServices.consulting.title'
      );
      expect(result['llm-genai'].title).toBe('footerServices.llmGenai.title');
      expect(result['computer-vision'].title).toBe(
        'footerServices.computerVision.title'
      );
    });

    it('should use i18n translation keys for descriptions', () => {
      const result = getServices();

      expect(result['ai-education'].description).toBe(
        'footerServices.education.description'
      );
      expect(result['ai-consulting'].description).toBe(
        'footerServices.consulting.description'
      );
      expect(result['llm-genai'].description).toBe(
        'footerServices.llmGenai.description'
      );
      expect(result['computer-vision'].description).toBe(
        'footerServices.computerVision.description'
      );
    });

    it('should use i18n translation keys for details', () => {
      const result = getServices();

      result['ai-education'].details.forEach((detail, index) => {
        expect(detail).toBe(`footerServices.education.details.${index}`);
      });

      result['ai-consulting'].details.forEach((detail, index) => {
        expect(detail).toBe(`footerServices.consulting.details.${index}`);
      });

      result['llm-genai'].details.forEach((detail, index) => {
        expect(detail).toBe(`footerServices.llmGenai.details.${index}`);
      });

      result['computer-vision'].details.forEach((detail, index) => {
        expect(detail).toBe(`footerServices.computerVision.details.${index}`);
      });
    });

    it('should assign distinct icons to each service', () => {
      const result = getServices();
      const icons = Object.values(result).map((s: ServiceDetail) => s.icon);
      const uniqueIcons = new Set(icons);

      expect(uniqueIcons.size).toBe(icons.length);
    });
  });

  describe('services (static export)', () => {
    it('should be defined and have the same keys as getServices()', () => {
      expect(services).toBeDefined();
      expect(Object.keys(services).sort()).toEqual(expectedKeys.sort());
    });

    it('should have valid ServiceDetail objects', () => {
      Object.values(services).forEach((service: ServiceDetail) => {
        expect(service).toHaveProperty('title');
        expect(service).toHaveProperty('description');
        expect(service).toHaveProperty('icon');
        expect(service).toHaveProperty('details');
      });
    });
  });

  describe('type safety', () => {
    it('should satisfy the Services interface', () => {
      const result: Services = getServices();
      expect(result).toBeDefined();

      // Each value should satisfy ServiceDetail
      Object.values(result).forEach((service) => {
        const detail: ServiceDetail = service;
        expect(detail.title).toBeDefined();
        expect(detail.icon).toBeDefined();
        expect(detail.description).toBeDefined();
        expect(detail.details).toBeDefined();
      });
    });
  });
});
