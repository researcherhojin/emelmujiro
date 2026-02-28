import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/contact');
  });

  test('displays contact preparing page', async ({ page }) => {
    // Contact is currently a "coming soon" placeholder page
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('문의');
    await expect(heading).toContainText('준비 중');
  });

  test('displays email contact information', async ({ page }) => {
    const emailLink = page.getByRole('link', {
      name: /researcherhojin@gmail\.com/,
    });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute('href', /^mailto:/);
  });

  test('has description text', async ({ page }) => {
    await expect(
      page.getByText(/이메일로 직접 문의/)
    ).toBeVisible();
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
});
