import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('has page heading', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('displays section content on scroll', async ({ page }) => {
    // Scroll down to reveal sections
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);

    // At least one section should be visible after scroll
    const sections = page.locator('section');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('CTA links point to /contact', async ({ page }) => {
    const ctaLinks = page.locator('a[href*="/contact"]');
    const count = await ctaLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('has SEO meta tags', async ({ page }) => {
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
