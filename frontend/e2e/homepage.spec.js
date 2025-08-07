const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/에멜무지로/);
  });

  test('displays hero section', async ({ page }) => {
    // Updated text to match current hero section
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=AI 교육')).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    // Click on 회사소개
    await page.click('text=회사소개');
    await expect(page).toHaveURL(/#\/about$/);

    // Go back to home
    await page.click('text=에멜무지로');
    await expect(page).toHaveURL(/\/#?$/);

    // Click on 대표 프로필
    await page.click('text=대표 프로필');
    await expect(page).toHaveURL(/#\/profile$/);
  });

  test('contact button navigates to contact page', async ({ page }) => {
    await page.click('text=문의하기');
    await expect(page).toHaveURL(/#\/contact$/);
    // Check for the contact form instead of specific text
    await expect(page.locator('form')).toBeVisible();
  });

  test('displays service cards', async ({ page }) => {
    await expect(page.locator('text=AI 컨설팅')).toBeVisible();
    // Use more specific selector for the service card heading
    await expect(page.locator('h3:has-text("기업 AI 교육")')).toBeVisible();
    await expect(page.locator('text=LLM 솔루션')).toBeVisible();
  });

  test('displays statistics', async ({ page }) => {
    // Use more specific selectors since there are multiple elements with same text
    await expect(page.locator('.text-4xl').filter({ hasText: '1,000+' }).first()).toBeVisible();
    await expect(page.locator('text=교육 수료생')).toBeVisible();
    await expect(page.locator('text=50+')).toBeVisible();
    await expect(page.locator('text=프로젝트 완료')).toBeVisible();
  });

  test('displays partner logos section', async ({ page }) => {
    const logosSection = page.locator('text=함께한 기업 및 기관').first();
    await expect(logosSection).toBeVisible();

    // Check if logos are visible
    const logos = page.locator('img[alt*="로고"]');
    await expect(logos.first()).toBeVisible();
  });

  test('mobile menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Click mobile menu button
    await page.click('[aria-label="메뉴 토글"]');

    // Check if mobile menu is visible
    const mobileMenu = page.locator('.md\\:hidden').filter({ hasText: '회사소개' });
    await expect(mobileMenu).toBeVisible();

    // Click a menu item
    await mobileMenu.locator('text=회사소개').click();
    await expect(page).toHaveURL(/#\/about$/);
  });
});
