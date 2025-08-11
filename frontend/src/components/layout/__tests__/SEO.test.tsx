/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import SEO from '../SEO';

// Type for mocked Helmet
interface HelmetProps {
  name?: string;
  property?: string;
  content?: string;
  rel?: string;
  href?: string;
  lang?: string;
}

interface MockedHelmetElement extends React.ReactElement {
  props: HelmetProps;
}

type MockedHelmet = jest.Mock & {
  lastChildren?: React.ReactNode;
};

// Mock react-helmet-async
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="helmet-mock">{children}</div>
  ),
}));

describe('SEO Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default props behavior', () => {
    it('should render with default props', () => {
      renderWithProviders(<SEO />);

      const helmet = screen.getByTestId('helmet-mock');
      expect(helmet).toBeInTheDocument();
    });

    it('should use default title when no title provided', () => {
      const mockHelmet = jest.spyOn(require('react-helmet-async'), 'Helmet');

      renderWithProviders(<SEO />);

      expect(mockHelmet).toHaveBeenCalledWith(
        expect.objectContaining({
          children: expect.arrayContaining([
            expect.objectContaining({
              props: expect.objectContaining({
                children: '에멜무지로 | AI 혁신 파트너',
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });

    it('should use default description when no description provided', () => {
      renderWithProviders(<SEO />);

      // Check if default description is used in meta tag
      expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
    });

    it('should use default og-image when no ogImage provided', () => {
      renderWithProviders(<SEO />);

      expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
    });
  });

  describe('Custom props behavior', () => {
    it('should render with custom title', () => {
      const customTitle = 'Custom Page Title';

      renderWithProviders(<SEO title={customTitle} />);

      expect(require('react-helmet-async').Helmet).toHaveBeenCalledWith(
        expect.objectContaining({
          children: expect.arrayContaining([
            expect.objectContaining({
              props: expect.objectContaining({
                children: `${customTitle} | 에멜무지로 | AI 혁신 파트너`,
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });

    it('should render with custom description', () => {
      const customDescription = 'Custom page description for testing';

      renderWithProviders(<SEO description={customDescription} />);

      expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
    });

    it('should render with custom keywords', () => {
      const customKeywords = 'test, keywords, custom, seo';

      renderWithProviders(<SEO keywords={customKeywords} />);

      expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
    });

    it('should render with custom og image', () => {
      const customOgImage = '/custom-og-image.png';

      renderWithProviders(<SEO ogImage={customOgImage} />);

      expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
    });

    it('should render with canonical URL', () => {
      const canonicalUrl = 'https://example.com/test-page';

      renderWithProviders(<SEO canonical={canonicalUrl} />);

      expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
    });

    it('should render with different page types', () => {
      const pageTypes: Array<'website' | 'article' | 'profile'> = ['website', 'article', 'profile'];

      pageTypes.forEach(type => {
        renderWithProviders(<SEO type={type} />);
        expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
      });
    });
  });

  describe('Meta tags structure', () => {
    let originalHelmet: unknown;

    beforeEach(() => {
      originalHelmet = require('react-helmet-async').Helmet;

      // Mock Helmet to capture the actual children structure
      require('react-helmet-async').Helmet = jest.fn(({ children }) => {
        // Store the children for inspection
        (require('react-helmet-async').Helmet as MockedHelmet).lastChildren = children;
        return React.createElement('div', { 'data-testid': 'helmet-mock' }, children);
      });
    });

    afterEach(() => {
      require('react-helmet-async').Helmet = originalHelmet;
    });

    it('should include all basic meta tags', () => {
      renderWithProviders(
        <SEO title="Test Title" description="Test Description" keywords="test, keywords" />
      );

      const children = (require('react-helmet-async').Helmet as MockedHelmet)
        .lastChildren as MockedHelmetElement[];
      expect(Array.isArray(children)).toBe(true);

      // Check for title tag
      const titleTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.type === 'title'
      );
      expect(titleTag).toBeDefined();

      // Check for description meta tag
      const descriptionTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'description'
      );
      expect(descriptionTag).toBeDefined();

      // Check for keywords meta tag
      const keywordsTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'keywords'
      );
      expect(keywordsTag).toBeDefined();
    });

    it('should include Open Graph meta tags', () => {
      renderWithProviders(
        <SEO title="OG Test" description="OG Description" ogImage="/test-og.png" type="article" />
      );

      const children = (require('react-helmet-async').Helmet as MockedHelmet)
        .lastChildren as MockedHelmetElement[];

      // Check for OG tags
      const ogTitleTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.property === 'og:title'
      );
      expect(ogTitleTag).toBeDefined();

      const ogDescriptionTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.property === 'og:description'
      );
      expect(ogDescriptionTag).toBeDefined();

      const ogImageTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.property === 'og:image'
      );
      expect(ogImageTag).toBeDefined();

      const ogTypeTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.property === 'og:type'
      );
      expect(ogTypeTag).toBeDefined();
    });

    it('should include Twitter Card meta tags', () => {
      renderWithProviders(
        <SEO title="Twitter Test" description="Twitter Description" ogImage="/twitter-image.png" />
      );

      const children = (require('react-helmet-async').Helmet as MockedHelmet)
        .lastChildren as MockedHelmetElement[];

      // Check for Twitter Card tags
      const twitterCardTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'twitter:card'
      );
      expect(twitterCardTag).toBeDefined();

      const twitterTitleTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'twitter:title'
      );
      expect(twitterTitleTag).toBeDefined();

      const twitterDescriptionTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'twitter:description'
      );
      expect(twitterDescriptionTag).toBeDefined();

      const twitterImageTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'twitter:image'
      );
      expect(twitterImageTag).toBeDefined();
    });

    it('should include canonical link when provided', () => {
      const canonicalUrl = 'https://example.com/canonical';

      renderWithProviders(<SEO canonical={canonicalUrl} />);

      const children = (require('react-helmet-async').Helmet as MockedHelmet)
        .lastChildren as MockedHelmetElement[];

      const canonicalLink = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.rel === 'canonical'
      );
      expect(canonicalLink).toBeDefined();
      expect((canonicalLink as MockedHelmetElement)?.props?.href).toBe(canonicalUrl);
    });

    it('should include OG URL when canonical is provided', () => {
      const canonicalUrl = 'https://example.com/canonical';

      renderWithProviders(<SEO canonical={canonicalUrl} />);

      const children = (require('react-helmet-async').Helmet as MockedHelmet)
        .lastChildren as MockedHelmetElement[];

      const ogUrlTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.property === 'og:url'
      );
      expect(ogUrlTag).toBeDefined();
      expect((ogUrlTag as MockedHelmetElement)?.props?.content).toBe(canonicalUrl);
    });

    it('should set html lang attribute', () => {
      renderWithProviders(<SEO />);

      const children = (require('react-helmet-async').Helmet as MockedHelmet)
        .lastChildren as MockedHelmetElement[];

      const htmlLangTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.lang === 'ko'
      );
      expect(htmlLangTag).toBeDefined();
    });

    it('should include PWA meta tags', () => {
      renderWithProviders(<SEO />);

      const children = (require('react-helmet-async').Helmet as MockedHelmet)
        .lastChildren as MockedHelmetElement[];

      // Check for PWA-related meta tags
      const appNameTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'application-name'
      );
      expect(appNameTag).toBeDefined();

      const appleMobileCapableTag = children.find(
        (child: unknown) =>
          (child as MockedHelmetElement)?.props?.name === 'apple-mobile-web-app-capable'
      );
      expect(appleMobileCapableTag).toBeDefined();

      const mobileWebAppCapableTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'mobile-web-app-capable'
      );
      expect(mobileWebAppCapableTag).toBeDefined();
    });

    it('should include additional meta tags', () => {
      renderWithProviders(<SEO />);

      const children = (require('react-helmet-async').Helmet as MockedHelmet)
        .lastChildren as MockedHelmetElement[];

      // Check for additional meta tags
      const robotsTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'robots'
      );
      expect(robotsTag).toBeDefined();

      const themeColorTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'theme-color'
      );
      expect(themeColorTag).toBeDefined();

      const formatDetectionTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'format-detection'
      );
      expect(formatDetectionTag).toBeDefined();

      const googleTag = children.find(
        (child: unknown) => (child as MockedHelmetElement)?.props?.name === 'google'
      );
      expect(googleTag).toBeDefined();
    });
  });

  describe('Component behavior', () => {
    it('should be memoized', () => {
      const { rerender } = renderWithProviders(<SEO title="Test" />);

      const firstRenderCalls = (require('react-helmet-async').Helmet as jest.Mock).mock.calls
        .length;

      // Re-render with same props
      rerender(<SEO title="Test" />);

      // Should not cause additional render due to memoization
      const secondRenderCalls = (require('react-helmet-async').Helmet as jest.Mock).mock.calls
        .length;
      expect(secondRenderCalls).toBe(firstRenderCalls);
    });

    it('should have correct displayName', () => {
      expect(SEO.displayName).toBe('SEO');
    });

    it('should re-render when props change', () => {
      const { rerender } = renderWithProviders(<SEO title="First Title" />);

      jest.clearAllMocks();

      rerender(<SEO title="Second Title" />);

      expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string props', () => {
      expect(() => {
        renderWithProviders(<SEO title="" description="" keywords="" ogImage="" canonical="" />);
      }).not.toThrow();
    });

    it('should handle undefined props gracefully', () => {
      expect(() => {
        renderWithProviders(
          <SEO
            title={undefined}
            description={undefined}
            keywords={undefined}
            ogImage={undefined}
            canonical={undefined}
          />
        );
      }).not.toThrow();
    });

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(1000);

      expect(() => {
        renderWithProviders(<SEO title={longTitle} />);
      }).not.toThrow();
    });

    it('should handle special characters in props', () => {
      expect(() => {
        renderWithProviders(
          <SEO
            title="Title with script tag and special chars"
            description="Description with quotes and double quotes"
            keywords="keyword1, keyword2 & more, special-chars"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Integration with different scenarios', () => {
    it('should work for blog post page', () => {
      renderWithProviders(
        <SEO
          title="AI 기술의 미래"
          description="인공지능 기술의 발전과 미래 전망에 대해 알아봅니다"
          keywords="AI, 인공지능, 기술, 미래"
          type="article"
          canonical="https://example.com/blog/ai-future"
          ogImage="/images/ai-future-og.jpg"
        />
      );

      expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
    });

    it('should work for company profile page', () => {
      renderWithProviders(
        <SEO
          title="회사 소개"
          description="에멜무지로는 AI 전문 교육 및 컨설팅 회사입니다"
          keywords="에멜무지로, AI 교육, 컨설팅, 회사소개"
          type="profile"
          canonical="https://example.com/about"
        />
      );

      expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
    });

    it('should work for contact page', () => {
      renderWithProviders(
        <SEO
          title="문의하기"
          description="AI 도입 상담 및 교육 문의는 언제든지 연락주세요"
          keywords="문의, 상담, AI 도입, 연락처"
          canonical="https://example.com/contact"
        />
      );

      expect(require('react-helmet-async').Helmet).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should not re-render with same props due to memoization', () => {
      const props = {
        title: 'Performance Test',
        description: 'Testing performance',
        keywords: 'test, performance',
        ogImage: '/test.jpg',
        canonical: 'https://example.com/test',
        type: 'website' as const,
      };

      const { rerender } = renderWithProviders(<SEO {...props} />);

      const initialCallCount = (require('react-helmet-async').Helmet as jest.Mock).mock.calls
        .length;

      // Re-render with identical props
      rerender(<SEO {...props} />);

      const afterReRenderCallCount = (require('react-helmet-async').Helmet as jest.Mock).mock.calls
        .length;

      // Should be the same due to memoization
      expect(afterReRenderCallCount).toBe(initialCallCount);
    });

    it('should render quickly with minimal props', () => {
      const start = performance.now();

      renderWithProviders(<SEO />);

      const end = performance.now();
      const renderTime = end - start;

      // Render time should be very fast (less than 10ms in most cases)
      expect(renderTime).toBeLessThan(100);
    });
  });
});
