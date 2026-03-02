import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL } from '../../utils/constants';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: string;
  lang?: string;
  alternateLanguages?: { lang: string; url: string }[];
  publishedTime?: string;
  modifiedTime?: string;
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
}

const SEOHelmet: React.FC<SEOHelmetProps> = memo(
  ({
    title,
    description,
    keywords,
    author,
    image = 'https://researcherhojin.github.io/emelmujiro/og-image.png',
    url = 'https://researcherhojin.github.io/emelmujiro',
    type = 'website',
    lang = 'ko',
    alternateLanguages = [
      { lang: 'ko', url: 'https://researcherhojin.github.io/emelmujiro' },
      {
        lang: 'en',
        url: 'https://researcherhojin.github.io/emelmujiro?lang=en',
      },
    ],
    publishedTime,
    modifiedTime,
    article,
  }) => {
    const { t } = useTranslation();
    const siteName = t('common.companyName');
    const resolvedTitle = title || siteName;
    const resolvedDescription = description || t('seo.site.description');
    const resolvedKeywords = keywords || t('seo.seoHead.defaultKeywords');
    const resolvedAuthor = author || siteName;
    const siteTitle =
      resolvedTitle === siteName
        ? resolvedTitle
        : `${resolvedTitle} | ${siteName}`;

    return (
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{siteTitle}</title>
        <meta name="description" content={resolvedDescription} />
        <meta name="keywords" content={resolvedKeywords} />
        <meta name="author" content={resolvedAuthor} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={resolvedDescription} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:locale:alternate" content="en_US" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={resolvedDescription} />
        <meta name="twitter:image" content={image} />

        {/* Canonical URL */}
        <link rel="canonical" href={url} />

        {/* Language and hreflang */}
        <html lang={lang} />
        {alternateLanguages?.map(({ lang: langCode, url: langUrl }) => (
          <link
            key={langCode}
            rel="alternate"
            hrefLang={langCode}
            href={langUrl}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={url} />

        {/* Additional SEO Tags */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="bingbot" content="index, follow" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />

        {/* Additional Open Graph Tags */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content={`${siteName} - ${t('seo.seoHead.orgDescription')}`}
        />

        {/* Twitter additional tags */}
        <meta
          name="twitter:image:alt"
          content={`${siteName} - ${t('seo.seoHead.orgDescription')}`}
        />

        {/* Article specific meta tags */}
        {type === 'article' && article && (
          <>
            <meta
              property="article:author"
              content={article.author || resolvedAuthor}
            />
            {article.publishedTime && (
              <meta
                property="article:published_time"
                content={article.publishedTime}
              />
            )}
            {article.modifiedTime && (
              <meta
                property="article:modified_time"
                content={article.modifiedTime}
              />
            )}
            {article.section && (
              <meta property="article:section" content={article.section} />
            )}
            {article.tags?.map((tag) => (
              <meta key={tag} property="article:tag" content={tag} />
            ))}
          </>
        )}

        {/* Publication dates for any content */}
        {publishedTime && (
          <meta name="article:published_time" content={publishedTime} />
        )}
        {modifiedTime && (
          <meta name="article:modified_time" content={modifiedTime} />
        )}

        {/* 언어 설정 */}
        <meta httpEquiv="content-language" content={lang} />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteName,
            description: resolvedDescription,
            url: 'https://researcherhojin.github.io/emelmujiro',
            logo: 'https://researcherhojin.github.io/emelmujiro/logo512.png',
            founder: {
              '@type': 'Person',
              name: t('seo.personName'),
            },
            contactPoint: {
              '@type': 'ContactPoint',
              email: CONTACT_EMAIL,
              telephone: t('contact.info.phone'),
              contactType: 'customer service',
              availableLanguage: ['Korean', 'English'],
            },
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'KR',
              addressLocality: t('contact.info.address'),
            },
            sameAs: [
              'https://github.com/researcherhojin',
              'https://emelmujiro.com',
            ],
            foundingDate: '2022',
            areaServed: 'South Korea',
            serviceType: [
              t('services.consulting.title'),
              t('services.education.title'),
              t('services.llmGenai.title'),
            ],
          })}
        </script>
      </Helmet>
    );
  }
);

SEOHelmet.displayName = 'SEOHelmet';

export default SEOHelmet;
