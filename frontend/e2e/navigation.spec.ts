import { test, expect } from '@playwright/test';
import { NAV_LABELS, openNav } from './helpers';

test.describe('Navigation', () => {
  test('full navigation flow across pages', async ({ page, isMobile }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);

    for (const [label, url] of [
      [NAV_LABELS.ko.profile, /\/profile/],
      [NAV_LABELS.ko.blog, /\/insights/],
      [NAV_LABELS.ko.contact, /\/contact/],
    ] as const) {
      const nav = await openNav(page, isMobile);
      await nav.getByRole('button', { name: label }).click();
      await expect(page).toHaveURL(url);
    }

    // Navigate back to Home via logo
    await page.getByText('에멜무지로').first().click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('English prefix routes work', async ({ page }) => {
    await page.goto('/en/profile');
    await expect(page).toHaveURL(/\/en\/profile/);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('404 page for invalid routes', async ({ page }) => {
    await page.goto('/en/this-page-does-not-exist');

    const body = page.locator('body');
    await expect(body).toContainText(/404|찾을 수 없|not found/i);
  });

  test('back button works', async ({ page, isMobile }) => {
    await page.goto('/');
    const nav = await openNav(page, isMobile);
    await nav.getByRole('button', { name: NAV_LABELS.ko.profile }).click();
    await expect(page).toHaveURL(/\/profile/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });

  test('mobile hamburger menu navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: '메뉴' });
    await menuButton.click();

    // Mobile sheet is rendered inside <nav aria-label="Main navigation">,
    // so the same scoping pattern as the desktop test works here.
    await page
      .getByLabel('Main navigation')
      .getByRole('button', { name: '강의이력', exact: true })
      .click();
    await expect(page).toHaveURL(/\/profile/);
  });

  // /blog → /insights redirect is handled by nginx, not testable in Vite preview
});
