import React from 'react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import SEOHead from '../SEOHead';

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="helmet">{children}</div>
  ),
  HelmetProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('SEOHead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');
    expect(helmet).toBeInTheDocument();

    // Check if title is rendered
    const titleElement = helmet.querySelector('title');
    expect(titleElement).toBeTruthy();
    expect(titleElement?.textContent).toBe(
      'Emelmujiro - AI 교육 & 컨설팅 | Emelmujiro'
    );
  });

  it('renders with custom title', () => {
    const customTitle = 'About Us';
    const { getByTestId } = renderWithProviders(
      <SEOHead title={customTitle} />
    );

    const helmet = getByTestId('helmet');
    const titleElement = helmet.querySelector('title');
    expect(titleElement?.textContent).toBe(`${customTitle} | Emelmujiro`);
  });

  it('renders with custom description', () => {
    const customDescription = 'Custom description for SEO';
    const { getByTestId } = renderWithProviders(
      <SEOHead description={customDescription} />
    );

    const helmet = getByTestId('helmet');
    const descriptionMeta = helmet.querySelector('meta[name="description"]');
    expect(descriptionMeta).toBeTruthy();
    expect(descriptionMeta?.getAttribute('content')).toBe(customDescription);
  });

  it('renders Open Graph meta tags', () => {
    const props = {
      title: 'Test Title',
      description: 'Test Description',
      image: 'https://example.com/image.jpg',
      url: 'https://example.com',
    };

    const { getByTestId } = renderWithProviders(<SEOHead {...props} />);

    const helmet = getByTestId('helmet');

    // Check OG tags
    const ogTitle = helmet.querySelector('meta[property="og:title"]');
    expect(ogTitle).toBeTruthy();

    const ogDescription = helmet.querySelector(
      'meta[property="og:description"]'
    );
    expect(ogDescription?.getAttribute('content')).toBe(props.description);

    const ogImage = helmet.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toBe(props.image);
  });

  it('renders Twitter Card meta tags', () => {
    const props = {
      title: 'Twitter Title',
      description: 'Twitter Description',
      image: 'https://example.com/twitter.jpg',
    };

    const { getByTestId } = renderWithProviders(<SEOHead {...props} />);

    const helmet = getByTestId('helmet');

    const twitterCard = helmet.querySelector('meta[property="twitter:card"]');
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');

    const twitterTitle = helmet.querySelector('meta[property="twitter:title"]');
    expect(twitterTitle).toBeTruthy();
  });

  it('renders article-specific meta tags when type is article', () => {
    const props = {
      type: 'article',
      author: 'John Doe',
      publishedTime: '2024-01-15T09:00:00Z',
      modifiedTime: '2024-01-16T10:00:00Z',
      section: 'Technology',
      tags: ['AI', 'Machine Learning', 'Tech'],
    };

    const { getByTestId } = renderWithProviders(<SEOHead {...props} />);

    const helmet = getByTestId('helmet');

    const articleAuthor = helmet.querySelector(
      'meta[property="article:author"]'
    );
    expect(articleAuthor?.getAttribute('content')).toBe(props.author);

    const articlePublished = helmet.querySelector(
      'meta[property="article:published_time"]'
    );
    expect(articlePublished?.getAttribute('content')).toBe(props.publishedTime);

    const articleSection = helmet.querySelector(
      'meta[property="article:section"]'
    );
    expect(articleSection?.getAttribute('content')).toBe(props.section);
  });

  it('renders structured data script tag', () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Test Site',
    };

    const { getByTestId } = renderWithProviders(
      <SEOHead structuredData={structuredData} />
    );

    const helmet = getByTestId('helmet');

    const scriptTag = helmet.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(scriptTag).toBeTruthy();
    expect(scriptTag?.textContent).toBe(JSON.stringify(structuredData));
  });

  it('uses default structured data when not provided', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');

    const scriptTag = helmet.querySelector(
      'script[type="application/ld+json"]'
    );

    const data = JSON.parse(scriptTag?.textContent || '{}');
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('Emelmujiro');
  });

  it('renders PWA meta tags', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');

    const mobileCapable = helmet.querySelector(
      'meta[name="mobile-web-app-capable"]'
    );
    expect(mobileCapable?.getAttribute('content')).toBe('yes');

    const themeColor = helmet.querySelector('meta[name="theme-color"]');
    // Check if a theme color meta tag exists (the value might vary based on environment),
    expect(themeColor).toBeTruthy();
    expect(themeColor?.getAttribute('content')).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('renders preconnect links', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');

    const preconnectGoogle = helmet.querySelector(
      'link[rel="preconnect"][href="https://fonts.googleapis.com"]'
    );
    expect(preconnectGoogle).toBeTruthy();
  });

  it('renders canonical link', () => {
    const url = 'https://example.com/page';
    const { getByTestId } = renderWithProviders(<SEOHead url={url} />);

    const helmet = getByTestId('helmet');

    const canonical = helmet.querySelector('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    expect(canonical?.getAttribute('href')).toBe(url);
  });

  it('handles locale meta tags', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');

    const ogLocale = helmet.querySelector('meta[property="og:locale"]');
    expect(ogLocale?.getAttribute('content')).toBe('ko_KR');

    const ogLocaleAlt = helmet.querySelector(
      'meta[property="og:locale:alternate"]'
    );
    expect(ogLocaleAlt?.getAttribute('content')).toBe('en_US');
  });

  it('renders robots meta tag', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');

    const robots = helmet.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toContain('index, follow');
  });

  it('does not duplicate site title when title equals site name', () => {
    const { getByTestId } = renderWithProviders(<SEOHead title="Emelmujiro" />);

    const helmet = getByTestId('helmet');

    const titleTag = helmet.querySelector('title');
    expect(titleTag?.textContent).toBe('Emelmujiro');
  });
});
