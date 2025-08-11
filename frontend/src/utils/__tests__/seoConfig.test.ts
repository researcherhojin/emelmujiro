/**
 * @jest-environment jsdom
 */

import {
  SEO_CONFIG,
  generateMetaTags,
  generateStructuredData,
  generateCanonicalUrl,
  generateAlternateLinks,
} from '../seoConfig';

describe('seoConfig', () => {
  describe('SEO_CONFIG', () => {
    it('should have correct site configuration', () => {
      expect(SEO_CONFIG.site).toEqual({
        name: '에멜무지로',
        title: '에멜무지로 | AI 혁신 파트너',
        description:
          '기업의 AI 전환을 위한 솔루션 개발, 실전 교육, 전략 컨설팅을 제공합니다. 검증된 방법론과 실전 경험을 바탕으로 귀사의 디지털 혁신을 함께 만들어갑니다.',
        url: 'https://researcherhojin.github.io/emelmujiro',
        image: '/og-image.png',
        locale: 'ko_KR',
        type: 'website',
      });
    });

    it('should have correct social media configuration', () => {
      expect(SEO_CONFIG.social).toEqual({
        twitter: '@emelmujiro',
        facebook: 'emelmujiro',
        instagram: 'emelmujiro',
        linkedin: 'emelmujiro',
        github: 'researcherhojin',
      });
    });

    it('should have configuration for all pages', () => {
      const pages = ['home', 'about', 'profile', 'contact', 'blog'];
      pages.forEach(page => {
        expect(SEO_CONFIG.pages).toHaveProperty(page);
        expect(SEO_CONFIG.pages[page as keyof typeof SEO_CONFIG.pages]).toHaveProperty('title');
        expect(SEO_CONFIG.pages[page as keyof typeof SEO_CONFIG.pages]).toHaveProperty(
          'description'
        );
        expect(SEO_CONFIG.pages[page as keyof typeof SEO_CONFIG.pages]).toHaveProperty('keywords');
      });
    });
  });

  describe('generateMetaTags', () => {
    it('should generate meta tags for home page', () => {
      const metaTags = generateMetaTags('home');

      expect(metaTags.title).toBe('홈 | 에멜무지로');
      expect(metaTags.description).toBe(SEO_CONFIG.pages.home.description);
      expect(metaTags.keywords).toBe(SEO_CONFIG.pages.home.keywords);
    });

    it('should generate meta tags for about page', () => {
      const metaTags = generateMetaTags('about');

      expect(metaTags.title).toBe('회사소개 | 에멜무지로');
      expect(metaTags.description).toBe(SEO_CONFIG.pages.about.description);
      expect(metaTags.keywords).toBe(SEO_CONFIG.pages.about.keywords);
    });

    it('should generate meta tags for profile page', () => {
      const metaTags = generateMetaTags('profile');

      expect(metaTags.title).toBe('대표 프로필 | 에멜무지로');
      expect(metaTags.description).toBe(SEO_CONFIG.pages.profile.description);
      expect(metaTags.keywords).toBe(SEO_CONFIG.pages.profile.keywords);
    });

    it('should generate meta tags for contact page', () => {
      const metaTags = generateMetaTags('contact');

      expect(metaTags.title).toBe('문의하기 | 에멜무지로');
      expect(metaTags.description).toBe(SEO_CONFIG.pages.contact.description);
      expect(metaTags.keywords).toBe(SEO_CONFIG.pages.contact.keywords);
    });

    it('should generate meta tags for blog page', () => {
      const metaTags = generateMetaTags('blog');

      expect(metaTags.title).toBe('블로그 | 에멜무지로');
      expect(metaTags.description).toBe(SEO_CONFIG.pages.blog.description);
      expect(metaTags.keywords).toBe(SEO_CONFIG.pages.blog.keywords);
    });

    it('should generate correct OpenGraph tags', () => {
      const metaTags = generateMetaTags('home');

      expect(metaTags.openGraph).toEqual({
        title: '홈 | 에멜무지로',
        description: SEO_CONFIG.pages.home.description,
        url: 'https://researcherhojin.github.io/emelmujiro',
        siteName: '에멜무지로',
        images: [
          {
            url: '/og-image.png',
            width: 1200,
            height: 630,
            alt: '에멜무지로',
          },
        ],
        locale: 'ko_KR',
        type: 'website',
      });
    });

    it('should generate correct OpenGraph URL for non-home pages', () => {
      const metaTags = generateMetaTags('about');

      expect(metaTags.openGraph.url).toBe('https://researcherhojin.github.io/emelmujiro/#/about');
    });

    it('should generate correct Twitter Card tags', () => {
      const metaTags = generateMetaTags('profile');

      expect(metaTags.twitter).toEqual({
        card: 'summary_large_image',
        title: '대표 프로필 | 에멜무지로',
        description: SEO_CONFIG.pages.profile.description,
        images: ['/og-image.png'],
        creator: '@emelmujiro',
      });
    });
  });

  describe('generateStructuredData', () => {
    it('should generate organization structured data', () => {
      const structuredData = generateStructuredData('organization');

      expect(structuredData).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '에멜무지로',
        url: 'https://researcherhojin.github.io/emelmujiro',
        logo: 'https://researcherhojin.github.io/emelmujiro/logo192.png',
        description: SEO_CONFIG.site.description,
        sameAs: [
          'https://github.com/researcherhojin',
          'https://linkedin.com/company/emelmujiro',
          'https://facebook.com/emelmujiro',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+82-10-7279-0380',
          contactType: 'customer service',
          email: 'researcherhojin@gmail.com',
          availableLanguage: ['Korean', 'English'],
        },
      });
    });

    it('should generate website structured data', () => {
      const structuredData = generateStructuredData('website');

      expect(structuredData).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: 'https://researcherhojin.github.io/emelmujiro',
        name: '에멜무지로',
        description: SEO_CONFIG.site.description,
        publisher: {
          '@type': 'Organization',
          name: '에멜무지로',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://researcherhojin.github.io/emelmujiro/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      });
    });

    it('should generate breadcrumb structured data without items', () => {
      const structuredData = generateStructuredData('breadcrumb');

      expect(structuredData).toEqual({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '홈',
            item: 'https://researcherhojin.github.io/emelmujiro',
          },
        ],
      });
    });

    it('should generate breadcrumb structured data with custom items', () => {
      const customData = {
        items: [
          { position: 2, name: '회사소개', item: 'https://example.com/about' },
          { position: 3, name: '팀', item: 'https://example.com/team' },
        ],
      };

      const structuredData = generateStructuredData('breadcrumb', customData);

      // Type narrowing for breadcrumb
      if (structuredData['@type'] === 'BreadcrumbList') {
        expect((structuredData as any).itemListElement).toHaveLength(3);
        expect((structuredData as any).itemListElement[1]).toEqual({
          position: 2,
          name: '회사소개',
          item: 'https://example.com/about',
        });
        expect((structuredData as any).itemListElement[2]).toEqual({
          position: 3,
          name: '팀',
          item: 'https://example.com/team',
        });
      }
    });

    it('should generate person structured data', () => {
      const structuredData = generateStructuredData('person');

      expect(structuredData).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: '이호진',
        jobTitle: 'AI Researcher & Educator',
        url: 'https://researcherhojin.github.io/emelmujiro/#/profile',
        worksFor: {
          '@type': 'Organization',
          name: '에멜무지로',
        },
      });
    });

    it('should generate person structured data with custom data', () => {
      const customData = {
        email: 'test@example.com',
        telephone: '+82-10-1234-5678',
      };

      const structuredData = generateStructuredData('person', customData);

      // Type narrowing for person
      if (structuredData['@type'] === 'Person') {
        expect((structuredData as any).email).toBe('test@example.com');
        expect((structuredData as any).telephone).toBe('+82-10-1234-5678');
      }
    });

    it('should generate article structured data', () => {
      const articleData = {
        title: 'AI 기술 동향',
        description: 'AI 기술의 최신 동향을 알아보세요',
        author: '이호진',
        publishedDate: '2024-01-01',
        modifiedDate: '2024-01-02',
        url: 'https://example.com/article/ai-trends',
      };

      const structuredData = generateStructuredData('article', articleData);

      expect(structuredData).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'AI 기술 동향',
        description: 'AI 기술의 최신 동향을 알아보세요',
        author: {
          '@type': 'Person',
          name: '이호진',
        },
        datePublished: '2024-01-01',
        dateModified: '2024-01-02',
        publisher: {
          '@type': 'Organization',
          name: '에멜무지로',
          logo: {
            '@type': 'ImageObject',
            url: 'https://researcherhojin.github.io/emelmujiro/logo192.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': 'https://example.com/article/ai-trends',
        },
        title: 'AI 기술 동향',
        publishedDate: '2024-01-01',
        modifiedDate: '2024-01-02',
        url: 'https://example.com/article/ai-trends',
      });
    });

    it('should use default author for article if not provided', () => {
      const articleData = {
        title: 'Test Article',
        description: 'Test description',
      };

      const structuredData = generateStructuredData('article', articleData);

      // Type narrowing for article
      if (structuredData['@type'] === 'Article') {
        expect((structuredData as any).author).toEqual({
          '@type': 'Person',
          name: '이호진',
        });
      }
    });

    it('should use publishedDate for modifiedDate if not provided', () => {
      const articleData = {
        title: 'Test Article',
        publishedDate: '2024-01-01',
      };

      const structuredData = generateStructuredData('article', articleData);

      // Type narrowing for article
      if (structuredData['@type'] === 'Article') {
        expect((structuredData as any).dateModified).toBe('2024-01-01');
      }
    });

    it('should use base URL for mainEntityOfPage if no URL provided', () => {
      const articleData = {
        title: 'Test Article',
      };

      const structuredData = generateStructuredData('article', articleData);

      // Type narrowing for article
      if (structuredData['@type'] === 'Article') {
        expect((structuredData as any).mainEntityOfPage).toEqual({
          '@type': 'WebPage',
          '@id': 'https://researcherhojin.github.io/emelmujiro',
        });
      }
    });
  });

  describe('generateCanonicalUrl', () => {
    it('should generate canonical URL for root path', () => {
      const canonicalUrl = generateCanonicalUrl('');
      expect(canonicalUrl).toBe('https://researcherhojin.github.io/emelmujiro');
    });

    it('should generate canonical URL for specific path', () => {
      const canonicalUrl = generateCanonicalUrl('/#/about');
      expect(canonicalUrl).toBe('https://researcherhojin.github.io/emelmujiro/#/about');
    });

    it('should generate canonical URL for path without leading slash', () => {
      const canonicalUrl = generateCanonicalUrl('contact');
      expect(canonicalUrl).toBe('https://researcherhojin.github.io/emelmujiro/contact');
    });

    it('should generate canonical URL for path with query parameters', () => {
      const canonicalUrl = generateCanonicalUrl('/#/blog?category=ai');
      expect(canonicalUrl).toBe('https://researcherhojin.github.io/emelmujiro/#/blog?category=ai');
    });
  });

  describe('generateAlternateLinks', () => {
    it('should generate alternate language links', () => {
      const alternateLinks = generateAlternateLinks();

      expect(alternateLinks).toEqual([
        { rel: 'alternate', hreflang: 'ko', href: 'https://researcherhojin.github.io/emelmujiro' },
        {
          rel: 'alternate',
          hreflang: 'x-default',
          href: 'https://researcherhojin.github.io/emelmujiro',
        },
      ]);
    });
  });

  describe('integration scenarios', () => {
    it('should work with all page types', () => {
      const pageTypes: Array<keyof typeof SEO_CONFIG.pages> = [
        'home',
        'about',
        'profile',
        'contact',
        'blog',
      ];

      pageTypes.forEach(pageType => {
        const metaTags = generateMetaTags(pageType);

        expect(metaTags.title).toContain('에멜무지로');
        expect(metaTags.description).toBeTruthy();
        expect(metaTags.keywords).toBeTruthy();
        expect(metaTags.openGraph.title).toBeTruthy();
        expect(metaTags.twitter.title).toBeTruthy();
      });
    });

    it('should generate consistent URLs across functions', () => {
      const baseUrl = SEO_CONFIG.site.url;

      const metaTags = generateMetaTags('about');
      const canonicalUrl = generateCanonicalUrl('/#/about');
      const organizationData = generateStructuredData('organization');

      expect(metaTags.openGraph.url).toBe(`${baseUrl}/#/about`);
      expect(canonicalUrl).toBe(`${baseUrl}/#/about`);

      // Type narrowing for organization structured data
      if (organizationData['@type'] === 'Organization') {
        expect((organizationData as any).url).toBe(baseUrl);
      }
    });

    it('should handle complex article structured data', () => {
      const complexArticleData = {
        title: 'AI 기술의 미래: 딥러닝에서 생성형 AI까지',
        description: '인공지능 기술의 발전 과정과 미래 전망을 살펴보는 종합 가이드',
        author: '이호진 박사',
        publishedDate: '2024-03-15T09:00:00Z',
        modifiedDate: '2024-03-20T14:30:00Z',
        url: 'https://researcherhojin.github.io/emelmujiro/#/blog/ai-future-guide',
        image: 'https://researcherhojin.github.io/emelmujiro/images/ai-future.jpg',
        category: 'AI Technology',
        tags: ['AI', 'Deep Learning', 'Generative AI', 'Future Technology'],
      };

      const structuredData = generateStructuredData('article', complexArticleData);

      // Type guard to ensure it's an article type
      if (structuredData['@type'] === 'Article') {
        expect((structuredData as any).headline).toBe(complexArticleData.title);
        expect((structuredData as any).description).toBe(complexArticleData.description);
        expect((structuredData as any).author.name).toBe(complexArticleData.author);
        expect((structuredData as any).datePublished).toBe(complexArticleData.publishedDate);
        expect((structuredData as any).dateModified).toBe(complexArticleData.modifiedDate);
        expect((structuredData as any).mainEntityOfPage['@id']).toBe(complexArticleData.url);
      } else {
        throw new Error('Expected Article structured data');
      }
    });
  });
});
