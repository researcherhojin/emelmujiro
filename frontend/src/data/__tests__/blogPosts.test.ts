import { blogPosts } from '../blogPosts';

describe('blogPosts data', () => {
  describe('Blog Posts Array', () => {
    it('should have blog posts', () => {
      expect(blogPosts).toBeDefined();
      expect(Array.isArray(blogPosts)).toBe(true);
      expect(blogPosts.length).toBeGreaterThan(0);
    });

    it('should have valid blog post structure', () => {
      blogPosts.forEach((post) => {
        expect(post.id).toBeDefined();
        expect(typeof post.id).toBe('number');
        expect(post.title).toBeDefined();
        expect(typeof post.title).toBe('string');
        expect(post.slug).toBeDefined();
        expect(typeof post.slug).toBe('string');
        expect(post.excerpt).toBeDefined();
        expect(post.content).toBeDefined();
        expect(post.author).toBeDefined();
        expect(post.date).toBeDefined();
        expect(post.published).toBeDefined();
        expect(typeof post.published).toBe('boolean');
        expect(post.category).toBeDefined();
        expect(Array.isArray(post.tags)).toBe(true);
      });
    });

    it('should have unique IDs', () => {
      const ids = blogPosts.map((post) => post.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique slugs', () => {
      const slugs = blogPosts.map((post) => post.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe('Blog Posts Filtering', () => {
    it('should filter published posts', () => {
      const publishedPosts = blogPosts.filter((p) => p.published);
      expect(publishedPosts.length).toBeGreaterThan(0);
      publishedPosts.forEach((post) => {
        expect(post.published).toBe(true);
      });
    });

    it('should filter by category', () => {
      const category = blogPosts[0].category;
      const categoryPosts = blogPosts.filter((p) => p.category === category);
      expect(categoryPosts.length).toBeGreaterThan(0);
      categoryPosts.forEach((post) => {
        expect(post.category).toBe(category);
      });
    });

    it('should filter by tags', () => {
      const postsWithTags = blogPosts.filter(
        (p) => p.tags && p.tags.length > 0
      );
      const nonExistentResults = blogPosts.filter(
        (p) => p.tags && p.tags.includes('non-existent-tag-xyz-123')
      );

      // Always test that non-existent tag returns empty
      expect(nonExistentResults).toEqual([]);

      // If posts have tags, test filtering works
      const hasTaggedPosts = postsWithTags.length > 0;
      const tagToTest = hasTaggedPosts
        ? postsWithTags[0].tags?.[0] || 'test-tag'
        : 'test-tag';
      const taggedPosts = blogPosts.filter(
        (p) => p.tags && p.tags.includes(tagToTest)
      );

      // This will be 0 if no posts have tags, which is correct
      expect(taggedPosts.length).toBeGreaterThanOrEqual(hasTaggedPosts ? 1 : 0);
    });
  });

  describe('Blog Posts Searching', () => {
    it('should find posts by title keyword', () => {
      const keyword = blogPosts[0].title.split(' ')[0];
      const results = blogPosts.filter((p) =>
        p.title.toLowerCase().includes(keyword.toLowerCase())
      );
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find posts by content keyword', () => {
      const results = blogPosts.filter((p) =>
        p.content.toLowerCase().includes('ai')
      );
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find posts by tag', () => {
      const postsWithTags = blogPosts.filter(
        (p) => p.tags && p.tags.length > 0
      );
      const nonExistentResults = blogPosts.filter(
        (p) => p.tags && p.tags.includes('non-existent-tag-xyz-123')
      );

      // Always test that non-existent tag returns empty
      expect(nonExistentResults).toEqual([]);

      // Test actual tag search
      const hasTaggedPosts = postsWithTags.length > 0;
      const tagToSearch = hasTaggedPosts
        ? postsWithTags[0].tags?.[0] || 'search-tag'
        : 'search-tag';
      const searchResults = blogPosts.filter(
        (p) => p.tags && p.tags.includes(tagToSearch)
      );

      // Verify results match expectation
      expect(searchResults.length).toBeGreaterThanOrEqual(
        hasTaggedPosts ? 1 : 0
      );
    });
  });

  describe('Categories and Tags', () => {
    it('should extract unique categories', () => {
      const categories = Array.from(new Set(blogPosts.map((p) => p.category)));
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.length).toBeLessThanOrEqual(blogPosts.length);
    });

    it('should extract unique tags', () => {
      const allTags = blogPosts.flatMap((p) => p.tags || []);
      const uniqueTags = Array.from(new Set(allTags));
      expect(uniqueTags.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity', () => {
    it('should have valid date formats', () => {
      blogPosts.forEach((post) => {
        expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const date = new Date(post.date!);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });

    it('should have valid created_at and updated_at timestamps', () => {
      blogPosts.forEach((post) => {
        const createdAt = new Date(post.created_at!);
        const updatedAt = new Date(post.updated_at!);
        expect(createdAt.toString()).not.toBe('Invalid Date');
        expect(updatedAt.toString()).not.toBe('Invalid Date');
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
      });
    });

    it('should have non-empty required fields', () => {
      blogPosts.forEach((post) => {
        expect(post.title.trim()).not.toBe('');
        expect(post.slug.trim()).not.toBe('');
        expect(post.excerpt.trim()).not.toBe('');
        expect(post.content.trim()).not.toBe('');
        expect(post.author.trim()).not.toBe('');
        expect(post.category?.trim()).not.toBe('');
      });
    });

    it('should have valid image URLs', () => {
      blogPosts.forEach((post) => {
        // Only check if image_url exists
        if (!post.image_url) {
          return;
        }
        expect(post.image_url).toMatch(/^https?:\/\/.+/);
      });
    });
  });
});
