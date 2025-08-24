import React from 'react';
import { Helmet } from 'react-helmet-async';

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

const MetaTags: React.FC<MetaTagsProps> = ({
  title = '에멜무지로 - AI 교육 & 컨설팅',
  description = '에멜무지로는 최첨단 AI 기술을 활용한 맞춤형 교육과 전문 컨설팅 서비스를 제공합니다. 디지털 혁신을 위한 최고의 파트너가 되어드립니다.',
  keywords = 'AI교육, AI컨설팅, 인공지능, 머신러닝, 딥러닝, 디지털전환, DX, 기업교육, IT컨설팅',
  image = `${process.env.REACT_APP_SITE_URL}/og-image.png`,
  url = process.env.REACT_APP_SITE_URL ||
    'https://researcherhojin.github.io/emelmujiro',
  type = 'website',
  author = '에멜무지로',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noindex = false,
  nofollow = false,
  canonical,
  locale = 'ko_KR',
  alternateLocales = [],
  jsonLd,
}) => {
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
                name: '홈',
                item: url,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: section || '콘텐츠',
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
                name: 'AI 교육 프로그램은 어떻게 진행되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '맞춤형 커리큘럼을 통해 이론과 실습을 병행하며, 전문 강사진이 직접 교육을 진행합니다.',
                },
              },
              {
                '@type': 'Question',
                name: '컨설팅 서비스 비용은 어떻게 되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '프로젝트 규모와 기간에 따라 상이하며, 무료 상담을 통해 견적을 제공해드립니다.',
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
