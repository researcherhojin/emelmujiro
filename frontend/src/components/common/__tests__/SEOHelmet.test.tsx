import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

// Mock react-helmet-async with a Helmet that captures data
const mockHelmetData: Record<string, any> = {};

vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => {
    Object.keys(mockHelmetData).forEach((key) => delete mockHelmetData[key]);

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
        } else if (child.type === 'script') {
          mockHelmetData.script = props.children;
        } else if (child.type === 'html') {
          mockHelmetData.lang = props.lang;
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

import { HelmetProvider } from 'react-helmet-async';
import SEOHelmet from '../SEOHelmet';

// Helper to render with HelmetProvider
const renderWithHelmet = (ui: React.ReactElement) => {
  return render(<HelmetProvider>{ui}</HelmetProvider>);
};

const getHelmetData = () => {
  const helmet = document.querySelector('[data-testid="helmet"]');
  return JSON.parse(helmet?.getAttribute('data-helmet') || '{}');
};

describe('SEOHelmet', () => {
  it('renders with default props', () => {
    renderWithHelmet(<SEOHelmet />);

    const data = getHelmetData();
    expect(data.title).toBe('에멜무지로');
  });

  it('appends site name to custom title', () => {
    renderWithHelmet(<SEOHelmet title="About Us" />);

    const data = getHelmetData();
    expect(data.title).toBe('About Us | 에멜무지로');
  });

  it('does not duplicate site name when title is the default', () => {
    renderWithHelmet(<SEOHelmet title="에멜무지로" />);

    const data = getHelmetData();
    expect(data.title).toBe('에멜무지로');
  });

  it('sets description meta tag', () => {
    renderWithHelmet(<SEOHelmet description="Custom description" />);

    const data = getHelmetData();
    expect(data.description).toBe('Custom description');
  });

  it('sets Open Graph meta tags', () => {
    renderWithHelmet(
      <SEOHelmet
        title="Test Page"
        description="Test description"
        image="https://example.com/img.png"
        url="https://example.com/page"
        type="website"
      />
    );

    const data = getHelmetData();
    expect(data['og:title']).toBe('Test Page | 에멜무지로');
    expect(data['og:description']).toBe('Test description');
    expect(data['og:image']).toBe('https://example.com/img.png');
    expect(data['og:url']).toBe('https://example.com/page');
    expect(data['og:type']).toBe('website');
  });

  it('sets Twitter Card meta tags', () => {
    renderWithHelmet(
      <SEOHelmet title="Twitter Test" description="Twitter desc" />
    );

    const data = getHelmetData();
    expect(data['twitter:card']).toBe('summary_large_image');
    expect(data['twitter:title']).toBe('Twitter Test | 에멜무지로');
    expect(data['twitter:description']).toBe('Twitter desc');
  });

  it('sets canonical URL', () => {
    renderWithHelmet(<SEOHelmet url="https://example.com/canonical" />);

    const data = getHelmetData();
    expect(data.canonical).toBe('https://example.com/canonical');
  });

  it('has displayName set', () => {
    expect(SEOHelmet.displayName).toBe('SEOHelmet');
  });

  it('sets keywords meta tag', () => {
    renderWithHelmet(<SEOHelmet keywords="AI, machine learning, test" />);

    const data = getHelmetData();
    expect(data.keywords).toBe('AI, machine learning, test');
  });
});
