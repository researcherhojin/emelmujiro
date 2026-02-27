import React, { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Emelmujiro',
    alternateName: '에멜무지로',
    url: 'https://researcherhojin.github.io/emelmujiro',
    description: t('home.seo.structuredDescription'),
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
      description: t('home.seo.orgDescription'),
      founder: {
        '@type': 'Person',
        name: '이호진',
      },
    },
  };

  return (
    <>
      <SEOHead
        title={t('home.seo.title')}
        description={t('home.seo.description')}
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
