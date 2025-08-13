import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Emelmujiro - AI 교육 & 컨설팅',
  description = 'AI 기술 교육과 컨설팅을 제공하는 전문 기업입니다. 머신러닝, 딥러닝, 데이터 분석 교육 및 기업 AI 전환 컨설팅 서비스를 제공합니다.',
  keywords = 'AI교육, 머신러닝, 딥러닝, 데이터분석, AI컨설팅, 기업교육, Python, TensorFlow, 인공지능',
  image = 'https://researcherhojin.github.io/emelmujiro/og-image.png',
  url = 'https://researcherhojin.github.io/emelmujiro',
  type = 'website',
  author = '이호진',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  structuredData,
}) => {
  const siteTitle = 'Emelmujiro';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  // Default organization structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Emelmujiro',
    alternateName: '에멜무지로',
    description: 'AI 교육 & 컨설팅 전문 기업',
    url: 'https://researcherhojin.github.io/emelmujiro',
    logo: 'https://researcherhojin.github.io/emelmujiro/logo.png',
    founder: {
      '@type': 'Person',
      name: '이호진',
      jobTitle: 'CEO & AI Consultant',
    },
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@emelmujiro.com',
      availableLanguage: ['Korean', 'English'],
    },
    sameAs: [
      'https://github.com/researcherhojin',
      'https://linkedin.com/in/hojinahn',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressLocality: 'Seoul',
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Korea',
    },
    serviceArea: {
      '@type': 'AdministrativeArea',
      name: 'Nationwide',
    },
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'Deep Learning',
      'Data Science',
      'Python Programming',
      'TensorFlow',
      'PyTorch',
      'Natural Language Processing',
      'Computer Vision',
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI 교육 프로그램',
          description: '기업 맞춤형 AI 교육 프로그램',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI 컨설팅',
          description: '기업 AI 전환 컨설팅 서비스',
        },
      },
    ],
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Article specific */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@emelmujiro" />

      {/* Additional SEO tags */}
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="googlebot" content="index, follow" />
      <meta name="google" content="notranslate" />
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="preconnect" href="https://www.googletagmanager.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* PWA tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="application-name" content={siteTitle} />
      <meta name="apple-mobile-web-app-title" content={siteTitle} />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
    </Helmet>
  );
};

export default SEOHead;
