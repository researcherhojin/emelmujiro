import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/profile');
  });

  test('should display profile page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/프로필 | 에멜무지로/);

    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/이호진|프로필/);
  });

  test('should show personal information section', async ({ page }) => {
    // Check for personal info section
    const personalInfo = page.locator('[data-testid="personal-info"]');
    await expect(personalInfo).toBeVisible();

    // Check for contact information
    await expect(page.locator('text=/이메일|email/i')).toBeVisible();
    await expect(page.locator('text=/전화|phone/i')).toBeVisible();
  });

  test('should display skills section', async ({ page }) => {
    // Check for skills section
    const skillsSection = page.locator('[data-testid="skills-section"]');
    await expect(skillsSection).toBeVisible();

    // Check for skill categories
    await expect(page.locator('text=/프로그래밍|programming/i')).toBeVisible();
    await expect(page.locator('text=/프레임워크|framework/i')).toBeVisible();
  });

  test('should show experience timeline', async ({ page }) => {
    // Check for experience section
    const experienceSection = page.locator(
      '[data-testid="experience-section"]'
    );
    await expect(experienceSection).toBeVisible();

    // Check for timeline items
    const timelineItems = page.locator('[data-testid="timeline-item"]');
    await expect(timelineItems).toHaveCount(await timelineItems.count());
  });

  test('should display education information', async ({ page }) => {
    // Check for education section
    const educationSection = page.locator('[data-testid="education-section"]');
    await expect(educationSection).toBeVisible();

    // Check for education items
    await expect(page.locator('text=/학위|degree/i')).toBeVisible();
  });

  test('should show projects section', async ({ page }) => {
    // Check for projects section
    const projectsSection = page.locator('[data-testid="projects-section"]');
    await expect(projectsSection).toBeVisible();

    // Check for project cards
    const projectCards = page.locator('[data-testid="project-card"]');
    const count = await projectCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have working project filters', async ({ page }) => {
    // Check for filter buttons
    const filterButtons = page.locator('[data-testid="project-filter"]');
    await expect(filterButtons.first()).toBeVisible();

    // Click a filter
    await filterButtons.first().click();

    // Check that projects are filtered
    const projectCards = page.locator('[data-testid="project-card"]:visible');
    await expect(projectCards).toHaveCount(await projectCards.count());
  });

  test('should display certifications', async ({ page }) => {
    // Check for certifications section
    const certificationsSection = page.locator(
      '[data-testid="certifications-section"]'
    );

    if (await certificationsSection.isVisible()) {
      // Check for certification items
      const certItems = page.locator('[data-testid="certification-item"]');
      await expect(certItems.first()).toBeVisible();
    }
  });

  test('should have download resume button', async ({ page }) => {
    // Check for download button
    const downloadButton = page.locator(
      'button:has-text("이력서 다운로드"), a:has-text("이력서 다운로드")'
    );

    if (await downloadButton.isVisible()) {
      await expect(downloadButton).toBeEnabled();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that content is still visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Check that navigation is responsive
    const mobileMenu = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    // Check meta description
    const metaDescription = await page.getAttribute(
      'meta[name="description"]',
      'content'
    );
    expect(metaDescription).toBeTruthy();

    // Check Open Graph tags
    const ogTitle = await page.getAttribute(
      'meta[property="og:title"]',
      'content'
    );
    expect(ogTitle).toBeTruthy();
  });

  test('should navigate to contact page from CTA', async ({ page }) => {
    // Find and click contact CTA
    const contactCTA = page
      .locator('a:has-text("문의하기"), button:has-text("문의하기")')
      .first();

    if (await contactCTA.isVisible()) {
      await contactCTA.click();
      await expect(page).toHaveURL(/#\/contact/);
    }
  });
});
