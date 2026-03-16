const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://researcherhojin.github.io/emelmujiro';

// Define all static routes with hash fragments (HashRouter)
const staticRoutes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/#/about', changefreq: 'weekly', priority: 0.8 },
  { url: '/#/contact', changefreq: 'weekly', priority: 0.7 },
  { url: '/#/blog', changefreq: 'daily', priority: 0.8 },
  { url: '/#/profile', changefreq: 'weekly', priority: 0.6 },
  { url: '/#/share', changefreq: 'monthly', priority: 0.5 },
];

// Generate sitemap XML
const generateSitemap = () => {
  const allRoutes = [...staticRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
    ${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return sitemap;
};

// Generate robots.txt
// Note: Hash fragments (#) are not standardized in robots.txt directives.
// Since this is a HashRouter SPA, crawlers that don't execute JS won't
// discover sub-pages anyway. Keep robots.txt simple with just Allow: /
// and the sitemap reference.
const generateRobotsTxt = () => {
  const robotsTxt = `# Robots.txt for Emelmujiro
# https://researcherhojin.github.io/emelmujiro

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
    console.log(`\n📊 Statistics:`);
    console.log(`   - Static routes: ${staticRoutes.length}`);
    console.log(`   - Total URLs: ${staticRoutes.length}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateSitemap, generateRobotsTxt };
