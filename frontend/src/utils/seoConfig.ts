import i18n from '../i18n';

// SEO Configuration and utilities
export const getSeoConfig = () => ({
  site: {
    name: i18n.t('seo.site.name'),
    title: i18n.t('seo.site.title'),
    description: i18n.t('seo.site.description'),
    url: 'https://researcherhojin.github.io/emelmujiro',
    image: '/og-image.png',
    locale: i18n.language === 'en' ? 'en_US' : 'ko_KR',
    type: 'website' as const,
  },
  social: {
    twitter: '@emelmujiro',
    facebook: 'emelmujiro',
    instagram: 'emelmujiro',
    linkedin: 'emelmujiro',
    github: 'researcherhojin',
  },
  pages: {
    home: {
      title: i18n.t('seo.pages.home.title'),
      description: i18n.t('seo.pages.home.description'),
      keywords: i18n.t('seo.pages.home.keywords'),
    },
    about: {
      title: i18n.t('seo.pages.about.title'),
      description: i18n.t('seo.pages.about.description'),
      keywords: i18n.t('seo.pages.about.keywords'),
    },
    profile: {
      title: i18n.t('seo.pages.profile.title'),
      description: i18n.t('seo.pages.profile.description'),
      keywords: i18n.t('seo.pages.profile.keywords'),
    },
    contact: {
      title: i18n.t('seo.pages.contact.title'),
      description: i18n.t('seo.pages.contact.description'),
      keywords: i18n.t('seo.pages.contact.keywords'),
    },
    blog: {
      title: i18n.t('seo.pages.blog.title'),
      description: i18n.t('seo.pages.blog.description'),
      keywords: i18n.t('seo.pages.blog.keywords'),
    },
  },
});

// Static reference for backward compatibility
export const SEO_CONFIG = getSeoConfig();

// Generate meta tags for a specific page
export function generateMetaTags(
  page: 'home' | 'about' | 'profile' | 'contact' | 'blog'
) {
  const config = getSeoConfig();
  const pageConfig = config.pages[page];
  const siteConfig = config.site;

  return {
    title: `${pageConfig.title} | ${siteConfig.name}`,
    description: pageConfig.description,
    keywords: pageConfig.keywords,
    openGraph: {
      title: `${pageConfig.title} | ${siteConfig.name}`,
      description: pageConfig.description,
      url: `${siteConfig.url}${page !== 'home' ? `/#/${page}` : ''}`,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.image,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
      locale: siteConfig.locale,
      type: siteConfig.type,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageConfig.title} | ${siteConfig.name}`,
      description: pageConfig.description,
      images: [siteConfig.image],
      creator: config.social.twitter,
    },
  };
}

interface StructuredDataInput {
  items?: Array<{ position: number; name: string; item: string }>;
  title?: string;
  description?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  [key: string]: unknown;
}

// Generate JSON-LD structured data
export function generateStructuredData(
  type: 'organization' | 'website' | 'breadcrumb' | 'person' | 'article',
  data?: StructuredDataInput
) {
  const config = getSeoConfig();
  const baseUrl = config.site.url;

  const schemas = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: config.site.name,
      url: baseUrl,
      logo: `${baseUrl}/logo192.png`,
      description: config.site.description,
      sameAs: [
        `https://github.com/${config.social.github}`,
        config.social.linkedin &&
          `https://linkedin.com/company/${config.social.linkedin}`,
        config.social.facebook &&
          `https://facebook.com/${config.social.facebook}`,
      ].filter(Boolean),
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+82-10-7279-0380',
        contactType: 'customer service',
        email: 'researcherhojin@gmail.com',
        availableLanguage: ['Korean', 'English'],
      },
    },
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: baseUrl,
      name: config.site.name,
      description: config.site.description,
      publisher: {
        '@type': 'Organization',
        name: config.site.name,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: i18n.t('common.home'),
          item: baseUrl,
        },
        ...(data?.items || []),
      ],
    },
    person: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: i18n.t('seo.personName'),
      jobTitle: 'AI Researcher & Educator',
      url: `${baseUrl}/#/profile`,
      worksFor: {
        '@type': 'Organization',
        name: config.site.name,
      },
      ...data,
    },
    article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data?.title,
      description: data?.description,
      author: data?.author || i18n.t('seo.personName'),
      datePublished: data?.publishedDate,
      dateModified: data?.modifiedDate || data?.publishedDate,
      publisher: {
        '@type': 'Organization',
        name: config.site.name,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo192.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': data?.url || baseUrl,
      },
      ...data,
    },
  };

  return schemas[type];
}

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const config = getSeoConfig();
  const baseUrl = config.site.url;
  const cleanPath = path?.startsWith('/') ? path : `/${path || ''}`;
  return path ? `${baseUrl}${cleanPath}` : baseUrl;
}

// Generate alternate language links
export function generateAlternateLinks() {
  const config = getSeoConfig();
  return [
    { rel: 'alternate', hreflang: 'ko', href: config.site.url },
    { rel: 'alternate', hreflang: 'en', href: config.site.url },
    { rel: 'alternate', hreflang: 'x-default', href: config.site.url },
  ];
}
