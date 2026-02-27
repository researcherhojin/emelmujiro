import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';

// Override the global react-helmet-async mock with one that captures data
const mockHelmetData: Record<string, any> = {};

vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => {
    Object.keys(mockHelmetData).forEach((key) => delete mockHelmetData[key]);
    mockHelmetData.scripts = [];

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
        } else if (child.type === 'link') {
          if (props.rel === 'canonical') {
            mockHelmetData.canonical = props.href;
          }
          if (props.rel === 'alternate') {
            if (!mockHelmetData.alternates) mockHelmetData.alternates = [];
            mockHelmetData.alternates.push({
              lang: props.hrefLang,
              url: props.href,
            });
          }
        } else if (child.type === 'script') {
          mockHelmetData.scripts.push(props.children);
        } else if (
          child.type === React.Fragment ||
          (typeof child.type === 'symbol' &&
            child.type === Symbol.for('react.fragment'))
        ) {
          React.Children.forEach(props.children, processChild);
        }
      }
    };

    React.Children.forEach(children, processChild);

    return (
      <div data-testid="helmet" data-helmet={JSON.stringify(mockHelmetData)} />
    );
  },
  HelmetProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

import MetaTags from '../MetaTags';

const renderMetaTags = (props = {}) => {
  return render(
    <HelmetProvider>
      <MetaTags {...props} />
    </HelmetProvider>
  );
};

const getHelmetData = () => {
  const helmet = document.querySelector('[data-testid="helmet"]');
  return JSON.parse(helmet?.getAttribute('data-helmet') || '{}');
};

describe('MetaTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockHelmetData).forEach((key) => delete mockHelmetData[key]);
  });

  it('renders with default props', () => {
    renderMetaTags();
    const data = getHelmetData();

    expect(data.title).toBeTruthy();
    expect(data.description).toBeTruthy();
    expect(data.keywords).toBeTruthy();
    expect(data.author).toBeTruthy();
  });

  it('renders custom title and description', () => {
    renderMetaTags({
      title: 'Custom Title',
      description: 'Custom description text',
    });
    const data = getHelmetData();

    expect(data.title).toBe('Custom Title');
    expect(data.description).toBe('Custom description text');
  });

  it('renders Open Graph meta tags', () => {
    renderMetaTags({
      title: 'OG Test',
      description: 'OG Description',
      image: 'https://example.com/img.png',
      url: 'https://example.com',
    });
    const data = getHelmetData();

    expect(data['og:title']).toBe('OG Test');
    expect(data['og:description']).toBe('OG Description');
    expect(data['og:image']).toBe('https://example.com/img.png');
    expect(data['og:url']).toBe('https://example.com');
    expect(data['og:type']).toBe('website');
  });

  it('renders Twitter Card meta tags', () => {
    renderMetaTags({
      title: 'Twitter Test',
      description: 'Twitter Desc',
    });
    const data = getHelmetData();

    expect(data['twitter:card']).toBe('summary_large_image');
    expect(data['twitter:title']).toBe('Twitter Test');
    expect(data['twitter:description']).toBe('Twitter Desc');
  });

  it('renders robots meta tag with noindex/nofollow when specified', () => {
    renderMetaTags({ noindex: true, nofollow: true });
    const data = getHelmetData();

    expect(data.robots).toContain('noindex');
    expect(data.robots).toContain('nofollow');
  });

  it('renders index,follow robots meta tag by default', () => {
    renderMetaTags();
    const data = getHelmetData();

    expect(data.robots).toContain('index');
    expect(data.robots).toContain('follow');
  });

  it('renders canonical link when provided', () => {
    renderMetaTags({ canonical: 'https://example.com/page' });
    const data = getHelmetData();

    expect(data.canonical).toBe('https://example.com/page');
  });

  it('renders article-specific meta tags when type is article', () => {
    renderMetaTags({
      type: 'article',
      publishedTime: '2024-01-15T09:00:00Z',
      modifiedTime: '2024-01-16T10:00:00Z',
      author: 'Test Author',
      section: 'Technology',
      tags: ['AI', 'ML'],
    });
    const data = getHelmetData();

    expect(data['og:type']).toBe('article');
    expect(data['article:published_time']).toBe('2024-01-15T09:00:00Z');
    expect(data['article:modified_time']).toBe('2024-01-16T10:00:00Z');
    expect(data['article:author']).toBe('Test Author');
    expect(data['article:section']).toBe('Technology');
  });

  it('includes JSON-LD structured data script', () => {
    renderMetaTags();
    const data = getHelmetData();

    expect(data.scripts).toBeDefined();
    expect(data.scripts.length).toBeGreaterThan(0);

    const jsonLd = JSON.parse(data.scripts[0]);
    expect(jsonLd['@context']).toBe('https://schema.org');
  });
});
