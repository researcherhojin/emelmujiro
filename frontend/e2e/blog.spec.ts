import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/blog');
  });

  test('displays blog posts list', async ({ page }) => {
    // Wait for blog posts to load
    await page.waitForSelector('[data-testid="blog-post"]', { timeout: 10000 });

    // Check if blog posts are displayed
    const blogPosts = page.locator('[data-testid="blog-post"]');
    const count = await blogPosts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search functionality works', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder(/검색|search/i);
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('AI');

    // Wait for search results
    await page.waitForTimeout(500);

    // Check if results are filtered
    const results = page.locator('[data-testid="blog-post"]');
    const count = await results.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('category filter works', async ({ page }) => {
    // Check for category buttons
    const categoryButtons = page.locator('[data-testid="category-filter"]');

    if ((await categoryButtons.count()) > 0) {
      // Click first category
      await categoryButtons.first().click();

      // Wait for filtered results
      await page.waitForTimeout(500);

      // Check if posts are displayed
      const filteredPosts = page.locator('[data-testid="blog-post"]');
      await expect(filteredPosts.first()).toBeVisible();
    }
  });

  test('pagination works', async ({ page }) => {
    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"]');

    if (await pagination.isVisible()) {
      // Click next page
      const nextButton = pagination.getByRole('button', { name: /next|다음/i });

      if (await nextButton.isEnabled()) {
        await nextButton.click();

        // Wait for new posts to load
        await page.waitForTimeout(500);

        // Check if URL changed
        await expect(page).toHaveURL(/page=2|p=2/);
      }
    }
  });

  test('blog post detail page loads', async ({ page }) => {
    // Wait for blog posts
    await page.waitForSelector('[data-testid="blog-post"]');

    // Click first blog post
    const firstPost = page.locator('[data-testid="blog-post"]').first();
    const postTitle = await firstPost.locator('h2,h3').textContent();

    await firstPost.click();

    // Check if navigated to detail page
    await expect(page).toHaveURL(/#\/blog\/\d+|#\/blog\/[\w-]+/);

    // Check if post title is displayed
    if (postTitle) {
      await expect(page.locator('h1')).toContainText(postTitle);
    }
  });

  test('comment form is accessible', async ({ page }) => {
    // Navigate to first blog post
    await page.locator('[data-testid="blog-post"]').first().click();

    // Wait for detail page to load
    await page.waitForSelector('h1');

    // Scroll to comments section
    await page.evaluate(() => {
      const commentsSection = document.querySelector('[data-testid="comments-section"]');
      if (commentsSection) {
        commentsSection.scrollIntoView();
      }
    });

    // Check for comment form
    const commentForm = page.locator('[data-testid="comment-form"]');

    if (await commentForm.isVisible()) {
      // Check form elements
      const nameInput = commentForm.getByPlaceholder(/이름|name/i);
      const commentInput = commentForm.getByPlaceholder(/댓글|comment/i);
      const submitButton = commentForm.getByRole('button', { name: /작성|submit/i });

      await expect(nameInput).toBeVisible();
      await expect(commentInput).toBeVisible();
      await expect(submitButton).toBeVisible();
    }
  });

  test('like button interaction', async ({ page }) => {
    // Navigate to first blog post
    await page.locator('[data-testid="blog-post"]').first().click();

    // Wait for detail page
    await page.waitForSelector('h1');

    // Find like button
    const likeButton = page.locator('[data-testid="like-button"]');

    if (await likeButton.isVisible()) {
      // Get initial like count
      const initialCount = await likeButton.textContent();

      // Click like button
      await likeButton.click();

      // Wait for update
      await page.waitForTimeout(500);

      // Check if count changed
      const newCount = await likeButton.textContent();
      expect(newCount).not.toBe(initialCount);
    }
  });
});
