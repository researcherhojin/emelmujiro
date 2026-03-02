import { describe, it, expect } from 'vitest';
import { mockBlogPosts, mockCategories, paginateMockData } from '../mockData';

describe('mockData', () => {
  describe('mockBlogPosts', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockBlogPosts)).toBe(true);
      expect(mockBlogPosts.length).toBeGreaterThan(0);
    });

    it('should have 6 blog posts', () => {
      expect(mockBlogPosts).toHaveLength(6);
    });

    it('should have valid blog post structure for each post', () => {
      mockBlogPosts.forEach((post) => {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('excerpt');
        expect(post).toHaveProperty('author');
        expect(post).toHaveProperty('publishedAt');
        expect(post).toHaveProperty('category');
        expect(post).toHaveProperty('tags');
        expect(post).toHaveProperty('slug');
        expect(post).toHaveProperty('published');
        expect(post).toHaveProperty('created_at');
        expect(post).toHaveProperty('updated_at');
      });
    });

    it('should have correct types for each field', () => {
      mockBlogPosts.forEach((post) => {
        expect(typeof post.id).toBe('number');
        expect(typeof post.title).toBe('string');
        expect(typeof post.content).toBe('string');
        expect(typeof post.excerpt).toBe('string');
        expect(typeof post.author).toBe('string');
        expect(typeof post.publishedAt).toBe('string');
        expect(typeof post.slug).toBe('string');
        expect(typeof post.published).toBe('boolean');
        expect(Array.isArray(post.tags)).toBe(true);
      });
    });

    it('should have unique IDs', () => {
      const ids = mockBlogPosts.map((post) => post.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique slugs', () => {
      const slugs = mockBlogPosts.map((post) => post.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('should have all posts published', () => {
      mockBlogPosts.forEach((post) => {
        expect(post.published).toBe(true);
      });
    });

    it('should have non-empty required string fields', () => {
      mockBlogPosts.forEach((post) => {
        expect(post.title.trim().length).toBeGreaterThan(0);
        expect(post.content.trim().length).toBeGreaterThan(0);
        expect(post.excerpt.trim().length).toBeGreaterThan(0);
        expect(post.author.trim().length).toBeGreaterThan(0);
        expect(post.slug.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have valid date formats for publishedAt', () => {
      mockBlogPosts.forEach((post) => {
        expect(post.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const date = new Date(post.publishedAt);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });

    it('should have valid ISO timestamps for created_at and updated_at', () => {
      mockBlogPosts.forEach((post) => {
        expect(post.created_at).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
        );
        expect(post.updated_at).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
        );
      });
    });

    it('should have tags as arrays of strings', () => {
      mockBlogPosts.forEach((post) => {
        expect(post.tags).toBeDefined();
        post.tags!.forEach((tag) => {
          expect(typeof tag).toBe('string');
          expect(tag.trim().length).toBeGreaterThan(0);
        });
      });
    });

    it('should have numeric views and likes', () => {
      mockBlogPosts.forEach((post) => {
        expect(typeof post.views).toBe('number');
        expect(typeof post.likes).toBe('number');
        expect(post.views).toBeGreaterThanOrEqual(0);
        expect(post.likes).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('mockCategories', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockCategories)).toBe(true);
      expect(mockCategories.length).toBeGreaterThan(0);
    });

    it('should have 6 categories', () => {
      expect(mockCategories).toHaveLength(6);
    });

    it('should have valid category structure', () => {
      mockCategories.forEach((category) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
        expect(typeof category.id).toBe('number');
        expect(typeof category.name).toBe('string');
        expect(typeof category.slug).toBe('string');
      });
    });

    it('should have unique IDs', () => {
      const ids = mockCategories.map((cat) => cat.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique slugs', () => {
      const slugs = mockCategories.map((cat) => cat.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('should have non-empty name and slug', () => {
      mockCategories.forEach((category) => {
        expect(category.name.trim().length).toBeGreaterThan(0);
        expect(category.slug.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have slugs in lowercase kebab-case', () => {
      mockCategories.forEach((category) => {
        expect(category.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      });
    });

    it('should cover all categories used by blog posts', () => {
      const postCategories = new Set(
        mockBlogPosts.map((post) => post.category)
      );
      const categoryNames = new Set(mockCategories.map((cat) => cat.name));
      postCategories.forEach((category) => {
        expect(categoryNames.has(category!)).toBe(true);
      });
    });
  });

  describe('paginateMockData', () => {
    describe('basic pagination', () => {
      it('should return first page correctly', () => {
        const result = paginateMockData(mockBlogPosts, 1, 2);

        expect(result.results).toHaveLength(2);
        expect(result.count).toBe(6);
        expect(result.next).toBe(2);
        expect(result.previous).toBeNull();
      });

      it('should return middle page correctly', () => {
        const result = paginateMockData(mockBlogPosts, 2, 2);

        expect(result.results).toHaveLength(2);
        expect(result.count).toBe(6);
        expect(result.next).toBe(3);
        expect(result.previous).toBe(1);
      });

      it('should return last page correctly', () => {
        const result = paginateMockData(mockBlogPosts, 3, 2);

        expect(result.results).toHaveLength(2);
        expect(result.count).toBe(6);
        expect(result.next).toBeNull();
        expect(result.previous).toBe(2);
      });

      it('should return all items when pageSize >= total', () => {
        const result = paginateMockData(mockBlogPosts, 1, 10);

        expect(result.results).toHaveLength(6);
        expect(result.count).toBe(6);
        expect(result.next).toBeNull();
        expect(result.previous).toBeNull();
      });

      it('should return all items when pageSize equals total', () => {
        const result = paginateMockData(mockBlogPosts, 1, 6);

        expect(result.results).toHaveLength(6);
        expect(result.next).toBeNull();
        expect(result.previous).toBeNull();
      });
    });

    describe('result structure', () => {
      it('should return count, next, previous, and results', () => {
        const result = paginateMockData(mockBlogPosts, 1, 3);

        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('next');
        expect(result).toHaveProperty('previous');
        expect(result).toHaveProperty('results');
      });

      it('should preserve original data in results', () => {
        const result = paginateMockData(mockBlogPosts, 1, 2);

        expect(result.results[0]).toHaveProperty('id', mockBlogPosts[0].id);
        expect(result.results[0]).toHaveProperty(
          'title',
          mockBlogPosts[0].title
        );
        expect(result.results[1]).toHaveProperty('id', mockBlogPosts[1].id);
      });

      it('should add createdAt field when created_at exists but createdAt does not', () => {
        const result = paginateMockData(mockBlogPosts, 1, 1);
        const firstResult = result.results[0] as (typeof mockBlogPosts)[0] & {
          createdAt?: string;
        };

        // mockBlogPosts items have created_at but not createdAt
        expect(firstResult.createdAt).toBe(mockBlogPosts[0].created_at);
      });

      it('should not add createdAt if item already has it', () => {
        const dataWithCreatedAt = [
          {
            id: 1,
            name: 'test',
            created_at: '2024-01-01',
            createdAt: '2024-02-02',
          },
        ];
        const result = paginateMockData(dataWithCreatedAt, 1, 10);

        // Should keep the existing createdAt, not overwrite with created_at
        expect(
          (result.results[0] as (typeof dataWithCreatedAt)[0]).createdAt
        ).toBe('2024-02-02');
      });

      it('should not add createdAt if item has no created_at', () => {
        const dataWithoutDates = [{ id: 1, name: 'test' }];
        const result = paginateMockData(dataWithoutDates, 1, 10);

        expect(result.results[0]).not.toHaveProperty('createdAt');
      });
    });

    describe('edge cases', () => {
      it('should handle empty array', () => {
        const result = paginateMockData([], 1, 10);

        expect(result.results).toHaveLength(0);
        expect(result.count).toBe(0);
        expect(result.next).toBeNull();
        expect(result.previous).toBeNull();
      });

      it('should return empty results for page beyond data range', () => {
        const result = paginateMockData(mockBlogPosts, 100, 2);

        expect(result.results).toHaveLength(0);
        expect(result.count).toBe(6);
        expect(result.next).toBeNull();
        expect(result.previous).toBe(99);
      });

      it('should handle page size of 1', () => {
        const result = paginateMockData(mockBlogPosts, 1, 1);

        expect(result.results).toHaveLength(1);
        expect(result.count).toBe(6);
        expect(result.next).toBe(2);
        expect(result.previous).toBeNull();
      });

      it('should handle single-item array', () => {
        const singleItem = [{ id: 1, value: 'only' }];
        const result = paginateMockData(singleItem, 1, 10);

        expect(result.results).toHaveLength(1);
        expect(result.count).toBe(1);
        expect(result.next).toBeNull();
        expect(result.previous).toBeNull();
      });

      it('should handle page 0 (returns same as page 1 with empty results due to negative index)', () => {
        // page 0: startIndex = (0-1)*pageSize = -pageSize, endIndex = 0
        // slice(-pageSize, 0) returns empty array
        const result = paginateMockData(mockBlogPosts, 0, 2);

        expect(result.results).toHaveLength(0);
        expect(result.count).toBe(6);
      });

      it('should handle negative page', () => {
        // page -1: startIndex = (-1-1)*2 = -4, endIndex = -2
        // slice(-4, -2) returns items from 4th-from-end to 2nd-from-end
        const result = paginateMockData(mockBlogPosts, -1, 2);

        expect(result.count).toBe(6);
        // With negative indices, slice still works but returns unexpected items
        expect(result.results).toHaveLength(2);
      });

      it('should handle partial last page', () => {
        // 6 items, page size 4: page 2 should have 2 items
        const result = paginateMockData(mockBlogPosts, 2, 4);

        expect(result.results).toHaveLength(2);
        expect(result.count).toBe(6);
        expect(result.next).toBeNull();
        expect(result.previous).toBe(1);
      });
    });

    describe('with non-blog-post data (generic type)', () => {
      it('should work with simple objects', () => {
        const simpleData = [
          { id: 1, name: 'Alpha' },
          { id: 2, name: 'Beta' },
          { id: 3, name: 'Gamma' },
        ];

        const result = paginateMockData(simpleData, 1, 2);

        expect(result.results).toHaveLength(2);
        expect(result.count).toBe(3);
        expect(result.next).toBe(2);
        expect(result.previous).toBeNull();
      });

      it('should work with string arrays', () => {
        const strings = ['a', 'b', 'c', 'd', 'e'];

        const result = paginateMockData(strings, 2, 2);

        expect(result.results).toHaveLength(2);
        expect(result.results).toEqual(['c', 'd']);
        expect(result.count).toBe(5);
        expect(result.next).toBe(3);
        expect(result.previous).toBe(1);
      });

      it('should work with number arrays', () => {
        const numbers = [10, 20, 30, 40, 50];

        const result = paginateMockData(numbers, 1, 3);

        expect(result.results).toEqual([10, 20, 30]);
        expect(result.next).toBe(2);
      });
    });

    describe('pagination math', () => {
      it('should correctly compute next page number', () => {
        // 6 items, 2 per page = 3 pages
        expect(paginateMockData(mockBlogPosts, 1, 2).next).toBe(2);
        expect(paginateMockData(mockBlogPosts, 2, 2).next).toBe(3);
        expect(paginateMockData(mockBlogPosts, 3, 2).next).toBeNull();
      });

      it('should correctly compute previous page number', () => {
        expect(paginateMockData(mockBlogPosts, 1, 2).previous).toBeNull();
        expect(paginateMockData(mockBlogPosts, 2, 2).previous).toBe(1);
        expect(paginateMockData(mockBlogPosts, 3, 2).previous).toBe(2);
      });

      it('should always return total count regardless of page', () => {
        expect(paginateMockData(mockBlogPosts, 1, 2).count).toBe(6);
        expect(paginateMockData(mockBlogPosts, 2, 2).count).toBe(6);
        expect(paginateMockData(mockBlogPosts, 100, 2).count).toBe(6);
      });
    });
  });
});
