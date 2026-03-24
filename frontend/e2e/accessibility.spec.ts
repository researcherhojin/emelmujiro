import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any persisted theme preference before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  test('toggle dark mode adds dark class to html element', async ({ page }) => {
    const html = page.locator('html');

    // Initially should not have dark class (default is light)
    await expect(html).not.toHaveClass(/dark/);

    // Click the dark mode toggle button (aria-label is the Korean translation)
    const darkModeButton = page.getByRole('button', { name: /다크 모드|Dark Mode/i });
    await darkModeButton.first().click();

    // html element should now have the dark class
    await expect(html).toHaveClass(/dark/);
  });

  test('dark mode persists after page reload', async ({ page }) => {
    const html = page.locator('html');

    // Enable dark mode
    const darkModeButton = page.getByRole('button', { name: /다크 모드|Dark Mode/i });
    await darkModeButton.first().click();
    await expect(html).toHaveClass(/dark/);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Dark mode should still be active
    await expect(html).toHaveClass(/dark/);
  });

  test('toggle back to light mode removes dark class', async ({ page }) => {
    const html = page.locator('html');

    // Enable dark mode
    const toggleButton = page.getByRole('button', { name: /다크 모드|Dark Mode/i });
    await toggleButton.first().click();
    await expect(html).toHaveClass(/dark/);

    // The button label changes to "light mode" when in dark mode
    const lightModeButton = page.getByRole('button', { name: /라이트 모드|Light Mode/i });
    await lightModeButton.first().click();

    // Dark class should be removed
    await expect(html).not.toHaveClass(/dark/);
  });

  test('dark mode changes background color', async ({ page }) => {
    // Background is on the wrapper div (.min-h-screen), not <body>
    const lightBgColor = await page.evaluate(() => {
      const wrapper = document.querySelector('.min-h-screen');
      return wrapper ? window.getComputedStyle(wrapper).backgroundColor : '';
    });

    // Enable dark mode
    const darkModeButton = page.getByRole('button', { name: /다크 모드|Dark Mode/i });
    await darkModeButton.first().click();

    // Wait for transition to complete
    await page.waitForTimeout(400);

    // Get the background color in dark mode
    const darkBgColor = await page.evaluate(() => {
      const wrapper = document.querySelector('.min-h-screen');
      return wrapper ? window.getComputedStyle(wrapper).backgroundColor : '';
    });

    // Background colors should be different between light and dark modes
    expect(darkBgColor).not.toBe(lightBgColor);
  });
});

test.describe('Language Switching', () => {
  // Language is determined by URL prefix: / = Korean, /en/ = English.
  // LanguageLayout always overrides i18n based on the URL param.

  test('default language is Korean', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Navbar should display Korean labels
    await expect(page.getByRole('button', { name: '소개' })).toBeVisible();
    await expect(page.getByRole('button', { name: '블로그' })).toBeVisible();
    await expect(page.getByRole('button', { name: '프로필' })).toBeVisible();
    await expect(page.getByRole('button', { name: '문의하기' })).toBeVisible();
  });

  test('switch to English via URL prefix', async ({ page }) => {
    // Navigate to English URL prefix
    await page.goto('/en/');
    await page.waitForLoadState('domcontentloaded');

    // Navbar should now display English labels
    await expect(page.getByRole('button', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Blog' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Contact' })).toBeVisible();
  });

  test('English language persists after reload', async ({ page }) => {
    // Navigate to English URL
    await page.goto('/en/');
    await page.waitForLoadState('domcontentloaded');

    // Verify English is shown
    await expect(page.getByRole('button', { name: 'About' })).toBeVisible();

    // Reload the page (still at /en/)
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // English should still be displayed
    await expect(page.getByRole('button', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Blog' })).toBeVisible();
  });

  test('switch back to Korean', async ({ page }) => {
    // Start with English
    await page.goto('/en/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('button', { name: 'About' })).toBeVisible();

    // Navigate back to Korean (root URL)
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Korean labels should be back
    await expect(page.getByRole('button', { name: '소개' })).toBeVisible();
    await expect(page.getByRole('button', { name: '블로그' })).toBeVisible();
    await expect(page.getByRole('button', { name: '프로필' })).toBeVisible();
    await expect(page.getByRole('button', { name: '문의하기' })).toBeVisible();
  });
});
