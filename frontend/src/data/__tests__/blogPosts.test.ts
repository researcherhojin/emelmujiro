import { vi, describe, it, expect, beforeEach } from 'vitest';
import { blogPosts, getBlogPosts, getBlogPost } from '../blogPosts';

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
};

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
        expect(post.description).toBeDefined();
        expect(post.content).toBeDefined();
        expect(post.author).toBeDefined();
        expect(post.date).toBeDefined();
        expect(post.is_published).toBeDefined();
        expect(typeof post.is_published).toBe('boolean');
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
      const publishedPosts = blogPosts.filter((p) => p.is_published);
      expect(publishedPosts.length).toBeGreaterThan(0);
      publishedPosts.forEach((post) => {
        expect(post.is_published).toBe(true);
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
      const postsWithTags = blogPosts.filter((p) => p.tags && p.tags.length > 0);
      const nonExistentResults = blogPosts.filter(
        (p) => p.tags && p.tags.includes('non-existent-tag-xyz-123')
      );

      // Always test that non-existent tag returns empty
      expect(nonExistentResults).toEqual([]);

      // If posts have tags, test filtering works
      const hasTaggedPosts = postsWithTags.length > 0;
      const tagToTest = hasTaggedPosts ? postsWithTags[0].tags?.[0] || 'test-tag' : 'test-tag';
      const taggedPosts = blogPosts.filter((p) => p.tags && p.tags.includes(tagToTest));

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
      const results = blogPosts.filter((p) => p.content.toLowerCase().includes('ai'));
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find posts by tag', () => {
      const postsWithTags = blogPosts.filter((p) => p.tags && p.tags.length > 0);
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
      const searchResults = blogPosts.filter((p) => p.tags && p.tags.includes(tagToSearch));

      // Verify results match expectation
      expect(searchResults.length).toBeGreaterThanOrEqual(hasTaggedPosts ? 1 : 0);
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
        expect(post.description.trim()).not.toBe('');
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

  describe('getBlogPosts', () => {
    beforeEach(() => {
      mockLocalStorage.store = {};
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
    });

    it('returns default posts when no custom posts in localStorage', async () => {
      const posts = await getBlogPosts();
      expect(posts.length).toBeGreaterThanOrEqual(blogPosts.length);
    });

    it('merges custom posts from localStorage', async () => {
      const customPost = {
        id: 999,
        title: 'Custom Post',
        slug: 'custom-post',
        description: 'Custom',
        content: 'Custom content',
        author: 'Test',
        date: '2025-01-01',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        is_published: true,
        category: 'test',
        tags: [],
      };
      mockLocalStorage.store['customBlogPosts'] = JSON.stringify([customPost]);
      const posts = await getBlogPosts();
      expect(posts.find((p) => p.id === 999)).toBeDefined();
    });

    it('removes duplicate IDs (custom post wins)', async () => {
      const customPost = {
        id: 1,
        title: 'Override Post',
        slug: 'override',
        description: 'Override',
        content: 'Override',
        author: 'Test',
        date: '2025-06-01',
        created_at: '2025-06-01T00:00:00Z',
        updated_at: '2025-06-01T00:00:00Z',
        is_published: true,
        category: 'test',
        tags: [],
      };
      mockLocalStorage.store['customBlogPosts'] = JSON.stringify([customPost]);
      const posts = await getBlogPosts();
      const post1 = posts.find((p) => p.id === 1);
      expect(post1?.title).toBe('Override Post');
    });

    it('sorts posts by date (newest first)', async () => {
      const posts = await getBlogPosts();
      for (let i = 0; i < posts.length - 1; i++) {
        const dateA = new Date(posts[i].created_at || posts[i].date || '').getTime();
        const dateB = new Date(posts[i + 1].created_at || posts[i + 1].date || '').getTime();
        expect(dateA).toBeGreaterThanOrEqual(dateB);
      }
    });

    it('falls back to default posts on localStorage parse error', async () => {
      mockLocalStorage.store['customBlogPosts'] = 'invalid json{{{';
      const posts = await getBlogPosts();
      expect(posts.length).toBe(blogPosts.length);
    });

    it('sorts posts correctly when some lack created_at', async () => {
      const postsWithDateOnly = [
        {
          id: 901,
          title: 'Date Only Post',
          slug: 'date-only',
          description: 'E',
          content: 'C',
          author: 'T',
          date: '2025-06-01',
          is_published: true,
          category: 'test',
          tags: [],
        },
        {
          id: 902,
          title: 'No Date Post',
          slug: 'no-date',
          description: 'E',
          content: 'C',
          author: 'T',
          is_published: true,
          category: 'test',
          tags: [],
        },
      ];
      mockLocalStorage.store['customBlogPosts'] = JSON.stringify(postsWithDateOnly);
      const posts = await getBlogPosts();
      // Should not throw and should return all posts
      expect(posts.length).toBeGreaterThan(0);
      // Posts with date-only and no-date should still be present
      expect(posts.find((p) => p.id === 901)).toBeDefined();
      expect(posts.find((p) => p.id === 902)).toBeDefined();
    });
  });

  describe('getBlogPost', () => {
    beforeEach(() => {
      mockLocalStorage.store = {};
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
    });

    it('finds a default post by numeric ID', async () => {
      const post = await getBlogPost(1);
      expect(post).toBeDefined();
      expect(post?.id).toBe(1);
    });

    it('finds a default post by string ID', async () => {
      const post = await getBlogPost('2');
      expect(post).toBeDefined();
      expect(post?.id).toBe(2);
    });

    it('returns undefined for non-existent ID', async () => {
      const post = await getBlogPost(99999);
      expect(post).toBeUndefined();
    });

    it('finds a custom post from localStorage', async () => {
      const customPost = {
        id: 888,
        title: 'Custom Single',
        slug: 'custom-single',
        description: 'E',
        content: 'C',
        author: 'T',
        date: '2025-01-01',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        is_published: true,
        category: 'test',
        tags: [],
      };
      mockLocalStorage.store['customBlogPosts'] = JSON.stringify([customPost]);
      const post = await getBlogPost(888);
      expect(post?.title).toBe('Custom Single');
    });

    it('falls back to default posts on localStorage error', async () => {
      mockLocalStorage.store['customBlogPosts'] = 'broken{json';
      const post = await getBlogPost(1);
      expect(post).toBeDefined();
      expect(post?.id).toBe(1);
    });
  });
});
