import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/에멜무지로/);
  });

  test('has main heading', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toContainText('AI 교육');
  });

  test('has navigation menu', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav.getByRole('button', { name: '강의이력' }).first()).toBeVisible();
    await expect(nav.getByRole('button', { name: '인사이트' }).first()).toBeVisible();
    await expect(nav.getByRole('button', { name: '문의하기' }).first()).toBeVisible();
  });

  test('hero section has CTA link', async ({ page }) => {
    const ctaLink = page.locator('a[href="/contact"]').first();
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toContainText('무료 상담 신청');
  });

  test('displays feature sections', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));

    const featureSection = page
      .locator('section')
      .filter({ hasText: /AI|교육|컨설팅/i });
    await expect(featureSection.first()).toBeVisible();
  });

  test('footer contains company information', async ({ page }) => {
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight)
    );

    const footer = page.locator('footer');
    await expect(footer).toContainText('에멜무지로');

    const currentYear = new Date().getFullYear().toString();
    await expect(footer).toContainText(`© ${currentYear}`);
  });

  test('navigation links work correctly', async ({ page }) => {
    const nav = page.locator('nav');
    await nav.getByRole('button', { name: '강의이력' }).first().click();
    await expect(page).toHaveURL(/\/profile/);

    await nav.getByRole('button', { name: '인사이트' }).first().click();
    await expect(page).toHaveURL(/\/insights/);

    await nav.getByRole('button', { name: '문의하기' }).first().click();
    await expect(page).toHaveURL(/\/contact/);

    await page.getByText('에멜무지로').first().click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('responsive menu works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const menuButton = page.getByRole('button', { name: '메뉴' });
    await expect(menuButton).toBeVisible({ timeout: 10000 });

    await menuButton.click();

    await expect(page.locator('button').filter({ hasText: '강의이력' }).last()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button').filter({ hasText: '인사이트' }).last()).toBeVisible({ timeout: 5000 });
  });
});
