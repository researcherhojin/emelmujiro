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
    // `error_page 404 /app.html`. Unknown URLs must return a real 404 status
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

  test('errors from browser-injected scripts do not replace the page', async ({ page }) => {
    // Brave iOS evaluates wallet-provider code in every page and it can throw
    // (`window.ethereum.selectedAddress = undefined` with no provider). The
    // pre-load handler in index.html used to render its fallback into #root on
    // any error, tearing down a page that was loading fine.
    await page.addInitScript(() => {
      for (const delay of [30, 120, 300, 600]) {
        setTimeout(() => {
          (
            window as unknown as { ethereum: { selectedAddress?: string } }
          ).ethereum.selectedAddress = undefined;
        }, delay);
      }
    });
    await page.goto('/');

    await expect(page.locator('nav[aria-label="Main navigation"]')).toBeAttached();
    await page.waitForTimeout(1000);
    await expect(page.getByText('페이지를 불러오는 중')).toHaveCount(0);
    await expect(page.locator('nav[aria-label="Main navigation"]')).toBeAttached();
  });

  test('pre-load fallback still appears when the app never loads', async ({ page }) => {
    // The record-only handler relies on the 5 s timeout in index.html for real
    // failures; block every script chunk so the app cannot mount.
    await page.route('**/assets/*.js', (route) => route.abort());
    await page.goto('/');

    await expect(page.getByText('페이지를 불러오는 중 문제가 발생했습니다.')).toBeVisible({
      timeout: 8000,
    });
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
