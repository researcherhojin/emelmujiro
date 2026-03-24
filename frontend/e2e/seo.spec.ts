import { test, expect } from '@playwright/test';

const routes = ['/', '/about', '/contact', '/profile', '/blog'];

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
