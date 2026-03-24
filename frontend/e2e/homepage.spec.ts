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
    await expect(heading).toContainText('실무에 강한');
    await expect(heading).toContainText('AI 전문가 그룹');
  });

  test('has navigation menu', async ({ page }) => {
    // Use .first() to avoid strict mode violations from desktop/mobile nav duplicates
    const nav = page.locator('nav');
    await expect(nav.getByRole('button', { name: '소개' }).first()).toBeVisible();
    await expect(nav.getByRole('button', { name: '블로그' }).first()).toBeVisible();
    await expect(nav.getByRole('button', { name: '프로필' }).first()).toBeVisible();
    await expect(nav.getByRole('button', { name: '문의하기' }).first()).toBeVisible();
  });

  test('hero section has CTA link', async ({ page }) => {
    const ctaLink = page.locator('a[href="/contact"]').first();
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toContainText('프로젝트 문의하기');
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
    await nav.getByRole('button', { name: '소개' }).first().click();
    await expect(page).toHaveURL(/\/about/);

    await nav.getByRole('button', { name: '블로그' }).first().click();
    await expect(page).toHaveURL(/\/blog/);

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

    // Mobile menu items are conditionally rendered when isOpen=true.
    // Desktop nav items (inside "hidden md:flex") are display:none on mobile,
    // so we select buttons with matching text that are actually visible.
    // The mobile menu buttons are the last matching elements in DOM order.
    await expect(page.locator('button').filter({ hasText: '소개' }).last()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button').filter({ hasText: '블로그' }).last()).toBeVisible({ timeout: 5000 });
  });
});
