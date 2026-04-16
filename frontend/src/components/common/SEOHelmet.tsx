import React, { memo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { CONTACT_EMAIL, SITE_URL } from '../../utils/constants';
import { stripLangPrefix } from '../../hooks/useLocalizedPath';

/**
 * Imperatively manage hreflang alternate <link> tags.
 *
 * We can't render these inside <Helmet> under React 19: react-helmet-async's
 * React19Dispatcher renders tags as React children relying on React 19's
 * automatic head-hoisting. React 19 hoists and dedupes <title> by tagName and
 * <link rel="canonical"> by the `rel` key, but multiple <link rel="alternate">
 * tags with the same rel and differing hreflang/href are each treated as a
 * distinct resource. When SEOHelmet re-renders (e.g. i18n language change on
 * /en/* routes, or i18next `t()` resolving keys after initial mount), the old
 * hoisted alternates are NOT removed — they accumulate. Prerendered HTML ended
 * up with 6–9 duplicate alternates per route, which GSC reads as conflicting
 * canonical signals.
 *
 * Imperative DOM control sidesteps the hoisting path entirely: we own a set of
 * <link> nodes marked with `data-seohelmet-hreflang`, clear them on each run,
 * and append fresh ones. Reruns only on URL prop change.
 */
const HREFLANG_MARKER = 'data-seohelmet-hreflang';

function removeAllHreflangAlternates() {
  document.querySelectorAll(`link[${HREFLANG_MARKER}]`).forEach((el) => el.remove());
}

function useHreflangAlternates(koUrl: string, enUrl: string) {
  useEffect(() => {
    removeAllHreflangAlternates();

    const add = (hreflang: string, href: string) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      link.setAttribute(HREFLANG_MARKER, 'true');
      document.head.appendChild(link);
    };

    add('ko', koUrl);
    add('en', enUrl);
    add('x-default', koUrl);

    // Clean up on unmount / before re-run so alternates from a previous route
    // don't linger in the head after SEOHelmet unmounts. This matters on SPA
    // navigations where a route without a SEOHelmet (unlikely in practice but
    // possible) would otherwise inherit the previous route's hreflang set.
    return () => {
      removeAllHreflangAlternates();
    };
  }, [koUrl, enUrl]);
}

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: string;
  lang?: string;
  robots?: string;
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
    image = `${SITE_URL}/og-image.png`,
    url,
    type = 'website',
    lang,
    robots,
    publishedTime,
    modifiedTime,
    article,
  }) => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const resolvedLang = lang || i18n.language || 'ko';
    const siteName = t('common.companyName');
    const resolvedTitle = title || siteName;
    const resolvedDescription = description || t('seo.site.description');
    const resolvedKeywords = keywords || t('seo.seoHead.defaultKeywords');
    const resolvedAuthor = author || siteName;
    const siteTitle = resolvedTitle === siteName ? resolvedTitle : `${resolvedTitle} | ${siteName}`;

    // Auto-compute canonical URL from current path when not explicitly provided
    const cleanPath = location.pathname.replace(/\/$/, '') || '/';
    const canonicalUrl = url || `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;

    // Build hreflang URLs: /profile (ko), /en/profile (en)
    const basePath = stripLangPrefix(location.pathname);
    const koUrl = `${SITE_URL}${basePath === '/' ? '' : basePath}`;
    const enUrl = `${SITE_URL}/en${basePath === '/' ? '' : basePath}`;

    useHreflangAlternates(koUrl, enUrl);

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
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content={resolvedLang === 'en' ? 'en_US' : 'ko_KR'} />
        <meta property="og:locale:alternate" content={resolvedLang === 'en' ? 'ko_KR' : 'en_US'} />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={resolvedDescription} />
        <meta name="twitter:image" content={image} />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Language */}
        <html lang={resolvedLang} />

        {/* hreflang alternates are injected imperatively via useHreflangAlternates
            (see the hook above for the React 19 rationale) */}

        {/* Additional SEO Tags */}
        <meta
          name="robots"
          content={
            robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
          }
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
            <meta property="article:author" content={article.author || resolvedAuthor} />
            {article.publishedTime && (
              <meta property="article:published_time" content={article.publishedTime} />
            )}
            {article.modifiedTime && (
              <meta property="article:modified_time" content={article.modifiedTime} />
            )}
            {article.section && <meta property="article:section" content={article.section} />}
            {article.tags?.map((tag) => (
              <meta key={tag} property="article:tag" content={tag} />
            ))}
          </>
        )}

        {/* Publication dates for any content */}
        {publishedTime && <meta name="article:published_time" content={publishedTime} />}
        {modifiedTime && <meta name="article:modified_time" content={modifiedTime} />}

        {/* Content language */}
        <meta httpEquiv="content-language" content={resolvedLang} />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteName,
            description: resolvedDescription,
            url: SITE_URL,
            logo: `${SITE_URL}/logo512.png`,
            founder: {
              '@type': 'Person',
              name: t('seo.personName'),
            },
            contactPoint: {
              '@type': 'ContactPoint',
              email: CONTACT_EMAIL,
              telephone: t('contact.info.phone'),
              contactType: t('seo.contactType'),
              availableLanguage: ['Korean', 'English'],
            },
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'KR',
              addressLocality: t('contact.info.address'),
            },
            sameAs: ['https://github.com/researcherhojin'],
            foundingDate: '2022',
            areaServed: t('seo.countryName'),
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
