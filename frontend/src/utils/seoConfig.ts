// SEO Configuration and utilities
export const SEO_CONFIG = {
  site: {
    name: '에멜무지로',
    title: '에멜무지로 | AI 혁신 파트너',
    description:
      '기업의 AI 전환을 위한 솔루션 개발, 실전 교육, 전략 컨설팅을 제공합니다. 검증된 방법론과 실전 경험을 바탕으로 귀사의 디지털 혁신을 함께 만들어갑니다.',
    url: 'https://researcherhojin.github.io/emelmujiro',
    image: '/og-image.png',
    locale: 'ko_KR',
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
      title: '홈',
      description:
        'AI 교육과 컨설팅 전문 기업 에멜무지로입니다. 맞춤형 AI 솔루션으로 귀사의 디지털 혁신을 돕습니다.',
      keywords:
        'AI 도입, AI 컨설팅, AI 교육, 기업 AI, 디지털 전환, AI 솔루션, 머신러닝, 딥러닝, 생성형 AI',
    },
    about: {
      title: '회사소개',
      description:
        '에멜무지로는 2022년부터 축적한 AI 교육 노하우와 실무 프로젝트 경험을 바탕으로 맞춤형 AI 솔루션을 제공합니다.',
      keywords:
        'AI 회사, AI 전문기업, AI 교육기관, AI 컨설팅 회사, 에멜무지로 소개',
    },
    profile: {
      title: '대표 프로필',
      description:
        '이호진 대표 - AI 연구자 및 교육자. 한양대학교 인공지능융합대학원 석사, 다년간의 AI 프로젝트 경험 보유',
      keywords:
        '이호진, AI 전문가, AI 교육자, AI 연구자, 한양대학교, 인공지능 전문가',
    },
    contact: {
      title: '문의하기',
      description:
        'AI 도입 컨설팅, 맞춤형 교육, 솔루션 개발 문의는 에멜무지로에게 연락주세요.',
      keywords: 'AI 상담, AI 문의, 컨설팅 문의, 교육 문의, 연락처',
    },
    blog: {
      title: '블로그',
      description:
        'AI 기술 동향, 실무 사례, 교육 콘텐츠를 공유하는 에멜무지로 블로그',
      keywords: 'AI 블로그, AI 기술, AI 트렌드, AI 사례, AI 교육 자료',
    },
  },
};

// Generate meta tags for a specific page
export function generateMetaTags(page: keyof typeof SEO_CONFIG.pages) {
  const pageConfig = SEO_CONFIG.pages[page];
  const siteConfig = SEO_CONFIG.site;

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
      creator: SEO_CONFIG.social.twitter,
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
  const baseUrl = SEO_CONFIG.site.url;

  const schemas = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SEO_CONFIG.site.name,
      url: baseUrl,
      logo: `${baseUrl}/logo192.png`,
      description: SEO_CONFIG.site.description,
      sameAs: [
        `https://github.com/${SEO_CONFIG.social.github}`,
        SEO_CONFIG.social.linkedin &&
          `https://linkedin.com/company/${SEO_CONFIG.social.linkedin}`,
        SEO_CONFIG.social.facebook &&
          `https://facebook.com/${SEO_CONFIG.social.facebook}`,
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
      name: SEO_CONFIG.site.name,
      description: SEO_CONFIG.site.description,
      publisher: {
        '@type': 'Organization',
        name: SEO_CONFIG.site.name,
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
          name: '홈',
          item: baseUrl,
        },
        ...(data?.items || []),
      ],
    },
    person: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: '이호진',
      jobTitle: 'AI Researcher & Educator',
      url: `${baseUrl}/#/profile`,
      worksFor: {
        '@type': 'Organization',
        name: SEO_CONFIG.site.name,
      },
      ...data,
    },
    article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data?.title,
      description: data?.description,
      author: data?.author || '이호진',
      datePublished: data?.publishedDate,
      dateModified: data?.modifiedDate || data?.publishedDate,
      publisher: {
        '@type': 'Organization',
        name: SEO_CONFIG.site.name,
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
  const baseUrl = SEO_CONFIG.site.url;
  const cleanPath = path?.startsWith('/') ? path : `/${path || ''}`;
  return path ? `${baseUrl}${cleanPath}` : baseUrl;
}

// Generate alternate language links
export function generateAlternateLinks() {
  return [
    { rel: 'alternate', hreflang: 'ko', href: SEO_CONFIG.site.url },
    { rel: 'alternate', hreflang: 'x-default', href: SEO_CONFIG.site.url },
  ];
}
