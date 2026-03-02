import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL } from '../../utils/constants';

type SchemaType =
  | 'Organization'
  | 'Website'
  | 'Breadcrumb'
  | 'Person'
  | 'LocalBusiness'
  | 'Service'
  | 'Article'
  | 'SearchAction';

interface StructuredDataProps {
  type?: SchemaType;
  article?: {
    title?: string;
    description?: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    category?: string;
    tags?: string[];
    image?: string;
  };
  service?: {
    name?: string;
    description?: string;
    serviceType?: string;
    areaServed?: string;
  };
}

const StructuredData: React.FC<StructuredDataProps> = memo(
  ({ type = 'Organization', article, service }) => {
    const { t } = useTranslation();
    const siteName = t('common.companyName');

    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      alternateName: 'Emelmujiro',
      url: 'https://researcherhojin.github.io/emelmujiro',
      logo: 'https://researcherhojin.github.io/emelmujiro/logo192.png',
      description: t('seo.site.description'),
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KR',
        addressLocality: t('contact.info.address'),
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: t('contact.info.phone'),
        contactType: 'customer service',
        email: CONTACT_EMAIL,
        availableLanguage: ['Korean', 'English'],
      },
      sameAs: ['https://github.com/researcherhojin', 'https://emelmujiro.com'],
      founder: {
        '@type': 'Person',
        name: t('seo.personName'),
        jobTitle: 'CEO',
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
      serviceType: [
        t('services.consulting.title'),
        t('services.education.title'),
        t('services.llmGenai.title'),
      ],
    };

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: 'https://researcherhojin.github.io/emelmujiro',
      description: t('seo.site.description'),
      inLanguage: 'ko-KR',
      publisher: {
        '@type': 'Organization',
        name: siteName,
      },
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('common.home'),
          item: 'https://researcherhojin.github.io/emelmujiro',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t('common.about'),
          item: 'https://researcherhojin.github.io/emelmujiro/#/about',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: t('common.representativeProfile'),
          item: 'https://researcherhojin.github.io/emelmujiro/#/profile',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: t('common.contact'),
          item: 'https://researcherhojin.github.io/emelmujiro/#/contact',
        },
      ],
    };

    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: t('seo.personName'),
      alternateName: 'Hojin Lee',
      jobTitle: 'AI Researcher & Educator',
      worksFor: {
        '@type': 'Organization',
        name: siteName,
      },
      email: CONTACT_EMAIL,
      telephone: t('contact.info.phone'),
      url: 'https://researcherhojin.github.io/emelmujiro/#/profile',
      sameAs: ['https://github.com/researcherhojin'],
      knowsAbout: [
        'AI',
        'Machine Learning',
        'Deep Learning',
        'Python',
        'Django',
        'React',
      ],
    };

    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://researcherhojin.github.io/emelmujiro/#business',
      name: siteName,
      description: t('seo.site.description'),
      url: 'https://researcherhojin.github.io/emelmujiro',
      telephone: t('contact.info.phone'),
      email: CONTACT_EMAIL,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KR',
        addressLocality: t('contact.info.address'),
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 37.566826,
        longitude: 126.9786567,
      },
      openingHours: 'Mo-Fr 09:00-18:00',
      priceRange: '$$',
      servesCuisine: null,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `${t('services.education.title')} & ${t('services.consulting.title')}`,
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: t('services.consulting.title'),
              description: t('services.consulting.description'),
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: t('services.education.title'),
              description: t('services.education.description'),
            },
          },
        ],
      },
    };

    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service?.name || t('services.consulting.title'),
      description: service?.description || t('seo.site.description'),
      provider: {
        '@type': 'Organization',
        name: siteName,
        url: 'https://researcherhojin.github.io/emelmujiro',
      },
      serviceType: service?.serviceType || 'AI Consulting',
      areaServed: service?.areaServed || 'South Korea',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: t('footer.services'),
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: t('services.llmGenai.title'),
              description: t('services.llmGenai.description'),
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: t('services.consulting.title'),
              description: t('services.consulting.description'),
            },
          },
        ],
      },
    };

    const articleSchema = article
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.description,
          image:
            article.image ||
            'https://researcherhojin.github.io/emelmujiro/og-image.png',
          author: {
            '@type': 'Person',
            name: article.author || t('seo.personName'),
          },
          publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
              '@type': 'ImageObject',
              url: 'https://researcherhojin.github.io/emelmujiro/logo192.png',
            },
          },
          datePublished: article.publishedTime,
          dateModified: article.modifiedTime || article.publishedTime,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': 'https://researcherhojin.github.io/emelmujiro',
          },
          articleSection: article.category,
          keywords: article.tags?.join(', '),
        }
      : {};

    const searchActionSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://researcherhojin.github.io/emelmujiro/#website',
      name: siteName,
      url: 'https://researcherhojin.github.io/emelmujiro',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate:
            'https://researcherhojin.github.io/emelmujiro/#/blog?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    };

    const schemas: Record<SchemaType, Record<string, unknown>> = {
      Organization: organizationSchema,
      Website: websiteSchema,
      Breadcrumb: breadcrumbSchema,
      Person: personSchema,
      LocalBusiness: localBusinessSchema,
      Service: serviceSchema,
      Article: articleSchema,
      SearchAction: searchActionSchema,
    };

    const selectedSchema = schemas[type];

    return (
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(selectedSchema)}
        </script>
      </Helmet>
    );
  }
);

StructuredData.displayName = 'StructuredData';

export default StructuredData;
