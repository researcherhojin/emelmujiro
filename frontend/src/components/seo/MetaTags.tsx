import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  locale?: string;
  alternateLocales?: { lang: string; url: string }[];
  jsonLd?: Record<string, unknown>;
}

const MetaTags: React.FC<MetaTagsProps> = (props) => {
  const { t, i18n: i18nInstance } = useTranslation();

  const {
    title = t('seo.metaTags.defaultTitle'),
    description = t('seo.metaTags.defaultDescription'),
    keywords = t('seo.metaTags.defaultKeywords'),
    image = `${process.env.REACT_APP_SITE_URL}/og-image.png`,
    url = process.env.REACT_APP_SITE_URL ||
      'https://researcherhojin.github.io/emelmujiro',
    type = 'website',
    author = t('common.companyName'),
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    noindex = false,
    nofollow = false,
    canonical,
    locale = i18nInstance.language === 'en' ? 'en_US' : 'ko_KR',
    alternateLocales = [],
    jsonLd,
  } = props;
  const siteName = process.env.REACT_APP_APP_NAME || 'Emelmujiro';
  const twitterHandle = process.env.REACT_APP_TWITTER_HANDLE || '@emelmujiro';

  // 기본 JSON-LD 구조화 데이터
  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'Organization',
    name: siteName,
    url: url,
    logo: `${url}/logo192.png`,
    description: description,
    ...(type === 'article' && {
      headline: title,
      author: {
        '@type': 'Person',
        name: author,
      },
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      image: image,
      keywords: tags.join(', '),
    }),
    ...(type === 'website' && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: process.env.REACT_APP_EMERGENCY_CONTACT_NUMBER,
        contactType: 'customer service',
        email: process.env.REACT_APP_CONTACT_EMAIL,
        areaServed: 'KR',
        availableLanguage: ['Korean', 'English'],
      },
      sameAs: [
        process.env.REACT_APP_LINKEDIN_URL,
        `https://twitter.com/${twitterHandle.replace('@', '')}`,
      ].filter(Boolean),
    }),
  };

  const finalJsonLd = jsonLd || defaultJsonLd;

  return (
    <Helmet>
      {/* 기본 메타 태그 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* 로봇 메타 태그 */}
      <meta
        name="robots"
        content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`}
      />
      <meta
        name="googlebot"
        content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`}
      />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph 태그 */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={locale} />

      {/* Open Graph - Article */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card 태그 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />

      {/* 대체 언어 */}
      {alternateLocales.map((locale, index) => (
        <link
          key={index}
          rel="alternate"
          hrefLang={locale.lang}
          href={locale.url}
        />
      ))}

      {/* 추가 메타 태그 */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=5"
      />
      <meta
        name="theme-color"
        content={process.env.REACT_APP_PWA_THEME_COLOR || '#10B981'}
      />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* 네이버 검색 최적화 */}
      <meta
        name="naver-site-verification"
        content={process.env.REACT_APP_NAVER_SITE_VERIFICATION}
      />

      {/* 구글 검색 콘솔 */}
      <meta
        name="google-site-verification"
        content={process.env.REACT_APP_GOOGLE_SITE_VERIFICATION}
      />

      {/* JSON-LD 구조화 데이터 */}
      <script type="application/ld+json">{JSON.stringify(finalJsonLd)}</script>

      {/* 추가 구조화 데이터 - BreadcrumbList */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: t('common.home'),
                item: url,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: section || t('seo.metaTags.content'),
                item: `${url}/${section?.toLowerCase()}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: title,
                item: canonical || url,
              },
            ],
          })}
        </script>
      )}

      {/* FAQPage 구조화 데이터 (FAQ 페이지용) */}
      {type === 'website' && title.includes('FAQ') && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: t('seo.metaTags.faq.educationQuestion'),
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: t('seo.metaTags.faq.educationAnswer'),
                },
              },
              {
                '@type': 'Question',
                name: t('seo.metaTags.faq.consultingQuestion'),
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: t('seo.metaTags.faq.consultingAnswer'),
                },
              },
            ],
          })}
        </script>
      )}
    </Helmet>
  );
};

export default MetaTags;
