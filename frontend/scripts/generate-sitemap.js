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
 * API's `count`. Fail the build on an unavailable or inconsistent inventory:
 * publishing a static-only sitemap would silently withdraw every article URL.
 */
async function fetchBlogPosts() {
  const all = [];
  const slugs = new Set();
  let count;
  for (let page = 1; count === undefined || all.length < count; page++) {
    const res = await fetch(`${API_URL}/blog-posts/?page=${page}&page_size=${PAGE_SIZE}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`);
    const data = await res.json();
    if (!Number.isInteger(data.count) || data.count < 0 || !Array.isArray(data.results)) {
      throw new Error(`Invalid article inventory on page ${page}`);
    }
    if (count !== undefined && data.count !== count) {
      throw new Error(`Article count changed during pagination: ${count} to ${data.count}`);
    }
    count = data.count;
    if (data.results.length === 0 && all.length < count) {
      throw new Error(`Page ${page} empty with ${all.length}/${count} fetched`);
    }
    for (const post of data.results) {
      if (!post || typeof post.slug !== 'string' || !post.slug || slugs.has(post.slug)) {
        throw new Error(`Missing or duplicate article slug on page ${page}`);
      }
      slugs.add(post.slug);
      all.push(post);
    }
  }
  if (all.length !== count) throw new Error(`Fetched ${all.length} posts, API count ${count}`);
  const posts = all.filter((p) => p.is_published);
  console.log(`   Fetched ${posts.length} published blog post(s) from ${API_URL}`);
  return posts;
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

  // Dynamic blog posts. A translated post (the API's is_translated, true only
  // when title_en, description_en and content_html_en are all filled) lists
  // both URLs with hreflang, like a static route. An untranslated one lists
  // the Korean URL only: /en/insights/:slug shows the Korean body and
  // canonicalizes to it (SEOHelmet `translated` in BlogDetail.tsx follows the
  // same flag). A missing flag — an API older than the field — counts as
  // untranslated.
  // lastmod is updated_at, not the author-chosen `date`: views and likes are
  // written with .update(F(...)), which leaves auto_now untouched, so it moves
  // only on an edit or a publish toggle.
  const posts = await fetchBlogPosts();
  let translatedCount = 0;
  for (const post of posts) {
    const routeUrl = `/insights/${post.slug}`;
    const translated = post.is_translated === true;
    if (translated) translatedCount++;
    for (const lang of translated ? LANGUAGES : [DEFAULT_LANG]) {
      urlEntries.push(`  <url>
    <loc>${buildLangUrl(routeUrl, lang)}</loc>
    <lastmod>${post.updated_at || post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>${translated ? `\n${generateHreflangLinks(routeUrl)}` : ''}
  </url>`);
    }
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
    translatedCount,
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
    const blogUrls = sitemap.postCount + sitemap.translatedCount;
    console.log(
      `\n📊 ${staticRoutes.length} static × ${LANGUAGES.length} langs (${staticUrls}) ` +
        `+ ${sitemap.postCount} blog (${sitemap.translatedCount} translated, ko+en) (${blogUrls}) = ` +
        `${staticUrls + blogUrls} URLs`
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
