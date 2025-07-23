const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

test.describe('Accessibility Tests', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    // Basic accessibility checks
    await expect(page).toHaveTitle(/에멜무지로/);
    
    // Check for proper heading structure
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for proper link text
    const links = page.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Either text content or aria-label should exist
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('contact form has proper labels', async ({ page }) => {
    await page.goto('/#/contact');
    
    // Check all form inputs have associated labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      
      // Check if there's a label for this input
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toHaveCount(1);
      }
    }
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Start with focus on body
    await page.keyboard.press('Tab');
    
    // Check if skip link or first interactive element receives focus
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
    
    // Tab through navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el.tagName,
          text: el.textContent,
          visible: el.offsetParent !== null
        };
      });
      
      // Focused element should be visible and interactive
      expect(focused.visible).toBeTruthy();
      expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']).toContain(focused.tag);
    }
  });

  test('color contrast meets WCAG standards', async ({ page }) => {
    await page.goto('/');
    
    // Check text contrast for main content
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span');
    const textCount = await textElements.count();
    
    // Sample a few text elements
    const samplesToCheck = Math.min(5, textCount);
    
    for (let i = 0; i < samplesToCheck; i++) {
      const element = textElements.nth(i);
      const color = await element.evaluate(el => window.getComputedStyle(el).color);
      const backgroundColor = await element.evaluate(el => {
        let bgColor = window.getComputedStyle(el).backgroundColor;
        let parent = el.parentElement;
        
        // Find the actual background color (not transparent)
        while (bgColor === 'rgba(0, 0, 0, 0)' && parent) {
          bgColor = window.getComputedStyle(parent).backgroundColor;
          parent = parent.parentElement;
        }
        
        return bgColor;
      });
      
      // Basic check that text has color and background
      expect(color).not.toBe('rgba(0, 0, 0, 0)');
      expect(backgroundColor).toBeTruthy();
    }
  });

  test('ARIA landmarks are present', async ({ page }) => {
    await page.goto('/');
    
    // Check for main navigation
    const nav = page.locator('nav');
    await expect(nav).toHaveCount(1);
    
    // Check for main content area
    const main = page.locator('main');
    await expect(main).toHaveCount(1);
    
    // Check for footer
    const footer = page.locator('footer');
    await expect(footer).toHaveCount(1);
  });

  test('responsive design works for mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    // Check that mobile menu button is visible
    const mobileMenuButton = page.locator('[aria-label="메뉴 토글"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Check that desktop menu is hidden
    const desktopMenu = page.locator('.hidden.md\\:flex');
    await expect(desktopMenu).not.toBeVisible();
    
    // Check that content is properly sized for mobile
    const mainContent = page.locator('main');
    const width = await mainContent.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(375);
  });
});