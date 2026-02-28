import { test, expect } from '@playwright/test';

test.describe('Blog (Under Construction)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/blog');
  });

  test('displays under construction page', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('공사 중');
  });

  test('displays blog feature description', async ({ page }) => {
    await expect(
      page.getByText(/블로그를 준비 중|AI 트렌드/)
    ).toBeVisible();
  });

  test('displays coming soon message', async ({ page }) => {
    await expect(
      page.getByText(/빠른 시일 내에 오픈/)
    ).toBeVisible();
  });

  test('has home button that navigates to home', async ({ page }) => {
    const homeButton = page.getByRole('button', { name: /홈으로 이동/ });
    await expect(homeButton).toBeVisible();
    await homeButton.click();
    await expect(page).toHaveURL(/\/#\//);
  });

  test('has go back button', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /이전 페이지로/ });
    await expect(backButton).toBeVisible();
  });

  test('blog/:id also shows under construction', async ({ page }) => {
    await page.goto('/#/blog/some-post');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText('공사 중');
  });
});
