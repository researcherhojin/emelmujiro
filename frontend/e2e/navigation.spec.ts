import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('full navigation flow across pages', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);

    // Navigate to About
    await page.getByRole('button', { name: '소개' }).click();
    await expect(page).toHaveURL(/\/about/);

    // Navigate to Blog
    await page.getByRole('button', { name: '블로그' }).click();
    await expect(page).toHaveURL(/\/blog/);

    // Navigate to Profile
    await page.getByRole('button', { name: '프로필' }).click();
    await expect(page).toHaveURL(/\/profile/);

    // Navigate to Contact
    await page.getByRole('button', { name: '문의하기' }).click();
    await expect(page).toHaveURL(/\/contact/);

    // Navigate back to Home via logo
    await page.getByText('에멜무지로').first().click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('English prefix routes work', async ({ page }) => {
    await page.goto('/en/about');
    await expect(page).toHaveURL(/\/en\/about/);

    // Page should render English content
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('404 page for invalid routes', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // Should show 404 or NotFound content
    const body = page.locator('body');
    await expect(body).toContainText(/404|찾을 수 없|not found/i);
  });

  test('back button works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '소개' }).click();
    await expect(page).toHaveURL(/\/about/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });

  test('mobile hamburger menu navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: '메뉴' });
    await menuButton.click();

    // Navigate via mobile menu
    await page.getByText('소개').click();
    await expect(page).toHaveURL(/\/about/);
  });
});
