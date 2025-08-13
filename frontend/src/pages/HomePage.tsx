import React, { lazy, Suspense } from 'react';
import SEOHead from '../components/seo/SEOHead';
import { PageLoading } from '../components/common/UnifiedLoading';

// Lazy load sections for better performance
const HeroSection = lazy(() => import('../components/sections/HeroSection'));
const ServicesSection = lazy(
  () => import('../components/sections/ServicesSection')
);
const LogosSection = lazy(() => import('../components/sections/LogosSection'));
const CTASection = lazy(() => import('../components/sections/CTASection'));

const HomePage: React.FC = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Emelmujiro',
    alternateName: '에멜무지로',
    url: 'https://researcherhojin.github.io/emelmujiro',
    description: 'AI 교육과 컨설팅을 제공하는 전문 기업',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://researcherhojin.github.io/emelmujiro/blog?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'Emelmujiro',
      description: 'AI 교육 & 컨설팅 전문 기업',
      founder: {
        '@type': 'Person',
        name: '이호진',
      },
    },
  };

  return (
    <>
      <SEOHead
        title="Emelmujiro - AI 교육 & 컨설팅"
        description="AI 기술 교육과 컨설팅을 제공하는 전문 기업입니다. 머신러닝, 딥러닝, 데이터 분석 교육 및 기업 AI 전환 컨설팅 서비스를 제공합니다."
        url="https://researcherhojin.github.io/emelmujiro"
        structuredData={structuredData}
      />

      <Suspense fallback={<PageLoading />}>
        <HeroSection />
        <ServicesSection />
        <LogosSection />
        <CTASection />
      </Suspense>
    </>
  );
};

export default HomePage;
