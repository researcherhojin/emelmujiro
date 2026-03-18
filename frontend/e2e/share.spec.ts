import { test, expect } from '@playwright/test';

test.describe('Share Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/share');
  });

  test('page renders', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('has page content', async ({ page }) => {
    // Share page should have some content visible
    const main = page.locator('main, [role="main"], #root');
    await expect(main.first()).toBeVisible();
  });
});
