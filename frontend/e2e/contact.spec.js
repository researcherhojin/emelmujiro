const { test, expect } = require('@playwright/test');

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/contact');
  });

  test('displays contact form', async ({ page }) => {
    await expect(page.locator('text=프로젝트 문의')).toBeVisible();
    await expect(page.locator('label:has-text("이름")')).toBeVisible();
    await expect(page.locator('label:has-text("이메일")')).toBeVisible();
    await expect(page.locator('label:has-text("연락처")')).toBeVisible();
    await expect(page.locator('label:has-text("회사명")')).toBeVisible();
    await expect(page.locator('label:has-text("프로젝트 유형")')).toBeVisible();
    await expect(page.locator('label:has-text("문의 내용")')).toBeVisible();
  });

  test('fills and submits contact form', async ({ page }) => {
    // Fill form fields
    await page.fill('input[name="name"]', '홍길동');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '010-1234-5678');
    await page.fill('input[name="company"]', '테스트 회사');
    await page.selectOption('select[name="project_type"]', 'ai-consulting');
    await page.fill('textarea[name="message"]', '프로젝트 문의 내용입니다.');

    // Submit form
    await page.click('button:has-text("문의 전송")');

    // Check for success message or form submission
    // Note: Actual behavior depends on backend implementation
  });

  test('validates required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button:has-text("문의 전송")');

    // Check for HTML5 validation messages
    const nameInput = page.locator('input[name="name"]');
    const isInvalid = await nameInput.evaluate(el => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('displays contact information', async ({ page }) => {
    await expect(page.locator('text=연락처 정보')).toBeVisible();
    await expect(page.locator('text=researcherhojin@gmail.com')).toBeVisible();
    await expect(page.locator('text=010-7279-0380')).toBeVisible();
  });

  test('email link works', async ({ page }) => {
    const emailLink = page.locator('a[href="mailto:researcherhojin@gmail.com"]');
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute('href', 'mailto:researcherhojin@gmail.com');
  });

  test('phone link works', async ({ page }) => {
    const phoneLink = page.locator('a[href="tel:010-7279-0380"]');
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute('href', 'tel:010-7279-0380');
  });

  test('responsive form on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Check if form is still accessible
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('button:has-text("문의 전송")')).toBeVisible();

    // Check if layout is properly stacked
    const formContainer = page.locator('form').first();
    await expect(formContainer).toBeVisible();
  });
});
