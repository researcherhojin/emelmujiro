import { test, expect } from '@playwright/test';

// Must stay in sync with `staticRoutes` in scripts/generate-sitemap.js — the
// array that feeds both sitemap.xml and the prerender pass. `/privacy` was
// prerendered but absent here until 2026-08-18, so one of the five prerendered
// documents went unchecked for title / description / canonical / duplicate head
// tags. `npm run check:routes` (scripts/check-route-lists.js) now compares this
// array against staticRoutes, App.tsx and lighthouserc.js in CI, so a route
// added to one list and not this one fails rather than going unchecked.
const routes = ['/', '/contact', '/profile', '/insights', '/privacy'];

test.describe('SEO', () => {
  for (const route of routes) {
    test(`${route} has title`, async ({ page }) => {
      // Use networkidle to ensure lazy-loaded SEOHelmet has rendered
      await page.goto(route, { waitUntil: 'networkidle' });
      // Playwright's toHaveTitle auto-waits for the condition
      await expect(page).toHaveTitle(/.+/, { timeout: 15000 });
    });

    test(`${route} has meta description`, async ({ page }) => {
      await page.goto(route);
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute('content', /.+/);
    });

    test(`${route} has canonical link`, async ({ page }) => {
      await page.goto(route);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute('href', /emelmujiro\.com/);
    });

    test(`${route} has exactly one of each SEO tag`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' });

      // Guards the duplicate-head-tag class of bug. Against the prerendered
      // build the served HTML already carries these tags, and because main.tsx
      // uses createRoot() rather than hydrateRoot() React cannot claim them —
      // SEOHelmet's cleanup effect is what keeps the count at one. Against the
      // dev server there is nothing prerendered to collide with, so here it
      // guards the other direction: a second SEOHelmet mounting per route.
      await expect(page.locator('head title')).toHaveCount(1);
      await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
      await expect(page.locator('head meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('head meta[property="og:url"]')).toHaveCount(1);
      await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
    });
  }

  test('homepage has OG tags', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /.+/);
  });

  test('homepage has structured data', async ({ page }) => {
    await page.goto('/');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThan(0);
  });

  test('html lang attribute is set', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', /ko|en/);
  });
});

// Routes prerender skips are served build/app.html — the pristine Vite shell —
// not build/index.html, which prerender overwrites with the homepage snapshot.
// Until 2026-09-24 the fallback WAS that snapshot, so every /insights/:slug and
// /login shipped the homepage's title, canonical and robots in its raw HTML and
// only JS corrected them; Google's JavaScript SEO guidance requires a JS-set
// canonical to equal the original HTML's. These use `request`, not `page`, so
// they read the bytes a crawler gets before any script runs.
test.describe('SPA-fallback document', () => {
  for (const route of ['/insights/some-post-slug', '/en/insights/some-post-slug', '/login']) {
    test(`${route} raw HTML carries no prerendered SEO tags`, async ({ request }) => {
      const response = await request.get(route);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).not.toContain('data-prerendered-seo');
      expect(html).not.toContain('rel="canonical"');
      expect(html).not.toContain('<title');
    });
  }

  test('/profile raw HTML still carries its own prerendered canonical (control)', async ({
    request,
  }) => {
    const html = await (await request.get('/profile')).text();
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/emelmujiro\.com\/profile"/);
    expect(html).toContain('data-prerendered-seo');
  });

  test('/app.html is not reachable directly (nginx `internal`)', async ({ request }) => {
    const response = await request.get('/app.html');
    expect(response.status()).toBe(404);
  });
});
