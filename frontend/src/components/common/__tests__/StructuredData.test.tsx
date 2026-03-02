import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Override the global react-helmet-async mock to capture script content
let capturedJsonLd = '';

vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => {
    capturedJsonLd = '';

    const processChild = (child: any) => {
      if (React.isValidElement(child)) {
        const props = child.props as any;
        if (child.type === 'script' && props.type === 'application/ld+json') {
          capturedJsonLd = props.children;
        }
      }
    };

    React.Children.forEach(children, processChild);

    return <div data-testid="helmet-sd" data-json-ld={capturedJsonLd} />;
  },
  HelmetProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import StructuredData from '../StructuredData';

const renderStructuredData = (props = {}) => {
  return render(
    <HelmetProvider>
      <StructuredData {...props} />
    </HelmetProvider>
  );
};

const getJsonLd = (): Record<string, any> => {
  const helmet = document.querySelector('[data-testid="helmet-sd"]');
  const raw = helmet?.getAttribute('data-json-ld') || '{}';
  return JSON.parse(raw);
};

describe('StructuredData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedJsonLd = '';
  });

  it('renders Organization schema by default', () => {
    renderStructuredData();
    const data = getJsonLd();

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('common.companyName');
  });

  it('renders Website schema when type is Website', () => {
    renderStructuredData({ type: 'Website' });
    const data = getJsonLd();

    expect(data['@type']).toBe('WebSite');
    expect(data.name).toBe('common.companyName');
    expect(data.inLanguage).toBe('ko-KR');
  });

  it('renders Person schema when type is Person', () => {
    renderStructuredData({ type: 'Person' });
    const data = getJsonLd();

    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('seo.personName');
    expect(data.alternateName).toBe('Hojin Lee');
    expect(data.jobTitle).toBe('AI Researcher & Educator');
  });

  it('renders Breadcrumb schema when type is Breadcrumb', () => {
    renderStructuredData({ type: 'Breadcrumb' });
    const data = getJsonLd();

    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement).toBeDefined();
    expect(data.itemListElement.length).toBeGreaterThan(0);
    expect(data.itemListElement[0].name).toBe('common.home');
  });

  it('renders Service schema with custom service props', () => {
    renderStructuredData({
      type: 'Service',
      service: {
        name: 'Custom Service',
        description: 'Custom service description',
        serviceType: 'Education',
        areaServed: 'Korea',
      },
    });
    const data = getJsonLd();

    expect(data['@type']).toBe('Service');
    expect(data.name).toBe('Custom Service');
    expect(data.description).toBe('Custom service description');
    expect(data.serviceType).toBe('Education');
    expect(data.areaServed).toBe('Korea');
  });

  it('renders Article schema with article props', () => {
    renderStructuredData({
      type: 'Article',
      article: {
        title: 'Test Article',
        description: 'Article description',
        author: 'Test Author',
        publishedTime: '2024-01-01',
        category: 'Tech',
        tags: ['AI', 'ML'],
      },
    });
    const data = getJsonLd();

    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe('Test Article');
    expect(data.description).toBe('Article description');
    expect(data.author.name).toBe('Test Author');
    expect(data.datePublished).toBe('2024-01-01');
    expect(data.articleSection).toBe('Tech');
    expect(data.keywords).toBe('AI, ML');
  });

  it('renders LocalBusiness schema', () => {
    renderStructuredData({ type: 'LocalBusiness' });
    const data = getJsonLd();

    expect(data['@type']).toBe('LocalBusiness');
    expect(data.name).toBe('common.companyName');
    expect(data.telephone).toBe('contact.info.phone');
  });

  it('renders SearchAction schema', () => {
    renderStructuredData({ type: 'SearchAction' });
    const data = getJsonLd();

    expect(data['@type']).toBe('WebSite');
    expect(data.potentialAction).toBeDefined();
    expect(data.potentialAction['@type']).toBe('SearchAction');
  });

  it('has displayName set to StructuredData', () => {
    expect(StructuredData.displayName).toBe('StructuredData');
  });
});
