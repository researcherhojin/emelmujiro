import { describe, it, expect } from 'vitest';
import {
  createOrganizationSchema,
  createBreadcrumbSchema,
  createFAQSchema,
  createServiceSchema,
  createWebSiteSchema,
  createCourseSchema,
  getPageMetadata,
  generateRobotsTxt,
  getCanonicalUrl,
} from '../seo';
import type { BreadcrumbItem, FAQItem } from '../seo';

describe('seo', () => {
  describe('createOrganizationSchema', () => {
    it('should return valid schema.org Organization', () => {
      const schema = createOrganizationSchema();

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('에멜무지로');
      expect(schema.alternateName).toBe('Emelmujiro');
      expect(schema.url).toBe('https://researcherhojin.github.io/emelmujiro/');
      expect(schema.logo).toBe(
        'https://researcherhojin.github.io/emelmujiro/logo192.png'
      );
    });

    it('should include founder information', () => {
      const schema = createOrganizationSchema();

      expect(schema.founders).toHaveLength(1);
      expect(schema.founders[0]).toEqual({
        '@type': 'Person',
        name: '이호진',
        jobTitle: 'CEO & Founder',
        alumniOf: 'KIST',
      });
    });

    it('should include address with Korea region', () => {
      const schema = createOrganizationSchema();

      expect(schema.address).toEqual({
        '@type': 'PostalAddress',
        addressCountry: 'KR',
        addressRegion: '서울특별시',
      });
    });

    it('should include social media links in sameAs', () => {
      const schema = createOrganizationSchema();

      expect(schema.sameAs).toContain('https://github.com/researcherhojin');
      expect(schema.sameAs).toContain('https://linkedin.com/in/emelmujiro');
    });

    it('should include contact point with multiple languages', () => {
      const schema = createOrganizationSchema();

      expect(schema.contactPoint).toHaveLength(1);
      expect(schema.contactPoint[0]['@type']).toBe('ContactPoint');
      expect(schema.contactPoint[0].contactType).toBe('customer service');
      expect(schema.contactPoint[0].availableLanguage).toEqual([
        'Korean',
        'English',
      ]);
    });

    it('should include service types', () => {
      const schema = createOrganizationSchema();

      expect(schema.serviceType).toEqual([
        'AI Education',
        'AI Consulting',
        'Software Development',
      ]);
    });
  });

  describe('createBreadcrumbSchema', () => {
    it('should return valid BreadcrumbList schema', () => {
      const items: BreadcrumbItem[] = [
        { name: 'Home', url: 'https://example.com' },
      ];
      const schema = createBreadcrumbSchema(items);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
    });

    it('should map items to ListItem elements with correct positions', () => {
      const items: BreadcrumbItem[] = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'About', url: 'https://example.com/about' },
        { name: 'Team', url: 'https://example.com/about/team' },
      ];
      const schema = createBreadcrumbSchema(items);

      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://example.com',
      });
      expect(schema.itemListElement[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: 'https://example.com/about',
      });
      expect(schema.itemListElement[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'Team',
        item: 'https://example.com/about/team',
      });
    });

    it('should handle empty items array', () => {
      const schema = createBreadcrumbSchema([]);

      expect(schema.itemListElement).toEqual([]);
    });

    it('should handle single item', () => {
      const items: BreadcrumbItem[] = [
        { name: 'Home', url: 'https://example.com' },
      ];
      const schema = createBreadcrumbSchema(items);

      expect(schema.itemListElement).toHaveLength(1);
      expect(schema.itemListElement[0].position).toBe(1);
    });
  });

  describe('createFAQSchema', () => {
    it('should return valid FAQPage schema', () => {
      const items: FAQItem[] = [
        { question: 'What is AI?', answer: 'Artificial Intelligence' },
      ];
      const schema = createFAQSchema(items);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
    });

    it('should map FAQ items to Question/Answer entities', () => {
      const items: FAQItem[] = [
        { question: 'What is AI?', answer: 'Artificial Intelligence' },
        {
          question: 'What services do you offer?',
          answer: 'Education and Consulting',
        },
      ];
      const schema = createFAQSchema(items);

      expect(schema.mainEntity).toHaveLength(2);
      expect(schema.mainEntity[0]).toEqual({
        '@type': 'Question',
        name: 'What is AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Artificial Intelligence',
        },
      });
      expect(schema.mainEntity[1]).toEqual({
        '@type': 'Question',
        name: 'What services do you offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Education and Consulting',
        },
      });
    });

    it('should handle empty items array', () => {
      const schema = createFAQSchema([]);

      expect(schema.mainEntity).toEqual([]);
    });
  });

  describe('createServiceSchema', () => {
    it('should return valid Service schema', () => {
      const schema = createServiceSchema();

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Service');
      expect(schema.serviceType).toBe('AI Education and Consulting');
    });

    it('should include provider organization', () => {
      const schema = createServiceSchema();

      expect(schema.provider).toEqual({
        '@type': 'Organization',
        name: '에멜무지로',
      });
    });

    it('should include area served', () => {
      const schema = createServiceSchema();

      expect(schema.areaServed).toEqual({
        '@type': 'Country',
        name: 'South Korea',
      });
    });

    it('should include offer catalog with three services', () => {
      const schema = createServiceSchema();

      expect(schema.hasOfferCatalog['@type']).toBe('OfferCatalog');
      expect(schema.hasOfferCatalog.itemListElement).toHaveLength(3);

      const serviceNames = schema.hasOfferCatalog.itemListElement.map(
        (offer) => offer.itemOffered.name
      );
      expect(serviceNames).toContain('AI 기초 교육');
      expect(serviceNames).toContain('AI 컨설팅');
      expect(serviceNames).toContain('맞춤형 AI 솔루션 개발');
    });
  });

  describe('createWebSiteSchema', () => {
    it('should return valid WebSite schema', () => {
      const schema = createWebSiteSchema();

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('에멜무지로');
      expect(schema.url).toBe('https://researcherhojin.github.io/emelmujiro/');
    });

    it('should include SearchAction potential action', () => {
      const schema = createWebSiteSchema();

      expect(schema.potentialAction['@type']).toBe('SearchAction');
      expect(schema.potentialAction.target['@type']).toBe('EntryPoint');
      expect(schema.potentialAction.target.urlTemplate).toContain(
        '{search_term_string}'
      );
      expect(schema.potentialAction['query-input']).toBe(
        'required name=search_term_string'
      );
    });
  });

  describe('createCourseSchema', () => {
    it('should return valid Course schema', () => {
      const course = {
        name: 'AI Basics',
        description: 'Learn AI fundamentals',
        provider: '에멜무지로',
        duration: 'P3M',
      };
      const schema = createCourseSchema(course);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Course');
      expect(schema.name).toBe('AI Basics');
      expect(schema.description).toBe('Learn AI fundamentals');
    });

    it('should include provider with sameAs link', () => {
      const course = {
        name: 'Test Course',
        description: 'Test',
        provider: '에멜무지로',
        duration: 'P1M',
      };
      const schema = createCourseSchema(course);

      expect(schema.provider).toEqual({
        '@type': 'Organization',
        name: '에멜무지로',
        sameAs: 'https://researcherhojin.github.io/emelmujiro/',
      });
    });

    it('should include course instance with blended mode and Korean language', () => {
      const course = {
        name: 'Deep Learning',
        description: 'Advanced deep learning course',
        provider: '에멜무지로',
        duration: 'P6M',
      };
      const schema = createCourseSchema(course);

      expect(schema.hasCourseInstance).toEqual({
        '@type': 'CourseInstance',
        courseMode: 'blended',
        duration: 'P6M',
        inLanguage: 'ko',
      });
    });
  });

  describe('getPageMetadata', () => {
    it('should return metadata for home page', () => {
      const metadata = getPageMetadata('home');

      expect(metadata.title).toContain('에멜무지로');
      expect(metadata.title).toContain('AI');
      expect(metadata.description).toBeTruthy();
      expect(metadata.keywords).toContain('AI');
      expect(metadata.url).toBe('https://researcherhojin.github.io/emelmujiro');
    });

    it('should return metadata for about page', () => {
      const metadata = getPageMetadata('about');

      expect(metadata.title).toContain('회사소개');
      expect(metadata.url).toContain('/#/about');
    });

    it('should return metadata for profile page', () => {
      const metadata = getPageMetadata('profile');

      expect(metadata.title).toContain('이호진');
      expect(metadata.url).toContain('/#/profile');
    });

    it('should return metadata for contact page', () => {
      const metadata = getPageMetadata('contact');

      expect(metadata.title).toContain('문의하기');
      expect(metadata.url).toContain('/#/contact');
    });

    it('should return metadata for blog page', () => {
      const metadata = getPageMetadata('blog');

      expect(metadata.title).toContain('블로그');
      expect(metadata.url).toContain('/#/blog');
    });

    it('should return default metadata for unknown page', () => {
      const metadata = getPageMetadata('unknown-page');

      expect(metadata.title).toBe('에멜무지로');
      expect(metadata.description).toBe('AI 교육 및 컨설팅 전문 기업');
      expect(metadata.keywords).toBe('AI, 교육, 컨설팅');
      expect(metadata.url).toBe('https://researcherhojin.github.io/emelmujiro');
    });

    it('should have consistent baseUrl across all pages', () => {
      const pages = ['home', 'about', 'profile', 'contact', 'blog'];
      const baseUrl = 'https://researcherhojin.github.io/emelmujiro';

      pages.forEach((page) => {
        const metadata = getPageMetadata(page);
        expect(metadata.url).toContain(baseUrl);
      });
    });

    it('should always include title, description, keywords, and url', () => {
      const pages = ['home', 'about', 'profile', 'contact', 'blog', 'other'];

      pages.forEach((page) => {
        const metadata = getPageMetadata(page);
        expect(metadata).toHaveProperty('title');
        expect(metadata).toHaveProperty('description');
        expect(metadata).toHaveProperty('keywords');
        expect(metadata).toHaveProperty('url');
        expect(metadata.title).toBeTruthy();
        expect(metadata.description).toBeTruthy();
        expect(metadata.keywords).toBeTruthy();
        expect(metadata.url).toBeTruthy();
      });
    });
  });

  describe('generateRobotsTxt', () => {
    it('should include User-agent directive', () => {
      const robotsTxt = generateRobotsTxt();

      expect(robotsTxt).toContain('User-agent: *');
    });

    it('should allow root and disallow api and admin', () => {
      const robotsTxt = generateRobotsTxt();

      expect(robotsTxt).toContain('Allow: /');
      expect(robotsTxt).toContain('Disallow: /api/');
      expect(robotsTxt).toContain('Disallow: /admin/');
    });

    it('should include sitemap URLs', () => {
      const robotsTxt = generateRobotsTxt();

      expect(robotsTxt).toContain(
        'Sitemap: https://researcherhojin.github.io/emelmujiro/sitemap.xml'
      );
      expect(robotsTxt).toContain(
        'Sitemap: https://researcherhojin.github.io/emelmujiro/sitemap-index.xml'
      );
    });

    it('should include Googlebot-specific rules', () => {
      const robotsTxt = generateRobotsTxt();

      expect(robotsTxt).toContain('User-agent: Googlebot');
    });

    it('should include Bingbot-specific rules', () => {
      const robotsTxt = generateRobotsTxt();

      expect(robotsTxt).toContain('User-agent: Bingbot');
    });
  });

  describe('getCanonicalUrl', () => {
    const baseUrl = 'https://researcherhojin.github.io/emelmujiro';

    it('should return base URL for root path', () => {
      expect(getCanonicalUrl('/')).toBe(baseUrl);
    });

    it('should return base URL for empty path', () => {
      expect(getCanonicalUrl('')).toBe(baseUrl);
    });

    it('should add hash prefix for non-hash paths', () => {
      expect(getCanonicalUrl('/about')).toBe(`${baseUrl}/#/about`);
    });

    it('should preserve hash prefix if already present', () => {
      expect(getCanonicalUrl('#/about')).toBe(`${baseUrl}#/about`);
    });

    it('should strip query parameters', () => {
      expect(getCanonicalUrl('/blog?page=1')).toBe(`${baseUrl}/#/blog`);
    });

    it('should handle nested paths', () => {
      expect(getCanonicalUrl('/blog/123')).toBe(`${baseUrl}/#/blog/123`);
    });

    it('should handle hash paths with query parameters', () => {
      expect(getCanonicalUrl('#/blog?page=1')).toBe(`${baseUrl}#/blog`);
    });
  });

  describe('default export', () => {
    it('should export all functions', async () => {
      const seoModule = await import('../seo');
      const defaultExport = seoModule.default;

      expect(defaultExport.createOrganizationSchema).toBe(
        createOrganizationSchema
      );
      expect(defaultExport.createBreadcrumbSchema).toBe(createBreadcrumbSchema);
      expect(defaultExport.createFAQSchema).toBe(createFAQSchema);
      expect(defaultExport.createServiceSchema).toBe(createServiceSchema);
      expect(defaultExport.createWebSiteSchema).toBe(createWebSiteSchema);
      expect(defaultExport.createCourseSchema).toBe(createCourseSchema);
      expect(defaultExport.getPageMetadata).toBe(getPageMetadata);
      expect(defaultExport.generateRobotsTxt).toBe(generateRobotsTxt);
      expect(defaultExport.getCanonicalUrl).toBe(getCanonicalUrl);
    });
  });
});
