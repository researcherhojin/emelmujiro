import { test, expect } from '@playwright/test';

test.describe('Contact Page (Google Form)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('displays contact page heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('displays Google Form iframe', async ({ page }) => {
    const iframe = page.locator('iframe[src*="docs.google.com/forms"]');
    await expect(iframe).toBeVisible();
  });

  test('has open in new tab link', async ({ page }) => {
    const link = page.locator('a[href*="docs.google.com/forms"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('displays contact info sidebar', async ({ page }) => {
    // ContactInfo renders email and other contact details
    await expect(page.getByText(/researcherhojin@gmail\.com/)).toBeVisible();
  });
});
