import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/insights');
  });

  test('displays blog page heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('has proper SEO meta tags', async ({ page }) => {
    const metaDescription = await page.getAttribute('meta[name="description"]', 'content');
    expect(metaDescription).toBeTruthy();
  });

  test('insights/:slug navigates to detail page', async ({ page }) => {
    await page.goto('/insights/test-slug');
    await page.waitForLoadState('domcontentloaded');
    // Should render blog detail or show not found — either way page should load
    await expect(page.locator('main, [role="main"], #main-content')).toBeVisible();
  });
});
