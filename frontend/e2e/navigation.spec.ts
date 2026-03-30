import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('full navigation flow across pages', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);

    // Navigate to Teaching History (강의이력)
    await page.getByRole('button', { name: '강의이력' }).click();
    await expect(page).toHaveURL(/\/profile/);

    // Navigate to Insights (인사이트)
    await page.getByRole('button', { name: '인사이트' }).click();
    await expect(page).toHaveURL(/\/insights/);

    // Navigate to Contact
    await page.getByRole('button', { name: '문의하기' }).click();
    await expect(page).toHaveURL(/\/contact/);

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

  test('back button works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '강의이력' }).click();
    await expect(page).toHaveURL(/\/profile/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });

  test('mobile hamburger menu navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: '메뉴' });
    await menuButton.click();

    await page.getByRole('button', { name: '강의이력', exact: true }).click();
    await expect(page).toHaveURL(/\/profile/);
  });

  test('/blog redirects to /insights', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveURL(/\/insights/);
  });
});
