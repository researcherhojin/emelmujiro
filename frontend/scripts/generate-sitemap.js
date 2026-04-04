const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://emelmujiro.com';
const LANGUAGES = ['ko', 'en'];
const DEFAULT_LANG = 'ko';
const OUTPUT_DIR = path.join(__dirname, '../public');

// Static routes — must match pageRoutes in App.tsx (excluding dynamic/auth routes)
const staticRoutes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/insights', changefreq: 'daily', priority: 0.8 },
  { url: '/contact', changefreq: 'weekly', priority: 0.7 },
  { url: '/profile', changefreq: 'weekly', priority: 0.6 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
];

/**
 * Build the full URL for a route in a given language.
 * Korean (default): no prefix. English: /en prefix.
 */
function buildLangUrl(routeUrl, lang) {
  const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
  const urlPath = routeUrl === '/' ? '' : routeUrl;
  return `${SITE_URL}${prefix}${urlPath}`;
}

/**
 * Generate xhtml:link hreflang alternates for a route.
 */
function generateHreflangLinks(routeUrl) {
  const links = LANGUAGES.map(
    (lang) =>
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${buildLangUrl(routeUrl, lang)}" />`
  );
  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildLangUrl(routeUrl, DEFAULT_LANG)}" />`
  );
  return links.join('\n');
}

/**
 * Generate sitemap.xml with bilingual hreflang links.
 */
const generateSitemap = () => {
  const urlEntries = [];

  for (const route of staticRoutes) {
    for (const lang of LANGUAGES) {
      urlEntries.push(`  <url>
    <loc>${buildLangUrl(route.url, lang)}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
${generateHreflangLinks(route.url)}
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries.join('\n')}
</urlset>`;
};

/**
 * Generate robots.txt.
 * - /cdn-cgi/ blocked: Cloudflare injects email obfuscation URLs that cause 404 in GSC
 * - Crawl-delay omitted for Googlebot (not supported, use GSC crawl rate instead)
 */
const generateRobotsTxt = () => {
  return `# Robots.txt for Emelmujiro
# ${SITE_URL}

User-agent: *
Allow: /
Disallow: /cdn-cgi/
Crawl-delay: 1

Sitemap: ${SITE_URL}/sitemap.xml

# Googlebot ignores Crawl-delay — configure crawl rate in Google Search Console
User-agent: Googlebot
Allow: /`;
};

/**
 * Generate sitemap-index.xml.
 */
const generateSitemapIndex = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
};

const main = () => {
  try {
    const files = [
      { name: 'sitemap.xml', content: generateSitemap() },
      { name: 'robots.txt', content: generateRobotsTxt() },
      { name: 'sitemap-index.xml', content: generateSitemapIndex() },
    ];

    for (const { name, content } of files) {
      const filePath = path.join(OUTPUT_DIR, name);
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${name}`);
    }

    const totalUrls = staticRoutes.length * LANGUAGES.length;
    console.log(`\n📊 ${staticRoutes.length} routes × ${LANGUAGES.length} languages = ${totalUrls} URLs`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { generateSitemap, generateRobotsTxt, staticRoutes, LANGUAGES, DEFAULT_LANG };
