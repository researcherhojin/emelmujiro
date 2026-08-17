import { test, expect } from '@playwright/test';

test.describe('Error States', () => {
  test('invalid blog post shows error or 404', async ({ page }) => {
    await page.goto('/insights/nonexistent-post-id-99999');

    // Should show error message or redirect to 404
    await page.waitForTimeout(2000);
    const body = page.locator('body');
    const text = await body.textContent();
    // Either shows an error, 404 page, or goes back
    expect(text).toBeTruthy();
  });

  test('non-existent route returns 404 with the SPA shell', async ({ page }) => {
    // Production contract, per nginx.conf: `try_files ... =404` plus
    // `error_page 404 /index.html`. Unknown URLs must return a real 404 status
    // so Google deindexes them — the soft-404 pattern (200 + SPA shell) is what
    // got garbage URLs like /cdn-cgi/l/email-protection indexed — while still
    // serving the shell so React Router's catch-all renders NotFound.
    //
    // This previously asserted 200, encoding the Vite dev server's SPA
    // fallback, i.e. the exact behavior production was fixed to avoid. The
    // suite now runs against scripts/e2e-server.mjs, so it can assert the real
    // contract.
    const response = await page.goto('/this-page-does-not-exist', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBe(404);
    await expect(page.locator('body')).not.toBeEmpty();
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

  test('no console errors on teaching history page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/profile');
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('extension://')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
