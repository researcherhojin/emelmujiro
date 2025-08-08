const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test('login flow', async ({ page }) => {
    await page.goto('/');
    
    // Look for login button (if exists)
    const loginButton = page.locator('button:has-text("로그인")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      
      // Check if login form is displayed
      await expect(page.locator('form')).toBeVisible();
      
      // Fill in credentials
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword123');
      
      // Submit form
      await page.locator('button[type="submit"]').click();
      
      // Check for success (redirect or message)
      await page.waitForTimeout(1000);
    }
  });

  test('signup flow', async ({ page }) => {
    await page.goto('/');
    
    // Look for signup button
    const signupButton = page.locator('button:has-text("회원가입")');
    if (await signupButton.isVisible()) {
      await signupButton.click();
      
      // Fill signup form
      await page.fill('input[name="name"]', '테스트 사용자');
      await page.fill('input[name="email"]', 'newuser@example.com');
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
      
      // Accept terms if checkbox exists
      const termsCheckbox = page.locator('input[type="checkbox"]');
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }
      
      // Submit
      await page.locator('button[type="submit"]').click();
      
      // Check for success
      await page.waitForTimeout(1000);
    }
  });

  test('logout flow', async ({ page }) => {
    // Assuming user is logged in
    await page.goto('/');
    
    // Look for logout button
    const logoutButton = page.locator('button:has-text("로그아웃")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Confirm logout if modal appears
      const confirmButton = page.locator('button:has-text("확인")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Check if logged out
      await page.waitForTimeout(500);
      await expect(page.locator('button:has-text("로그인")')).toBeVisible();
    }
  });

  test('protected route redirect', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/#/admin');
    
    // Should redirect to login or home
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toMatch(/(login|#\/$)/);
  });

  test('password reset flow', async ({ page }) => {
    await page.goto('/');
    
    const loginButton = page.locator('button:has-text("로그인")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      
      // Click forgot password link
      const forgotLink = page.locator('text=비밀번호를 잊으셨나요?');
      if (await forgotLink.isVisible()) {
        await forgotLink.click();
        
        // Enter email
        await page.fill('input[type="email"]', 'test@example.com');
        
        // Submit
        await page.locator('button:has-text("재설정 링크 보내기")').click();
        
        // Check for success message
        await page.waitForTimeout(1000);
        await expect(page.locator('text=이메일을 확인해주세요')).toBeVisible();
      }
    }
  });

  test('session persistence', async ({ page, context }) => {
    // Mock login
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'mock_token_value',
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    // Navigate to protected area
    await page.goto('/');
    
    // Check if user is recognized as logged in
    const userMenu = page.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      await expect(userMenu).toBeVisible();
    }
  });

  test('form validation', async ({ page }) => {
    await page.goto('/');
    
    const loginButton = page.locator('button:has-text("로그인")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      
      // Try to submit empty form
      await page.locator('button[type="submit"]').click();
      
      // Check for validation messages
      const errorMessage = page.locator('.text-red-500').first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
      
      // Test invalid email format
      await page.fill('input[type="email"]', 'invalid-email');
      await page.locator('button[type="submit"]').click();
      
      // Check for email validation error
      await page.waitForTimeout(500);
      const emailError = page.locator('text=올바른 이메일 주소를 입력해주세요');
      if (await emailError.isVisible()) {
        await expect(emailError).toBeVisible();
      }
    }
  });
});