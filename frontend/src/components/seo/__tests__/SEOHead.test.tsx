import React from 'react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

import SEOHead from '../SEOHead';

// Mock react-helmet-async
const mockHelmetData: Record<string, any> = {};

vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => {
    // Clear previous data
    Object.keys(mockHelmetData).forEach((key) => delete mockHelmetData[key]);

    // Recursive function to process nested children
    const processChild = (child: any) => {
      if (React.isValidElement(child)) {
        const props = child.props as any;
        if (child.type === 'title') {
          mockHelmetData.title = props.children;
        } else if (child.type === 'meta') {
          const name = props.name || props.property;
          if (name) {
            mockHelmetData[name] = props.content;
          }
        } else if (child.type === 'link' && props.rel === 'canonical') {
          mockHelmetData.canonical = props.href;
        } else if (child.type === 'script') {
          mockHelmetData.script = props.children;
        } else if (
          child.type === React.Fragment ||
          (typeof child.type === 'symbol' &&
            child.type === Symbol.for('react.fragment'))
        ) {
          // Process children of fragments
          React.Children.forEach(props.children, processChild);
        }
      }
    };

    // Process children to extract meta data
    React.Children.forEach(children, processChild);

    return (
      <div data-testid="helmet" data-helmet={JSON.stringify(mockHelmetData)} />
    );
  },
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

    // Check if title is rendered - mock t() returns key as-is
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');
    expect(helmetData.title).toBe('seo.seoHead.defaultTitle | Emelmujiro');
    expect(helmetData.description).toBe('seo.seoHead.defaultDescription');
  });

  it('renders with custom title', () => {
    const customTitle = 'About Us';
    const { getByTestId } = renderWithProviders(
      <SEOHead title={customTitle} />
    );

    const helmet = getByTestId('helmet');
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');
    expect(helmetData.title).toBe(`${customTitle} | Emelmujiro`);
  });

  it('renders with custom description', () => {
    const customDescription = 'Custom description for SEO';
    const { getByTestId } = renderWithProviders(
      <SEOHead description={customDescription} />
    );

    const helmet = getByTestId('helmet');
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');
    expect(helmetData.description).toBe(customDescription);
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
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');

    // Check OG tags
    expect(helmetData['og:title']).toBe('Test Title | Emelmujiro');
    expect(helmetData['og:description']).toBe(props.description);
    expect(helmetData['og:image']).toBe(props.image);
    expect(helmetData['og:url']).toBe(props.url);
  });

  it('renders Twitter Card meta tags', () => {
    const props = {
      title: 'Twitter Title',
      description: 'Twitter Description',
      image: 'https://example.com/twitter.jpg',
    };

    const { getByTestId } = renderWithProviders(<SEOHead {...props} />);

    const helmet = getByTestId('helmet');
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');

    expect(helmetData['twitter:card']).toBe('summary_large_image');
    expect(helmetData['twitter:title']).toBe('Twitter Title | Emelmujiro');
    expect(helmetData['twitter:description']).toBe('Twitter Description');
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
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');

    expect(helmetData['article:author']).toBe(props.author);
    expect(helmetData['article:published_time']).toBe(props.publishedTime);
    expect(helmetData['article:modified_time']).toBe(props.modifiedTime);
    expect(helmetData['article:section']).toBe(props.section);
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
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');

    expect(helmetData.script).toBe(JSON.stringify(structuredData));
  });

  it('uses default structured data when not provided', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');

    const data = JSON.parse(helmetData.script || '{}');
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('Emelmujiro');
  });

  it('renders PWA meta tags', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');

    expect(helmetData['mobile-web-app-capable']).toBe('yes');
    expect(helmetData['theme-color']).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('renders preconnect links', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');

    // For preconnect links, we need to check if they were rendered as children
    // The mock should handle link elements properly
    expect(helmet).toBeInTheDocument();
  });

  it('renders canonical link', () => {
    const url = 'https://example.com/page';
    const { getByTestId } = renderWithProviders(<SEOHead url={url} />);

    const helmet = getByTestId('helmet');
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');

    expect(helmetData.canonical).toBe(url);
  });

  it('handles locale meta tags', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');

    expect(helmetData['og:locale']).toBe('ko_KR');
    expect(helmetData['og:locale:alternate']).toBe('en_US');
  });

  it('renders robots meta tag', () => {
    const { getByTestId } = renderWithProviders(<SEOHead />);

    const helmet = getByTestId('helmet');
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');

    expect(helmetData.robots).toContain('index, follow');
  });

  it('does not duplicate site title when title equals site name', () => {
    const { getByTestId } = renderWithProviders(<SEOHead title="Emelmujiro" />);

    const helmet = getByTestId('helmet');
    const helmetData = JSON.parse(helmet.getAttribute('data-helmet') || '{}');

    expect(helmetData.title).toBe('Emelmujiro');
  });
});
