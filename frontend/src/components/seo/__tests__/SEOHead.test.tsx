import React from 'react';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import SEOHead from '../SEOHead';
import { Helmet } from 'react-helmet-async';

// Mock react-helmet-async
jest.mock('react-helmet-async');

describe('SEOHead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Helmet as jest.Mock).mockImplementation(({ children }) => <>{children}</>);
  });

  it('renders with default props', () => {
    renderWithProviders(<SEOHead />);
    
    expect(Helmet).toHaveBeenCalled();
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    // Check if children array contains title meta tag
    const titleTag = children.find((child: any) => 
      child?.props?.children === 'Emelmujiro - AI 교육 & 컨설팅 | Emelmujiro'
    );
    expect(titleTag).toBeTruthy();
  });

  it('renders with custom title', () => {
    const customTitle = 'About Us';
    renderWithProviders(<SEOHead title={customTitle} />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const titleTag = children.find((child: any) => 
      child?.props?.children === `${customTitle} | Emelmujiro`
    );
    expect(titleTag).toBeTruthy();
  });

  it('renders with custom description', () => {
    const customDescription = 'Custom description for SEO';
    renderWithProviders(<SEOHead description={customDescription} />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const descTag = children.find((child: any) => 
      child?.props?.name === 'description' && 
      child?.props?.content === customDescription
    );
    expect(descTag).toBeTruthy();
  });

  it('renders Open Graph meta tags', () => {
    const props = {
      title: 'Test Title',
      description: 'Test Description',
      image: 'https://example.com/image.jpg',
      url: 'https://example.com',
    };
    
    renderWithProviders(<SEOHead {...props} />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    // Check OG tags
    const ogTitle = children.find((child: any) => 
      child?.props?.property === 'og:title'
    );
    expect(ogTitle).toBeTruthy();
    
    const ogDescription = children.find((child: any) => 
      child?.props?.property === 'og:description'
    );
    expect(ogDescription?.props?.content).toBe(props.description);
    
    const ogImage = children.find((child: any) => 
      child?.props?.property === 'og:image'
    );
    expect(ogImage?.props?.content).toBe(props.image);
  });

  it('renders Twitter Card meta tags', () => {
    const props = {
      title: 'Twitter Title',
      description: 'Twitter Description',
      image: 'https://example.com/twitter.jpg',
    };
    
    renderWithProviders(<SEOHead {...props} />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const twitterCard = children.find((child: any) => 
      child?.props?.property === 'twitter:card'
    );
    expect(twitterCard?.props?.content).toBe('summary_large_image');
    
    const twitterTitle = children.find((child: any) => 
      child?.props?.property === 'twitter:title'
    );
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
    
    renderWithProviders(<SEOHead {...props} />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const articleAuthor = children.find((child: any) => 
      child?.props?.property === 'article:author'
    );
    expect(articleAuthor?.props?.content).toBe(props.author);
    
    const articlePublished = children.find((child: any) => 
      child?.props?.property === 'article:published_time'
    );
    expect(articlePublished?.props?.content).toBe(props.publishedTime);
    
    const articleSection = children.find((child: any) => 
      child?.props?.property === 'article:section'
    );
    expect(articleSection?.props?.content).toBe(props.section);
  });

  it('renders structured data script tag', () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Test Site',
    };
    
    renderWithProviders(<SEOHead structuredData={structuredData} />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const scriptTag = children.find((child: any) => 
      child?.type === 'script' && 
      child?.props?.type === 'application/ld+json'
    );
    expect(scriptTag).toBeTruthy();
    expect(scriptTag.props.children).toBe(JSON.stringify(structuredData));
  });

  it('uses default structured data when not provided', () => {
    renderWithProviders(<SEOHead />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const scriptTag = children.find((child: any) => 
      child?.type === 'script' && 
      child?.props?.type === 'application/ld+json'
    );
    
    const data = JSON.parse(scriptTag.props.children);
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('Emelmujiro');
  });

  it('renders PWA meta tags', () => {
    renderWithProviders(<SEOHead />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const mobileCapable = children.find((child: any) => 
      child?.props?.name === 'mobile-web-app-capable'
    );
    expect(mobileCapable?.props?.content).toBe('yes');
    
    const themeColor = children.find((child: any) => 
      child?.props?.name === 'theme-color'
    );
    expect(themeColor?.props?.content).toBe('#3B82F6');
  });

  it('renders preconnect links', () => {
    renderWithProviders(<SEOHead />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const preconnectGoogle = children.find((child: any) => 
      child?.type === 'link' && 
      child?.props?.rel === 'preconnect' &&
      child?.props?.href === 'https://fonts.googleapis.com'
    );
    expect(preconnectGoogle).toBeTruthy();
  });

  it('renders canonical link', () => {
    const url = 'https://example.com/page';
    renderWithProviders(<SEOHead url={url} />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const canonical = children.find((child: any) => 
      child?.type === 'link' && 
      child?.props?.rel === 'canonical' &&
      child?.props?.href === url
    );
    expect(canonical).toBeTruthy();
  });

  it('handles locale meta tags', () => {
    renderWithProviders(<SEOHead />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const ogLocale = children.find((child: any) => 
      child?.props?.property === 'og:locale'
    );
    expect(ogLocale?.props?.content).toBe('ko_KR');
    
    const ogLocaleAlt = children.find((child: any) => 
      child?.props?.property === 'og:locale:alternate'
    );
    expect(ogLocaleAlt?.props?.content).toBe('en_US');
  });

  it('renders robots meta tag', () => {
    renderWithProviders(<SEOHead />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const robots = children.find((child: any) => 
      child?.props?.name === 'robots'
    );
    expect(robots?.props?.content).toContain('index, follow');
  });

  it('does not duplicate site title when title equals site name', () => {
    renderWithProviders(<SEOHead title="Emelmujiro" />);
    
    const helmetProps = (Helmet as jest.Mock).mock.calls[0][0];
    const children = helmetProps.children;
    
    const titleTag = children.find((child: any) => 
      child?.type === 'title'
    );
    expect(titleTag?.props?.children).toBe('Emelmujiro');
  });
});