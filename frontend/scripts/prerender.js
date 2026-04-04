/**
 * Prerender static routes using Playwright.
 *
 * After `vite build`, this script:
 * 1. Starts a local static server serving build/
 * 2. For each static route in each language, navigates with Playwright
 * 3. Captures the rendered HTML and writes to build/<route>/index.html
 *
 * Usage: node scripts/prerender.js
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '../build');

// Import shared constants from sitemap generator (single source of truth)
const { staticRoutes, LANGUAGES, DEFAULT_LANG } = require('./generate-sitemap');

/**
 * Start a simple static file server for the build directory.
 * Implements SPA fallback: any path without a file extension returns index.html.
 */
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);

      // SPA fallback: if file doesn't exist and has no extension, serve index.html
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        const ext = path.extname(filePath);
        if (!ext) {
          filePath = path.join(BUILD_DIR, 'index.html');
        }
      }

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.xml': 'application/xml',
        '.txt': 'text/plain',
        '.webmanifest': 'application/manifest+json',
      };

      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });

    // Use port 0 to get a random available port
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

/**
 * Build the URL path for a route in a given language.
 * Korean (default): /contact. English: /en/contact.
 */
function buildRoutePath(routeUrl, lang) {
  const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
  return routeUrl === '/' ? (prefix || '/') : `${prefix}${routeUrl}`;
}

/**
 * Prerender a single route.
 * Returns the captured HTML string.
 */
async function prerenderRoute(page, baseUrl, route) {
  const url = `${baseUrl}${route}`;
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for React to finish rendering (AppLayout sets window.__appLoaded = true)
  await page.waitForFunction(() => window.__appLoaded === true, { timeout: 15000 });

  // Small delay for any pending state updates / animations
  await page.waitForTimeout(500);

  // Mark root element as prerendered so main.tsx uses hydrateRoot
  await page.evaluate(() => {
    const root = document.getElementById('root');
    if (root) root.setAttribute('data-prerendered', 'true');
  });

  // Clean up duplicate tags injected by react-helmet-async alongside static HTML
  await page.evaluate(() => {
    // Keep only the first <title> (Helmet-injected, page-specific one)
    const titles = document.querySelectorAll('title');
    if (titles.length > 1) {
      for (let i = 1; i < titles.length; i++) titles[i].remove();
    }
    // Deduplicate meta tags by name/property (keep last = Helmet version)
    const seen = new Map();
    document.querySelectorAll('meta[name], meta[property]').forEach((el) => {
      const key = el.getAttribute('name') || el.getAttribute('property');
      if (seen.has(key)) seen.get(key).remove();
      seen.set(key, el);
    });
    // Deduplicate canonical links (keep last)
    const canonicals = document.querySelectorAll('link[rel="canonical"]');
    if (canonicals.length > 1) {
      for (let i = 0; i < canonicals.length - 1; i++) canonicals[i].remove();
    }
  });

  // Capture the full rendered HTML
  const html = await page.content();

  return html;
}

/**
 * Write prerendered HTML to the build directory.
 * For '/', overwrites build/index.html.
 * For '/contact', writes to build/contact/index.html.
 * For '/en', writes to build/en/index.html.
 * For '/en/contact', writes to build/en/contact/index.html.
 */
function writePrerenderedHtml(route, html) {
  let outputPath;
  if (route === '/') {
    outputPath = path.join(BUILD_DIR, 'index.html');
  } else {
    const dir = path.join(BUILD_DIR, route);
    fs.mkdirSync(dir, { recursive: true });
    outputPath = path.join(dir, 'index.html');
  }
  fs.writeFileSync(outputPath, html);
  return outputPath;
}

/**
 * Prerender a batch of routes concurrently using a shared browser context.
 * Groups routes by language to share context (same locale/userAgent).
 */
async function prerenderBatch(browser, baseUrl, routes, concurrency = 4) {
  let successCount = 0;
  const errors = [];

  // Group routes by language so each group shares a browser context
  const byLang = {};
  for (const route of routes) {
    (byLang[route.lang] ||= []).push(route);
  }

  for (const [lang, langRoutes] of Object.entries(byLang)) {
    const context = await browser.newContext({
      userAgent: 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      locale: lang === 'en' ? 'en-US' : 'ko-KR',
    });

    // Process routes in chunks of `concurrency`
    for (let i = 0; i < langRoutes.length; i += concurrency) {
      const chunk = langRoutes.slice(i, i + concurrency);
      const results = await Promise.allSettled(
        chunk.map(async (route) => {
          const page = await context.newPage();
          try {
            const html = await prerenderRoute(page, baseUrl, route.path);
            const outputPath = writePrerenderedHtml(route.path, html);
            const sizeKb = (Buffer.byteLength(html) / 1024).toFixed(1);
            console.log(
              `   ✅ [${route.lang}] ${route.path.padEnd(16)} → ${path.relative(BUILD_DIR, outputPath)} (${sizeKb} KB)`
            );
            return true;
          } finally {
            await page.close();
          }
        })
      );

      for (let j = 0; j < results.length; j++) {
        if (results[j].status === 'fulfilled') {
          successCount++;
        } else {
          const route = chunk[j];
          console.error(`   ❌ [${route.lang}] ${route.path.padEnd(16)} → Failed: ${results[j].reason.message}`);
          errors.push(route.path);
        }
      }
    }

    await context.close();
  }

  return { successCount, errors };
}

async function main() {
  // Check that build directory exists
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ Build directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Build the full list of routes to prerender (all languages × all routes)
  const allRoutes = [];
  for (const lang of LANGUAGES) {
    for (const route of staticRoutes) {
      allRoutes.push({
        path: buildRoutePath(route.url, lang),
        lang,
      });
    }
  }

  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`\n🔄 Prerendering ${allRoutes.length} routes (${LANGUAGES.join(', ')})...`);
  console.log(`   Static server on ${baseUrl}\n`);

  const browser = await chromium.launch({ headless: true });

  const { successCount } = await prerenderBatch(browser, baseUrl, allRoutes);

  await browser.close();
  server.close();

  console.log(`\n📊 Prerendered ${successCount}/${allRoutes.length} routes`);

  if (successCount === 0) {
    throw new Error('All routes failed to prerender');
  }

  if (successCount < allRoutes.length) {
    console.warn(`⚠️  ${allRoutes.length - successCount} route(s) failed to prerender`);
  }
}

main().catch((err) => {
  console.error('❌ Prerender failed:', err);
  process.exit(1);
});
