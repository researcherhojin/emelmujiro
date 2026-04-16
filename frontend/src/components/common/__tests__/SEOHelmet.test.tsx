import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Module-level variable to control i18n language for tests
let mockI18nLanguage = 'ko';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      get language() {
        return mockI18nLanguage;
      },
      changeLanguage: vi.fn(),
    },
  }),
  Trans: ({ children }: { children?: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

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
          const name = props.name || props.property || props.httpEquiv;
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
          (typeof child.type === 'symbol' && child.type === Symbol.for('react.fragment'))
        ) {
          React.Children.forEach(props.children, processChild);
        }
      }
    };

    React.Children.forEach(children, processChild);

    return <div data-testid="helmet" data-helmet={JSON.stringify(mockHelmetData)} />;
  },
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SEOHelmet from '../SEOHelmet';

// Helper to render with HelmetProvider + MemoryRouter (SEOHelmet uses useLocation)
const renderWithHelmet = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <HelmetProvider>{ui}</HelmetProvider>
    </MemoryRouter>
  );
};

const getHelmetData = () => {
  const helmet = document.querySelector('[data-testid="helmet"]');
  return JSON.parse(helmet?.getAttribute('data-helmet') || '{}');
};

describe('SEOHelmet', () => {
  beforeEach(() => {
    mockI18nLanguage = 'ko';
  });

  it('renders with default props', () => {
    renderWithHelmet(<SEOHelmet />);

    const data = getHelmetData();
    expect(data.title).toBe('common.companyName');
  });

  it('appends site name to custom title', () => {
    renderWithHelmet(<SEOHelmet title="About Us" />);

    const data = getHelmetData();
    expect(data.title).toBe('About Us | common.companyName');
  });

  it('does not duplicate site name when title is the default', () => {
    renderWithHelmet(<SEOHelmet title="common.companyName" />);

    const data = getHelmetData();
    expect(data.title).toBe('common.companyName');
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
    expect(data['og:title']).toBe('Test Page | common.companyName');
    expect(data['og:description']).toBe('Test description');
    expect(data['og:image']).toBe('https://example.com/img.png');
    expect(data['og:url']).toBe('https://example.com/page');
    expect(data['og:type']).toBe('website');
  });

  it('sets Twitter Card meta tags', () => {
    renderWithHelmet(<SEOHelmet title="Twitter Test" description="Twitter desc" />);

    const data = getHelmetData();
    expect(data['twitter:card']).toBe('summary_large_image');
    expect(data['twitter:title']).toBe('Twitter Test | common.companyName');
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

  it('renders article tags when type is article with tags (line 134)', () => {
    renderWithHelmet(
      <SEOHelmet
        type="article"
        article={{
          author: 'Test Author',
          publishedTime: '2024-01-01',
          modifiedTime: '2024-01-02',
          section: 'Technology',
          tags: ['react', 'typescript'],
        }}
      />
    );

    const data = getHelmetData();
    // The article meta tags should be rendered
    expect(data['article:author']).toBe('Test Author');
    // Tags are rendered as multiple meta elements via .map() on line 134
    // The Helmet mock may capture only certain props; verify no crash
    expect(data['article:published_time']).toBe('2024-01-01');
  });

  it('sets English locale when lang="en" is provided', () => {
    renderWithHelmet(<SEOHelmet lang="en" />);

    const data = getHelmetData();
    expect(data['og:locale']).toBe('en_US');
    expect(data['og:locale:alternate']).toBe('ko_KR');
    expect(data.lang).toBe('en');
    expect(data['content-language']).toBe('en');
  });

  it('sets Korean locale by default (no lang prop)', () => {
    renderWithHelmet(<SEOHelmet />);

    const data = getHelmetData();
    expect(data['og:locale']).toBe('ko_KR');
    expect(data['og:locale:alternate']).toBe('en_US');
  });

  it('falls back to resolvedAuthor when article.author is not provided', () => {
    renderWithHelmet(
      <SEOHelmet
        type="article"
        article={{
          section: 'Technology',
          tags: ['ai'],
          publishedTime: '2024-01-01',
          modifiedTime: '2024-01-02',
        }}
      />
    );

    const data = getHelmetData();
    // Without article.author, should fall back to resolvedAuthor (siteName by default)
    expect(data['article:author']).toBe('common.companyName');
    expect(data['article:section']).toBe('Technology');
  });

  it('renders publishedTime and modifiedTime props as top-level meta tags', () => {
    renderWithHelmet(<SEOHelmet publishedTime="2024-06-01" modifiedTime="2024-06-15" />);

    const helmet = document.querySelector('[data-testid="helmet"]');
    const raw = helmet?.getAttribute('data-helmet') || '{}';
    const data = JSON.parse(raw);
    // The top-level publishedTime/modifiedTime use name="article:published_time"
    // which may overwrite the same key in our mock; verify they are present
    expect(data['article:published_time']).toBe('2024-06-01');
    expect(data['article:modified_time']).toBe('2024-06-15');
  });

  it('injects exactly 3 hreflang alternates (ko/en/x-default) with correct URLs', () => {
    // Imperative injection (via useEffect) — not inside <Helmet> — to sidestep
    // React 19's head-hoisting accumulation bug for <link rel="alternate">.
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <HelmetProvider>
          <SEOHelmet title="Profile" />
        </HelmetProvider>
      </MemoryRouter>
    );

    const alternates = Array.from(
      document.head.querySelectorAll('link[data-seohelmet-hreflang]')
    ).map((el) => ({
      hreflang: el.getAttribute('hreflang'),
      href: el.getAttribute('href'),
    }));

    expect(alternates).toHaveLength(3);
    expect(alternates).toEqual([
      { hreflang: 'ko', href: 'https://emelmujiro.com/profile' },
      { hreflang: 'en', href: 'https://emelmujiro.com/en/profile' },
      { hreflang: 'x-default', href: 'https://emelmujiro.com/profile' },
    ]);
  });

  it('removes injected hreflang alternates on unmount', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/profile']}>
        <HelmetProvider>
          <SEOHelmet title="Profile" />
        </HelmetProvider>
      </MemoryRouter>
    );

    expect(document.head.querySelectorAll('link[data-seohelmet-hreflang]')).toHaveLength(3);

    unmount();

    expect(document.head.querySelectorAll('link[data-seohelmet-hreflang]')).toHaveLength(0);
  });

  it('falls back to ko when both lang prop and i18n.language are falsy', () => {
    mockI18nLanguage = '';
    renderWithHelmet(<SEOHelmet />);

    const data = getHelmetData();
    // resolvedLang should fall back to 'ko'
    expect(data.lang).toBe('ko');
    expect(data['og:locale']).toBe('ko_KR');
  });
});
