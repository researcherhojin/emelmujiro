const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://emelmujiro.com';
const LANGUAGES = ['ko', 'en'];

// Define all static routes (BrowserRouter — clean URLs)
const staticRoutes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/contact', changefreq: 'weekly', priority: 0.7 },
  { url: '/insights', changefreq: 'daily', priority: 0.8 },
  { url: '/profile', changefreq: 'weekly', priority: 0.6 },
];

/**
 * Build the full URL for a route in a given language.
 * Korean (default): no prefix. English: /en prefix.
 */
function buildLangUrl(routeUrl, lang) {
  const prefix = lang === 'ko' ? '' : `/${lang}`;
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
  // x-default points to Korean (default language)
  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildLangUrl(routeUrl, 'ko')}" />`
  );
  return links.join('\n');
}

// Generate sitemap XML with bilingual hreflang links
const generateSitemap = () => {
  // Generate URL entries for each language
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

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries.join('\n')}
</urlset>`;

  return sitemap;
};

// Generate robots.txt
const generateRobotsTxt = () => {
  const robotsTxt = `# Robots.txt for Emelmujiro
# https://emelmujiro.com

User-agent: *
Allow: /
Crawl-delay: 1

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Specific rules for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1`;

  return robotsTxt;
};

// Main function
const main = () => {
  try {
    // Generate sitemap
    const sitemap = generateSitemap();
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    console.log('✅ Sitemap generated successfully at:', sitemapPath);

    // Generate robots.txt
    const robotsTxt = generateRobotsTxt();
    const robotsPath = path.join(__dirname, '../public/robots.txt');
    fs.writeFileSync(robotsPath, robotsTxt);
    console.log('✅ Robots.txt generated successfully at:', robotsPath);

    // Generate sitemap index for large sites (future-proofing)
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

    const sitemapIndexPath = path.join(
      __dirname,
      '../public/sitemap-index.xml'
    );
    fs.writeFileSync(sitemapIndexPath, sitemapIndex);
    console.log(
      '✅ Sitemap index generated successfully at:',
      sitemapIndexPath
    );

    // Log statistics
    const totalUrls = staticRoutes.length * LANGUAGES.length;
    console.log(`\n📊 Statistics:`);
    console.log(`   - Static routes: ${staticRoutes.length}`);
    console.log(`   - Languages: ${LANGUAGES.join(', ')}`);
    console.log(`   - Total URLs: ${totalUrls}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateSitemap, generateRobotsTxt, staticRoutes, LANGUAGES };
