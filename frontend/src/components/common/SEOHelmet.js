import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHelmet = ({ 
    title = '에멜무지로', 
    description = 'AI 기술의 대중화를 선도하는 전문 컨설팅 기업',
    keywords = 'AI 컨설팅, 머신러닝, 딥러닝, LLM, 기업 교육, AI 솔루션',
    author = '에멜무지로',
    image = '/og-image.jpg',
    url = 'https://researcherhojin.github.io/emelmujiro',
    type = 'website'
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
                <meta name="robots" content="index, follow" />
                <meta name="googlebot" content="index, follow" />
                
                {/* Schema.org JSON-LD */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "에멜무지로",
                        "description": description,
                        "url": "https://researcherhojin.github.io/emelmujiro",
                        "logo": "https://researcherhojin.github.io/emelmujiro/logo512.png",
                        "founder": {
                            "@type": "Person",
                            "name": "이호진"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "email": "researcherhojin@gmail.com",
                            "contactType": "customer service",
                            "availableLanguage": ["Korean", "English"]
                        },
                        "sameAs": [
                            // Add social media URLs here when available
                        ]
                    })}
                </script>
            </Helmet>
    );
};

export default React.memo(SEOHelmet);