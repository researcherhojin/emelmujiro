/**
 * SEO 유틸리티 함수 및 스키마 생성기
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Organization 스키마 생성
 */
export const createOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '에멜무지로',
  alternateName: 'Emelmujiro',
  url: 'https://researcherhojin.github.io/emelmujiro/',
  logo: 'https://researcherhojin.github.io/emelmujiro/logo192.png',
  description: 'AI 교육 및 컨설팅 전문 기업',
  foundingDate: '2023-01-01',
  founders: [
    {
      '@type': 'Person',
      name: '이호진',
      jobTitle: 'CEO & Founder',
      alumniOf: 'KIST',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'KR',
    addressRegion: '서울특별시',
  },
  sameAs: [
    'https://github.com/researcherhojin',
    'https://linkedin.com/in/emelmujiro',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+82-10-0000-0000',
      contactType: 'customer service',
      availableLanguage: ['Korean', 'English'],
    },
  ],
  areaServed: {
    '@type': 'Country',
    name: 'South Korea',
  },
  serviceType: ['AI Education', 'AI Consulting', 'Software Development'],
});

/**
 * BreadcrumbList 스키마 생성
 */
export const createBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/**
 * FAQPage 스키마 생성
 */
export const createFAQSchema = (items: FAQItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

/**
 * Service 스키마 생성
 */
export const createServiceSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'AI Education and Consulting',
  provider: {
    '@type': 'Organization',
    name: '에멜무지로',
  },
  areaServed: {
    '@type': 'Country',
    name: 'South Korea',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'AI 교육 및 컨설팅 서비스',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI 기초 교육',
          description: 'AI 기초부터 실무까지 체계적인 교육 프로그램',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI 컨설팅',
          description: '기업 맞춤형 AI 도입 및 활용 컨설팅',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: '맞춤형 AI 솔루션 개발',
          description: '비즈니스 요구사항에 맞는 AI 솔루션 개발',
        },
      },
    ],
  },
});

/**
 * WebSite 스키마 생성 (검색 기능 포함)
 */
export const createWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '에멜무지로',
  url: 'https://researcherhojin.github.io/emelmujiro/',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate:
        'https://researcherhojin.github.io/emelmujiro/#/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
});

/**
 * Course 스키마 생성 (교육 프로그램용)
 */
export const createCourseSchema = (course: {
  name: string;
  description: string;
  provider: string;
  duration: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.name,
  description: course.description,
  provider: {
    '@type': 'Organization',
    name: course.provider,
    sameAs: 'https://researcherhojin.github.io/emelmujiro/',
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'blended',
    duration: course.duration,
    inLanguage: 'ko',
  },
});

/**
 * 페이지별 메타 데이터 생성
 */
export const getPageMetadata = (page: string) => {
  const baseUrl = 'https://researcherhojin.github.io/emelmujiro';

  switch (page) {
    case 'home':
      return {
        title: '에멜무지로 | AI 교육 & 컨설팅 전문 기업',
        description:
          '최첨단 AI 기술을 활용한 맞춤형 교육과 전문 컨설팅 서비스를 제공합니다.',
        keywords: 'AI교육, AI컨설팅, 인공지능, 머신러닝, 딥러닝, 디지털전환',
        url: baseUrl,
      };
    case 'about':
      return {
        title: '회사소개 | 에멜무지로',
        description:
          '에멜무지로의 비전, 미션, 핵심 가치와 함께하는 AI 혁신의 여정',
        keywords: '회사소개, AI전문기업, 기업비전, 혁신기술',
        url: `${baseUrl}/#/about`,
      };
    case 'profile':
      return {
        title: '이호진 프로필 | 에멜무지로 CEO',
        description:
          'KIST 연구원 출신 AI 전문가, 에멜무지로 CEO 이호진의 경력과 전문성',
        keywords: '이호진, CEO, AI전문가, KIST, 컴퓨터비전',
        url: `${baseUrl}/#/profile`,
      };
    case 'contact':
      return {
        title: '문의하기 | 에멜무지로',
        description: 'AI 교육 및 컨설팅 문의, 맞춤형 솔루션 상담 신청',
        keywords: '문의하기, 상담신청, AI교육문의, 컨설팅문의',
        url: `${baseUrl}/#/contact`,
      };
    case 'blog':
      return {
        title: '블로그 | 에멜무지로',
        description:
          'AI 기술 트렌드, 교육 인사이트, 성공 사례를 공유하는 에멜무지로 블로그',
        keywords: 'AI블로그, 기술블로그, AI트렌드, 교육인사이트',
        url: `${baseUrl}/#/blog`,
      };
    default:
      return {
        title: '에멜무지로',
        description: 'AI 교육 및 컨설팅 전문 기업',
        keywords: 'AI, 교육, 컨설팅',
        url: baseUrl,
      };
  }
};

/**
 * robots.txt 생성 함수
 */
export const generateRobotsTxt = () => {
  const baseUrl = 'https://researcherhojin.github.io/emelmujiro';
  return `# Robots.txt for Emelmujiro
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: *.json$
Crawl-delay: 1

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-index.xml

# Googlebot
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Bingbot
User-agent: Bingbot
Allow: /
Crawl-delay: 1
`;
};

/**
 * 캐노니컬 URL 생성
 */
export const getCanonicalUrl = (path: string) => {
  const baseUrl = 'https://researcherhojin.github.io/emelmujiro';

  // 파라미터와 해시 제거 (HashRouter 제외)
  const cleanPath = path.split('?')[0];

  if (cleanPath === '/' || cleanPath === '') {
    return baseUrl;
  }

  // HashRouter URL 형식 유지
  if (!cleanPath.startsWith('#')) {
    return `${baseUrl}/#${cleanPath}`;
  }

  return `${baseUrl}${cleanPath}`;
};

export default {
  createOrganizationSchema,
  createBreadcrumbSchema,
  createFAQSchema,
  createServiceSchema,
  createWebSiteSchema,
  createCourseSchema,
  getPageMetadata,
  generateRobotsTxt,
  getCanonicalUrl,
};
