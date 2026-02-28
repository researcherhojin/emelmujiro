import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/');
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
    await expect(page.getByRole('button', { name: '소개' })).toBeVisible();
    await expect(page.getByRole('button', { name: '블로그' })).toBeVisible();
    await expect(page.getByRole('button', { name: '프로필' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: '문의하기' })
    ).toBeVisible();
  });

  test('hero section has CTA link', async ({ page }) => {
    const ctaLink = page.locator('a[href="#/contact"]').first();
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
    await page.getByRole('button', { name: '소개' }).click();
    await expect(page).toHaveURL(/#\/about/);

    await page.getByRole('button', { name: '블로그' }).click();
    await expect(page).toHaveURL(/#\/blog/);

    await page.getByRole('button', { name: '문의하기' }).click();
    await expect(page).toHaveURL(/#\/contact/);

    await page.getByText('에멜무지로').first().click();
    await expect(page).toHaveURL(/\/#\//);
  });

  test('responsive menu works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByRole('button', { name: '메뉴' });
    await expect(menuButton).toBeVisible();

    await menuButton.click();

    // Mobile menu items should become visible
    await expect(page.getByText('소개')).toBeVisible();
    await expect(page.getByText('블로그')).toBeVisible();
  });
});
