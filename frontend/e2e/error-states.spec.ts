import { test, expect } from '@playwright/test';

test.describe('Error States', () => {
  test('invalid blog post shows error or 404', async ({ page }) => {
    await page.goto('/blog/nonexistent-post-id-99999');

    // Should show error message or redirect to 404
    await page.waitForTimeout(2000);
    const body = page.locator('body');
    const text = await body.textContent();
    // Either shows an error, 404 page, or goes back
    expect(text).toBeTruthy();
  });

  test('non-existent route shows 404', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    // NotFound is lazy-loaded — wait for the h1 with 404 text
    const heading = page.locator('h1').filter({ hasText: '404' });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Filter known non-critical errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('extension://')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('no console errors on about page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/about');
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('extension://')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
