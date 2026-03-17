import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL, SITE_URL } from '../../utils/constants';

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
    const { t, i18n } = useTranslation();
    const siteName = t('common.companyName');
    const inLanguage = i18n.language === 'en' ? 'en-US' : 'ko-KR';

    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      alternateName: ['Emelmujiro', 'emelmujiro', `${siteName} AI`],
      url: SITE_URL,
      logo: `${SITE_URL}/logo512.png`,
      description: t('seo.site.description'),
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KR',
        addressLocality: t('contact.info.address'),
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: t('contact.info.phone'),
        contactType: t('seo.contactType'),
        email: CONTACT_EMAIL,
        availableLanguage: ['Korean', 'English'],
      },
      sameAs: ['https://github.com/researcherhojin'],
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
        name: t('seo.countryName'),
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
      url: SITE_URL,
      description: t('seo.site.description'),
      inLanguage,
      publisher: {
        '@type': 'Organization',
        name: siteName,
      },
    };

    // Breadcrumb only includes pages that are live (not under construction)
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('common.home'),
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t('common.about'),
          item: `${SITE_URL}/about`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: t('common.representativeProfile'),
          item: `${SITE_URL}/profile`,
        },
      ],
    };

    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: t('seo.personName'),
      alternateName: t('seo.personAlternateName'),
      jobTitle: t('seo.personJobTitle'),
      worksFor: {
        '@type': 'Organization',
        name: siteName,
      },
      email: CONTACT_EMAIL,
      telephone: t('contact.info.phone'),
      url: `${SITE_URL}/profile`,
      sameAs: ['https://github.com/researcherhojin'],
      knowsAbout: [
        t('seo.knowsAbout.ai'),
        t('seo.knowsAbout.ml'),
        t('seo.knowsAbout.dl'),
        t('seo.knowsAbout.python'),
        t('seo.knowsAbout.django'),
        t('seo.knowsAbout.react'),
      ],
    };

    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#business`,
      name: siteName,
      description: t('seo.site.description'),
      url: SITE_URL,
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
        url: SITE_URL,
      },
      serviceType: service?.serviceType || t('services.consulting.title'),
      areaServed: service?.areaServed || t('seo.countryName'),
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
          image: article.image || `${SITE_URL}/og-image.png`,
          author: {
            '@type': 'Person',
            name: article.author || t('seo.personName'),
          },
          publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/logo512.png`,
            },
          },
          datePublished: article.publishedTime,
          dateModified: article.modifiedTime || article.publishedTime,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': SITE_URL,
          },
          articleSection: article.category,
          keywords: article.tags?.join(', '),
        }
      : {};

    // SearchAction schema — currently points to the home page since blog is
    // under construction. Update the urlTemplate when blog is re-enabled.
    const searchActionSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: siteName,
      url: SITE_URL,
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
        <script type="application/ld+json">{JSON.stringify(selectedSchema)}</script>
      </Helmet>
    );
  }
);

StructuredData.displayName = 'StructuredData';

export default StructuredData;
