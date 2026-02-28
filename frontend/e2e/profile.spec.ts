import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/profile');
  });

  test('should display profile page correctly', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('이호진');
  });

  test('should display CEO profile badge', async ({ page }) => {
    await expect(page.getByText('CEO PROFILE')).toBeVisible();
  });

  test('should display subtitle', async ({ page }) => {
    await expect(page.getByText('AI Researcher & Educator')).toBeVisible();
  });

  test('should display stats section', async ({ page }) => {
    await expect(page.getByText('완료 프로젝트')).toBeVisible();
    await expect(page.getByText('누적 교육생')).toBeVisible();
    await expect(page.getByText('협력 기업')).toBeVisible();
    await expect(page.getByText('교육 경력')).toBeVisible();
  });

  test('should have career tab active by default', async ({ page }) => {
    const careerTab = page.getByRole('button', { name: /경력/ });
    await expect(careerTab).toBeVisible();

    // Career section heading should be visible by default
    await expect(
      page.getByRole('heading', { name: '경력 사항' })
    ).toBeVisible();
  });

  test('should switch to education tab', async ({ page }) => {
    const educationTab = page.getByRole('button', { name: /학력/ });
    await educationTab.click();

    await expect(
      page.getByRole('heading', { name: '학력 사항' })
    ).toBeVisible();
  });

  test('should switch to projects tab', async ({ page }) => {
    const projectsTab = page.getByRole('button', { name: /프로젝트/ });
    await projectsTab.click();

    await expect(
      page.getByRole('heading', { name: '주요 프로젝트' })
    ).toBeVisible();
  });

  test('should have back to main button', async ({ page }) => {
    const backButton = page.getByText('메인으로 돌아가기');
    await expect(backButton).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('이호진');
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    const metaDescription = await page.getAttribute(
      'meta[name="description"]',
      'content'
    );
    expect(metaDescription).toBeTruthy();
  });

  test('education tab shows certifications', async ({ page }) => {
    const educationTab = page.getByRole('button', { name: /학력/ });
    await educationTab.click();

    await expect(page.getByText('자격 및 인증')).toBeVisible();
  });
});
