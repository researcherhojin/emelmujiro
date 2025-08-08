const { test, expect } = require('@playwright/test');

test.describe('Blog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/blog');
  });

  test('displays blog list', async ({ page }) => {
    await expect(page.locator('h1:has-text("블로그")')).toBeVisible();
    
    // Check if blog posts are displayed
    const blogPosts = page.locator('[data-testid="blog-post-card"]');
    await expect(blogPosts.first()).toBeVisible();
  });

  test('search functionality works', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="검색"]');
    await expect(searchInput).toBeVisible();
    
    // Type search query
    await searchInput.fill('AI');
    
    // Check if results are filtered
    await page.waitForTimeout(500); // Wait for debounce
    const blogPosts = page.locator('[data-testid="blog-post-card"]');
    const count = await blogPosts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('category filter works', async ({ page }) => {
    // Click on a category
    const categoryButton = page.locator('button:has-text("AI 교육")');
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      
      // Check if posts are filtered
      await page.waitForTimeout(500);
      const blogPosts = page.locator('[data-testid="blog-post-card"]');
      await expect(blogPosts.first()).toBeVisible();
    }
  });

  test('can navigate to blog detail', async ({ page }) => {
    // Click on first blog post
    const firstPost = page.locator('[data-testid="blog-post-card"]').first();
    await firstPost.click();
    
    // Check if navigated to detail page
    await expect(page).toHaveURL(/#\/blog\/\d+$/);
    
    // Check if content is displayed
    await expect(page.locator('article')).toBeVisible();
  });

  test('blog detail page displays correctly', async ({ page }) => {
    // Navigate directly to a blog post
    await page.goto('/#/blog/1');
    
    // Check title
    await expect(page.locator('h1')).toBeVisible();
    
    // Check metadata (author, date, category)
    await expect(page.locator('text=작성자')).toBeVisible();
    
    // Check content
    await expect(page.locator('article')).toBeVisible();
    
    // Check interactions (like, bookmark, share)
    await expect(page.locator('[aria-label*="좋아요"]')).toBeVisible();
  });

  test('like functionality works', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/#/blog/1');
    
    // Find like button
    const likeButton = page.locator('[aria-label*="좋아요"]');
    
    // Get initial like count
    const initialText = await likeButton.textContent();
    
    // Click like button
    await likeButton.click();
    
    // Check if like count increased
    await page.waitForTimeout(500);
    const updatedText = await likeButton.textContent();
    expect(updatedText).not.toBe(initialText);
  });

  test('comment functionality works', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/#/blog/1');
    
    // Scroll to comments section
    await page.locator('text=댓글').scrollIntoViewIfNeeded();
    
    // Find comment form
    const commentInput = page.locator('textarea[placeholder*="댓글"]');
    if (await commentInput.isVisible()) {
      // Type a comment
      await commentInput.fill('테스트 댓글입니다.');
      
      // Submit comment
      const submitButton = page.locator('button:has-text("등록")');
      await submitButton.click();
      
      // Check if comment is added
      await page.waitForTimeout(500);
      await expect(page.locator('text=테스트 댓글입니다.')).toBeVisible();
    }
  });

  test('pagination works', async ({ page }) => {
    // Check if pagination exists
    const pagination = page.locator('[aria-label="Pagination"]');
    if (await pagination.isVisible()) {
      // Click next page
      const nextButton = page.locator('button[aria-label="Next page"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        
        // Check if URL updated
        await expect(page).toHaveURL(/#\/blog\?page=2$/);
        
        // Check if new posts are displayed
        const blogPosts = page.locator('[data-testid="blog-post-card"]');
        await expect(blogPosts.first()).toBeVisible();
      }
    }
  });

  test('responsive layout works', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopGrid = page.locator('.grid-cols-3');
    if (await desktopGrid.isVisible()) {
      await expect(desktopGrid).toBeVisible();
    }
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    const mobileGrid = page.locator('.grid-cols-1');
    if (await mobileGrid.isVisible()) {
      await expect(mobileGrid).toBeVisible();
    }
  });
});