import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHelmet: React.FC<SEOHelmetProps> = memo(
  ({
    title = '에멜무지로',
    description = 'AI 기술의 대중화를 선도하는 전문 컨설팅 기업',
    keywords = 'AI 컨설팅, 머신러닝, 딥러닝, LLM, 기업 교육, AI 솔루션, 에멜무지로, emelmujiro, ChatGPT, 프롬프트 엔지니어링, 인공지능 교육, AI 전문가, 이호진',
    author = '에멜무지로',
    image = 'https://researcherhojin.github.io/emelmujiro/og-image.png',
    url = 'https://researcherhojin.github.io/emelmujiro',
    type = 'website',
  }) => {
    const siteTitle = title === '에멜무지로' ? title : `${title} | 에멜무지로`;

    return (
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{siteTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="에멜무지로" />
        <meta property="og:locale" content="ko_KR" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />

        {/* Canonical URL */}
        <link rel="canonical" href={url} />

        {/* Language */}
        <html lang="ko" />

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
        <meta property="og:image:alt" content="에멜무지로 - AI 교육 및 컨설팅 전문 기업" />

        {/* Twitter additional tags */}
        <meta name="twitter:image:alt" content="에멜무지로 - AI 교육 및 컨설팅 전문 기업" />

        {/* 언어 설정 */}
        <meta httpEquiv="content-language" content="ko" />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: '에멜무지로',
            description: description,
            url: 'https://researcherhojin.github.io/emelmujiro',
            logo: 'https://researcherhojin.github.io/emelmujiro/logo512.png',
            founder: {
              '@type': 'Person',
              name: '이호진',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'researcherhojin@gmail.com',
              telephone: '+82-10-7279-0380',
              contactType: 'customer service',
              availableLanguage: ['Korean', 'English'],
            },
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'KR',
              addressLocality: '서울',
            },
            sameAs: ['https://github.com/researcherhojin', 'https://emelmujiro.com'],
            foundingDate: '2022',
            areaServed: '대한민국',
            serviceType: ['AI 컨설팅', '기업 교육', 'LLM 솔루션 개발'],
          })}
        </script>
      </Helmet>
    );
  }
);

SEOHelmet.displayName = 'SEOHelmet';

export default SEOHelmet;
