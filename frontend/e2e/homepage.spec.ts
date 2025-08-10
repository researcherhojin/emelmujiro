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
    await expect(heading).toContainText('AI 교육의 미래');
  });

  test('has navigation menu', async ({ page }) => {
    // Check main navigation items
    await expect(page.getByRole('link', { name: '홈' })).toBeVisible();
    await expect(page.getByRole('link', { name: '소개' })).toBeVisible();
    await expect(page.getByRole('link', { name: '블로그' })).toBeVisible();
    await expect(page.getByRole('link', { name: '문의' })).toBeVisible();
  });

  test('hero section has CTA buttons', async ({ page }) => {
    const heroSection = page.locator('section').first();

    // Check for CTA buttons
    const ctaButton = heroSection.getByRole('link', { name: /시작하기|자세히 보기/i });
    await expect(ctaButton).toBeVisible();
  });

  test('displays feature sections', async ({ page }) => {
    // Scroll to features section
    await page.evaluate(() => window.scrollTo(0, 500));

    // Check for feature cards
    const featureSection = page.locator('section').filter({ hasText: /AI 교육|컨설팅|솔루션/i });
    await expect(featureSection).toBeVisible();
  });

  test('footer contains company information', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footer = page.locator('footer');
    await expect(footer).toContainText('에멜무지로');
    await expect(footer).toContainText('© 2025');
  });

  test('navigation links work correctly', async ({ page }) => {
    // Test About page navigation
    await page.click('text=소개');
    await expect(page).toHaveURL(/#\/about/);

    // Test Blog page navigation
    await page.click('text=블로그');
    await expect(page).toHaveURL(/#\/blog/);

    // Test Contact page navigation
    await page.click('text=문의');
    await expect(page).toHaveURL(/#\/contact/);

    // Test home navigation
    await page.click('text=홈');
    await expect(page).toHaveURL('/#/');
  });

  test('responsive menu works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if hamburger menu is visible
    const menuButton = page.getByRole('button', { name: /menu|메뉴/i });
    await expect(menuButton).toBeVisible();

    // Click menu button
    await menuButton.click();

    // Check if mobile menu is visible
    const mobileMenu = page.locator('[role="navigation"]');
    await expect(mobileMenu).toBeVisible();
  });
});
