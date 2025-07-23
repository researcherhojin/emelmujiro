import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, ogImage = '/og-image.png', canonical, type = 'website' }) => {
    const siteTitle = '에멜무지로 | AI 혁신 파트너';
    const defaultDescription =
        '기업의 AI 전환을 위한 솔루션 개발, 실전 교육, 전략 컨설팅을 제공합니다. ' +
        '검증된 방법론과 실전 경험을 바탕으로 귀사의 디지털 혁신을 함께 만들어갑니다.';
    const defaultKeywords =
        'AI 도입, AI 컨설팅, AI 교육, 기업 AI, 디지털 전환, AI 솔루션, ' +
        '머신러닝, 딥러닝, 생성형 AI, Computer Vision, AI 프로젝트, AI 전략';

    const metaDescription = description || defaultDescription;
    const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaKeywords = keywords || defaultKeywords;

    return (
        <Helmet>
            {/* 기본 메타 태그 */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />
            <meta name="author" content="에멜무지로" />

            {/* Open Graph */}
            <meta property="og:site_name" content="에멜무지로" />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:type" content={type} />
            {canonical && <meta property="og:url" content={canonical} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={ogImage} />

            {/* 추가 메타 태그 */}
            <meta name="robots" content="index, follow" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="theme-color" content="#4F46E5" />
            <meta name="google" content="notranslate" />

            {/* 언어 설정 */}
            <html lang="ko" />

            {/* 캐노니컬 URL */}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* PWA 관련 메타 태그 */}
            <meta name="application-name" content="에멜무지로" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="에멜무지로" />
            <meta name="mobile-web-app-capable" content="yes" />
        </Helmet>
    );
};

export default SEO;
