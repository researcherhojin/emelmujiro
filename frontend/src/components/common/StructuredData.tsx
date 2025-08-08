import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

type SchemaType = 'Organization' | 'Website' | 'Breadcrumb' | 'Person';

interface StructuredDataProps {
  type?: SchemaType;
}

const StructuredData: React.FC<StructuredDataProps> = memo(({ type = 'Organization' }) => {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '에멜무지로',
    alternateName: 'Emelmujiro',
    url: 'https://researcherhojin.github.io/emelmujiro',
    logo: 'https://researcherhojin.github.io/emelmujiro/logo192.png',
    description:
      'AI 교육 및 컨설팅 전문 기업. 2022년부터 축적한 AI 교육 노하우와 실무 프로젝트 경험을 바탕으로 맞춤형 AI 솔루션 제공',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressLocality: '서울',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+82-10-7279-0380',
      contactType: 'customer service',
      email: 'researcherhojin@gmail.com',
      availableLanguage: ['Korean', 'English'],
    },
    sameAs: ['https://github.com/researcherhojin', 'https://emelmujiro.com'],
    founder: {
      '@type': 'Person',
      name: '이호진',
      jobTitle: '대표',
      alumniOf: [
        {
          '@type': 'EducationalOrganization',
          name: '서울시립대학교',
        },
      ],
    },
    foundingDate: '2022',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 10,
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Korea',
    },
    serviceType: ['AI 컨설팅', '기업 교육', 'LLM 솔루션 개발'],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '에멜무지로',
    url: 'https://researcherhojin.github.io/emelmujiro',
    description: 'AI 교육 및 컨설팅 전문 기업 에멜무지로의 공식 웹사이트',
    inLanguage: 'ko-KR',
    publisher: {
      '@type': 'Organization',
      name: '에멜무지로',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: 'https://researcherhojin.github.io/emelmujiro',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '회사소개',
        item: 'https://researcherhojin.github.io/emelmujiro/#/about',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: '대표 프로필',
        item: 'https://researcherhojin.github.io/emelmujiro/#/profile',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: '문의하기',
        item: 'https://researcherhojin.github.io/emelmujiro/#/contact',
      },
    ],
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: '이호진',
    alternateName: 'Hojin Lee',
    jobTitle: 'AI Researcher & Educator',
    worksFor: {
      '@type': 'Organization',
      name: '에멜무지로',
    },
    email: 'researcherhojin@gmail.com',
    telephone: '+82-10-7279-0380',
    url: 'https://researcherhojin.github.io/emelmujiro/#/profile',
    sameAs: ['https://github.com/researcherhojin'],
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: '한양대학교',
        department: '인공지능융합대학원',
      },
      {
        '@type': 'EducationalOrganization',
        name: '경북대학교',
        department: '축산생명공학과',
      },
    ],
    knowsAbout: ['AI', 'Machine Learning', 'Deep Learning', 'Python', 'Django', 'React', '교육'],
  };

  const schemas: Record<SchemaType, Record<string, unknown>> = {
    Organization: organizationSchema,
    Website: websiteSchema,
    Breadcrumb: breadcrumbSchema,
    Person: personSchema,
  };

  const selectedSchema = schemas[type];

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(selectedSchema)}</script>
    </Helmet>
  );
});

StructuredData.displayName = 'StructuredData';

export default StructuredData;
