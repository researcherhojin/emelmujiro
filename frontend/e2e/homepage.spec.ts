import { test, expect } from '@playwright/test';
import { openNav, swipeHorizontal } from './helpers';

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

  test('has navigation menu', async ({ page, isMobile }) => {
    const nav = await openNav(page, isMobile);
    await expect(nav.getByRole('button', { name: '강의이력' })).toBeVisible();
    await expect(nav.getByRole('button', { name: '인사이트' })).toBeVisible();
    await expect(nav.getByRole('button', { name: '문의하기' })).toBeVisible();
  });

  test('hero section has CTA link', async ({ page }) => {
    const ctaLink = page.locator('a[href="/contact"]').first();
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toContainText('무료 상담 신청');
  });

  test('displays feature sections', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));

    const featureSection = page.locator('section').filter({ hasText: /AI|교육|컨설팅/i });
    await expect(featureSection.first()).toBeVisible();
  });

  test('footer contains company information', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footer = page.locator('footer');
    await expect(footer).toContainText('에멜무지로');

    const currentYear = new Date().getFullYear().toString();
    await expect(footer).toContainText(`© ${currentYear}`);
  });

  test('navigation links work correctly', async ({ page, isMobile }) => {
    for (const [label, url] of [
      ['강의이력', /\/profile/],
      ['인사이트', /\/insights/],
      ['문의하기', /\/contact/],
    ] as const) {
      const nav = await openNav(page, isMobile);
      await nav.getByRole('button', { name: label }).click();
      await expect(page).toHaveURL(url);
    }

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

    await expect(page.locator('button').filter({ hasText: '강의이력' }).last()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('button').filter({ hasText: '인사이트' }).last()).toBeVisible({
      timeout: 5000,
    });
  });

  test('service modal navigates by horizontal scroll', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Wheel is the desktop affordance; touch devices swipe instead');

    await page.getByRole('button', { name: /AI 교육 & 강의/ }).click();

    const panel = page.getByTestId('service-modal-panel');
    await expect(panel).toContainText('AI 교육 & 강의');

    // Horizontal wheel is the sideways affordance on desktop alongside the arrows
    await panel.hover();
    await page.mouse.wheel(60, 0);
    await expect(panel).toContainText('AI 컨설팅');

    // The momentum-tail cooldown swallows anything sooner than 400ms
    await page.waitForTimeout(500);
    await page.mouse.wheel(-60, 0);
    await expect(panel).toContainText('AI 교육 & 강의');
  });

  test('service modal navigates by swipe on touch devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Touch events require a touch-enabled context');

    await page.getByRole('button', { name: /AI 교육 & 강의/ }).click();

    const panel = page.getByTestId('service-modal-panel');
    await expect(panel).toContainText('AI 교육 & 강의');

    // Swipe left — mobile hides the arrows, so this is the only way forward
    await swipeHorizontal(panel, -120);
    await expect(panel).toContainText('AI 컨설팅');

    // And back the other way
    await swipeHorizontal(panel, 120);
    await expect(panel).toContainText('AI 교육 & 강의');
  });
});
