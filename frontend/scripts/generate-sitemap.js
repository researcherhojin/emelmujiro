const fs = require('fs');
const path = require('path');

// SITE_URL: env override > package.json "homepage". The old hardcoded
// "https://emelmujiro.com" fallback duplicated the homepage field and
// silently drifted if either changed. Trailing slash is stripped so
// `${SITE_URL}${prefix}${urlPath}` below can't accidentally produce
// `https://emelmujiro.com//en/profile`.
const pkg = require('../package.json');
const SITE_URL = (process.env.SITE_URL || pkg.homepage || '').replace(/\/+$/, '');
const API_URL = process.env.API_URL || 'https://api.emelmujiro.com/api';
const LANGUAGES = ['ko', 'en'];
const DEFAULT_LANG = 'ko';
const OUTPUT_DIR = path.join(__dirname, '../public');

if (!SITE_URL) {
  console.error('❌ SITE_URL missing: set SITE_URL env var or package.json "homepage" field');
  process.exit(1);
}

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

// Must equal max_page_size in backend/api/pagination.py: DRF silently caps a
// larger page_size, which is how the old `?page_size=500` would have dropped
// every post past the 100th without a warning.
const PAGE_SIZE = 100;

/**
 * Fetch published blog posts from the backend so dynamic /insights/:slug
 * URLs can be included in the sitemap. Walks every page by number against
 * API_URL (rather than trusting `next`) and requires the total to equal the
 * API's `count`. Fails soft: if the backend is unreachable (build on a dev
 * machine, API down, etc.) or any page fails, logs a warning and returns []
 * so the sitemap generates with static routes only — never a truncated list.
 */
async function fetchBlogPosts() {
  try {
    const all = [];
    let count = Infinity;
    for (let page = 1; all.length < count; page++) {
      const res = await fetch(`${API_URL}/blog-posts/?page=${page}&page_size=${PAGE_SIZE}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`);
      const data = await res.json();
      count = data.count;
      const results = data.results || [];
      if (!Number.isInteger(count)) throw new Error('response has no integer count');
      if (results.length === 0 && all.length < count) {
        throw new Error(`page ${page} empty with ${all.length}/${count} fetched`);
      }
      all.push(...results);
    }
    if (all.length !== count) throw new Error(`fetched ${all.length} posts, API count ${count}`);
    const posts = all.filter((p) => p.is_published);
    console.log(`   Fetched ${posts.length} published blog post(s) from ${API_URL}`);
    return posts;
  } catch (err) {
    console.warn(
      `⚠️  Blog post fetch failed (${err.message}) — sitemap will include static routes only`
    );
    return [];
  }
}

/**
 * Generate sitemap.xml with bilingual hreflang links, including dynamic
 * /insights/:slug entries fetched from the backend.
 */
const generateSitemap = async () => {
  const urlEntries = [];

  // Static routes
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

  // Dynamic blog posts: Korean URL only, no hreflang. Posts have no English
  // translation, so /en/insights/:slug renders the same Korean body and
  // canonicalizes to the Korean URL (SEOHelmet `translated={false}` in
  // BlogDetail.tsx). Re-enable the en entry and its hreflang links together
  // with that prop once a post has a real translation.
  // lastmod is updated_at, not the author-chosen `date`: views and likes are
  // written with .update(F(...)), which leaves auto_now untouched, so it moves
  // only on an edit or a publish toggle.
  const posts = await fetchBlogPosts();
  for (const post of posts) {
    urlEntries.push(`  <url>
    <loc>${buildLangUrl(`/insights/${post.slug}`, DEFAULT_LANG)}</loc>
    <lastmod>${post.updated_at || post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);
  }

  return {
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries.join('\n')}
</urlset>`,
    postCount: posts.length,
  };
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

// sitemap-index.xml was removed: a sitemap index is only useful for multi-
// sitemap setups (>50k URLs or grouped sitemaps). A single sitemap.xml with
// <50k URLs needs no index. robots.txt's `Sitemap:` directive already points
// Googlebot at sitemap.xml directly.

const main = async () => {
  try {
    const sitemap = await generateSitemap();

    const files = [
      { name: 'sitemap.xml', content: sitemap.xml },
      { name: 'robots.txt', content: generateRobotsTxt() },
    ];

    for (const { name, content } of files) {
      const filePath = path.join(OUTPUT_DIR, name);
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${name}`);
    }

    // Remove stale sitemap-index.xml from prior builds. Idempotent — no-op
    // if file doesn't exist.
    const staleIndex = path.join(OUTPUT_DIR, 'sitemap-index.xml');
    if (fs.existsSync(staleIndex)) {
      fs.unlinkSync(staleIndex);
      console.log(`🗑  removed stale sitemap-index.xml`);
    }

    const staticUrls = staticRoutes.length * LANGUAGES.length;
    console.log(
      `\n📊 ${staticRoutes.length} static × ${LANGUAGES.length} langs (${staticUrls}) ` +
        `+ ${sitemap.postCount} blog × 1 lang (ko only, untranslated) = ` +
        `${staticUrls + sitemap.postCount} URLs`
    );
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { generateSitemap, generateRobotsTxt, staticRoutes, LANGUAGES, DEFAULT_LANG };
