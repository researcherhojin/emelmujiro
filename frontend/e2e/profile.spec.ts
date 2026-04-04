import { test, expect } from '@playwright/test';

test.describe('Teaching History Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('displays page title and subtitle', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('TEACHING HISTORY')).toBeVisible();
  });

  test('displays year sections with teaching entries', async ({ page }) => {
    // Year headings should be visible
    await expect(page.getByRole('heading', { name: '2026' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '2025' })).toBeVisible();
  });

  test('displays back to main button', async ({ page }) => {
    const backButton = page.locator('button', { hasText: '←' });
    await expect(backButton).toBeVisible();
  });

  test('has proper SEO meta tags', async ({ page }) => {
    const metaDescription = await page.getAttribute(
      'meta[name="description"]',
      'content'
    );
    expect(metaDescription).toBeTruthy();
  });

  test('is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });
});
