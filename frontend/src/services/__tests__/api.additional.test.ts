// Test for additional API functionality
import { vi } from 'vitest';
// Since we're using GitHub Pages without a backend, all tests use mock data

import { api } from '../api';
import { BlogPost } from '../../types';

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  console.error = vi.fn();
  console.log = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalConsole.error;
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
});

describe('API Service - Mock Mode for GitHub Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Blog Operations', () => {
    it('should fetch blog posts with mock data', async () => {
      const result = await api.getBlogPosts(1);

      // Result should be a mock response
      expect(result).toHaveProperty('data');
      expect(result.data.results).toBeInstanceOf(Array);
      expect(result.data.results.length).toBeGreaterThan(0);

      // Check structure of mock blog posts
      const firstPost = result.data.results[0];
      expect(typeof firstPost.id).toBe('number');
      expect(firstPost.title).toEqual(expect.any(String));
      expect(firstPost.content).toEqual(expect.any(String));
    });

    it('should fetch single blog post with mock data', async () => {
      const result = await api.getBlogPost(1);

      expect(result).toHaveProperty('data');
      expect(typeof result.data.id).toBe('number');
      expect(result.data.title).toEqual(expect.any(String));
      expect(result.data.content).toEqual(expect.any(String));
    });

    it('should fetch blog categories with mock data', async () => {
      const result = await api.getBlogCategories();

      expect(result).toHaveProperty('data');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);

      // Check structure of categories
      const firstCategory = result.data[0];
      expect(firstCategory).toHaveProperty('id');
      expect(firstCategory).toHaveProperty('name');
      expect(firstCategory).toHaveProperty('slug');
    });

    it('should search blog posts with mock data', async () => {
      const result = await api.searchBlogPosts('tech');

      expect(result).toHaveProperty('data');
      expect(result.data.results).toBeInstanceOf(Array);
    });

    it('should handle pagination in mock data', async () => {
      const page1 = await api.getBlogPosts(1);
      const page2 = await api.getBlogPosts(2);

      expect(page1.data.results).toBeInstanceOf(Array);
      expect(page2.data.results).toBeInstanceOf(Array);

      // Check pagination metadata
      expect(page1.data).toHaveProperty('count');
      expect(page1.data).toHaveProperty('next');
      expect(page1.data).toHaveProperty('previous');
    });
  });

  describe('Contact Form Operations', () => {
    it('should submit contact form with mock response', async () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        phone: '123-456-7890',
      };

      const result = await api.createContact(formData);

      expect(result).toHaveProperty('data');
      expect(result.data.success).toBe(true);
      expect(result.data.name).toBe(formData.name);
      expect(result.data.email).toBe(formData.email);
    });

    it('should handle contact form with minimal data', async () => {
      const formData = {
        name: 'Jane',
        email: 'jane@test.com',
        message: 'Hello',
      };

      const result = await api.createContact(formData);

      expect(result).toHaveProperty('data');
      expect(result.data.success).toBe(true);
    });

    it('should handle contact form with all optional fields', async () => {
      const formData = {
        name: 'Test User',
        email: 'test@test.com',
        message: 'Detailed message',
        phone: '555-1234',
        company: 'Test Corp',
        subject: 'Inquiry',
      };

      const result = await api.createContact(formData);

      expect(result).toHaveProperty('data');
      expect(result.data.success).toBe(true);
    });
  });

  describe('Newsletter Operations', () => {
    it('should subscribe to newsletter with mock response', async () => {
      const email = 'subscriber@example.com';

      const result = await api.subscribeNewsletter(email);

      expect(result).toHaveProperty('data');
      expect(result.data.success).toBe(true);
      expect(result.data.message).toContain('성공');
    });

    it('should handle various email formats', async () => {
      const emails = [
        'test@example.com',
        'user.name@company.co.kr',
        'first+last@domain.org',
      ];

      for (const email of emails) {
        const result = await api.subscribeNewsletter(email);
        expect(result.data.success).toBe(true);
      }
    });
  });

  describe('Authentication Simulation', () => {
    it('should work with auth token in localStorage', async () => {
      localStorage.setItem('authToken', 'test-token-123');

      const result = await api.getBlogPosts(1);

      expect(result).toHaveProperty('data');
      expect(result.data.results).toBeInstanceOf(Array);
      // Should still work even with token (mock mode),
    });

    it('should work without auth token', async () => {
      localStorage.removeItem('authToken');

      const result = await api.getBlogPosts(1);

      expect(result).toHaveProperty('data');
      expect(result.data.results).toBeInstanceOf(Array);
      // Should work without token (mock mode),
    });
  });

  describe('Error Handling in Mock Mode', () => {
    it('should handle non-existent blog post gracefully', async () => {
      const result = await api.getBlogPost(99999);

      // In mock mode, should still return a post
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('id');
    });

    it('should handle empty search query', async () => {
      const result = await api.searchBlogPosts('');

      expect(result).toHaveProperty('data');
      expect(result.data.results).toBeInstanceOf(Array);
    });

    it('should handle special characters in search', async () => {
      const result = await api.searchBlogPosts('!@#$%^&*()');

      expect(result).toHaveProperty('data');
      expect(result.data.results).toBeInstanceOf(Array);
    });
  });

  describe('Data Consistency', () => {
    it('should return consistent mock data structure', async () => {
      const result1 = await api.getBlogPosts(1);
      const result2 = await api.getBlogPosts(1);

      // Structure should be consistent
      expect(Object.keys(result1.data)).toEqual(Object.keys(result2.data));
      expect(result1.data.results.length).toBe(result2.data.results.length);
    });

    it('should return valid dates in blog posts', async () => {
      const result = await api.getBlogPosts(1);

      result.data.results.forEach((post: BlogPost) => {
        const dateField = post.created_at || post.publishedAt;
        expect(dateField).toEqual(expect.any(String));
        const date = new Date(dateField);
        expect(date).toBeInstanceOf(Date);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });

    it('should return valid categories', async () => {
      const categories = await api.getBlogCategories();

      if (Array.isArray(categories.data)) {
        categories.data.forEach((category) => {
          if (typeof category === 'string') {
            expect(typeof category).toBe('string');
            expect(category.length).toBeGreaterThan(0);
          } else if (typeof category === 'object' && category !== null) {
            const cat = category as {
              id: string | number;
              name: string;
              slug: string;
            };
            expect(typeof cat.name).toBe('string');
            expect(typeof cat.slug).toBe('string');
            expect(cat.id).toEqual(expect.anything());
          }
        });
      }
    });
  });

  describe('Performance', () => {
    it('should return mock data quickly', async () => {
      const startTime = Date.now();
      await api.getBlogPosts(1);
      const endTime = Date.now();

      // Mock data should return almost instantly (< 100ms),
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = [
        api.getBlogPosts(1),
        api.getBlogPost(1),
        api.getBlogCategories(),
        api.searchBlogPosts('test'),
      ];

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result).toHaveProperty('data');
      });
    });
  });
});
