import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL } from '../../utils/constants';

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

const SEOHead: React.FC<SEOHeadProps> = (props) => {
  const { t } = useTranslation();

  const {
    title = t('seo.seoHead.defaultTitle'),
    description = t('seo.seoHead.defaultDescription'),
    keywords = t('seo.seoHead.defaultKeywords'),
    image = 'https://researcherhojin.github.io/emelmujiro/og-image.png',
    url = 'https://researcherhojin.github.io/emelmujiro',
    type = 'website',
    author = t('seo.personName'),
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    structuredData,
  } = props;
  const siteTitle = 'Emelmujiro';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  // Default organization structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Emelmujiro',
    alternateName: t('common.companyName'),
    description: t('seo.seoHead.orgDescription'),
    url: 'https://researcherhojin.github.io/emelmujiro',
    logo: 'https://researcherhojin.github.io/emelmujiro/logo.png',
    founder: {
      '@type': 'Person',
      name: t('seo.personName'),
      jobTitle: 'CEO & AI Consultant',
    },
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: CONTACT_EMAIL,
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
          name: t('seo.seoHead.offerEducationName'),
          description: t('seo.seoHead.offerEducationDescription'),
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: t('seo.seoHead.offerConsultingName'),
          description: t('seo.seoHead.offerConsultingDescription'),
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
