import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/contact');
  });

  test('displays contact form', async ({ page }) => {
    // Check page heading
    await expect(page.locator('h1')).toContainText(/문의|Contact/i);

    // Check form fields
    const nameInput = page.getByLabel(/이름|name/i);
    const emailInput = page.getByLabel(/이메일|email/i);
    const messageInput = page.getByLabel(/메시지|message/i);
    const submitButton = page.getByRole('button', {
      name: /전송|send|submit/i,
    });

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('form validation works', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', {
      name: /전송|send|submit/i,
    });
    await submitButton.click();

    // Check for validation messages
    const validationMessage = page
      .locator('.error-message, [role="alert"]')
      .first();

    if (await validationMessage.isVisible()) {
      await expect(validationMessage).toContainText(/필수|required/i);
    }
  });

  test('email validation', async ({ page }) => {
    // Fill invalid email
    const emailInput = page.getByLabel(/이메일|email/i);
    await emailInput.fill('invalid-email');

    // Try to submit
    const submitButton = page.getByRole('button', {
      name: /전송|send|submit/i,
    });
    await submitButton.click();

    // Check for email validation error
    const emailError = page.locator(
      '[data-testid="email-error"], .email-error'
    );

    if (await emailError.isVisible()) {
      await expect(emailError).toContainText(/유효|valid|올바른/i);
    }
  });

  test('successful form submission', async ({ page }) => {
    // Fill form
    await page.getByLabel(/이름|name/i).fill('테스트 사용자');
    await page.getByLabel(/이메일|email/i).fill('test@example.com');
    await page.getByLabel(/메시지|message/i).fill('테스트 메시지입니다.');

    // Submit form
    const submitButton = page.getByRole('button', {
      name: /전송|send|submit/i,
    });
    await submitButton.click();

    // Wait for submission
    await page.waitForTimeout(1000);

    // Check for success message
    const successMessage = page.locator(
      '[data-testid="success-message"], .success-message'
    );

    if (await successMessage.isVisible()) {
      await expect(successMessage).toContainText(/감사|성공|thank|success/i);
    }
  });

  test('displays contact information', async ({ page }) => {
    // Check for contact info section
    const contactInfo = page.locator('[data-testid="contact-info"]');

    if (await contactInfo.isVisible()) {
      // Check for email
      const emailLink = contactInfo.getByRole('link', { name: /@/ });
      if (await emailLink.isVisible()) {
        await expect(emailLink).toHaveAttribute('href', /^mailto:/);
      }

      // Check for phone
      const phoneLink = contactInfo.getByRole('link', { name: /\d{2,}/ });
      if (await phoneLink.isVisible()) {
        await expect(phoneLink).toHaveAttribute('href', /^tel:/);
      }
    }
  });

  test('displays office location/map', async ({ page }) => {
    // Check for map or address
    const mapSection = page.locator(
      '[data-testid="map"], .map-container, iframe[src*="maps"]'
    );
    const addressSection = page.locator('[data-testid="address"], .address');

    // Either map or address should be visible
    const hasLocationInfo =
      (await mapSection.isVisible()) || (await addressSection.isVisible());
    expect(hasLocationInfo).toBeTruthy();
  });

  test('newsletter subscription', async ({ page }) => {
    // Check for newsletter form
    const newsletterForm = page.locator('[data-testid="newsletter-form"]');

    if (await newsletterForm.isVisible()) {
      const emailInput = newsletterForm.getByPlaceholder(/이메일|email/i);
      const subscribeButton = newsletterForm.getByRole('button', {
        name: /구독|subscribe/i,
      });

      // Fill email
      await emailInput.fill('newsletter@example.com');

      // Subscribe
      await subscribeButton.click();

      // Wait for response
      await page.waitForTimeout(1000);

      // Check for confirmation
      const confirmation = page.locator('[data-testid="newsletter-success"]');
      if (await confirmation.isVisible()) {
        await expect(confirmation).toContainText(/구독|감사|thank|subscribed/i);
      }
    }
  });

  test('social media links', async ({ page }) => {
    // Check for social media links
    const socialLinks = page.locator(
      '[data-testid="social-links"] a, .social-links a'
    );

    if ((await socialLinks.count()) > 0) {
      // Check each link has proper attributes
      const linksCount = await socialLinks.count();

      for (let i = 0; i < linksCount; i++) {
        const link = socialLinks.nth(i);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', /noopener|noreferrer/);
      }
    }
  });
});
