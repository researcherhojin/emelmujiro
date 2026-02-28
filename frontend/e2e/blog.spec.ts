import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/blog');
  });

  test('displays blog preparing page', async ({ page }) => {
    // Blog is currently a "coming soon" placeholder page
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('준비 중');
  });

  test('has back to main button', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /메인으로 돌아가기/ });
    await expect(backButton).toBeVisible();
  });

  test('back button navigates to home', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /메인으로 돌아가기/ });
    await backButton.click();
    await expect(page).toHaveURL(/\/#\//);
  });

  test('displays description text', async ({ page }) => {
    await expect(
      page.getByText(/콘텐츠|준비하고 있/i)
    ).toBeVisible();
  });
});
