import { BlogPost, ContactFormData } from '../index';

describe('Type definitions', () => {
  describe('BlogPost type', () => {
    it('should create valid BlogPost object', () => {
      const post: BlogPost = {
        id: 1,
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        description: 'Test excerpt',
        author: 'Test Author',
        date: '2024-01-01',
        image_url: '/image.jpg',
        tags: ['test', 'typescript'],
        category: 'Technology',
        view_count: 100,
        likes: 10,
      };

      expect(post.id).toBe(1);
      expect(post.title).toBe('Test Post');
      expect(post.tags).toHaveLength(2);
    });

    it('should allow optional fields', () => {
      const minimalPost: BlogPost = {
        id: 1,
        title: 'Minimal Post',
        slug: 'minimal-post',
        content: 'Content',
        description: 'Excerpt',
        author: 'Author',
        date: '2024-01-01',
      };

      expect(minimalPost.image_url).toBeUndefined();
      expect(minimalPost.tags).toBeUndefined();
      expect(minimalPost.category).toBeUndefined();
    });
  });

  describe('ContactFormData type', () => {
    it('should create valid ContactFormData object', () => {
      const formData: ContactFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '010-1234-5678',
        company: 'Test Company',
        subject: 'Inquiry',
        message: 'Test message',
      };

      expect(formData.name).toBe('John Doe');
      expect(formData.email).toBe('john@example.com');
      expect(formData.message).toBe('Test message');
    });

    it('should allow optional fields', () => {
      const minimalFormData: ContactFormData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Message',
      };

      expect(minimalFormData.phone).toBeUndefined();
      expect(minimalFormData.company).toBeUndefined();
      expect(minimalFormData.subject).toBeUndefined();
    });
  });

  describe('Type guards', () => {
    it('should correctly identify BlogPost type', () => {
      const post = {
        id: 1,
        title: 'Test',
        slug: 'test',
        content: 'Content',
        description: 'Excerpt',
        author: 'Author',
        date: '2024-01-01',
      };

      const isBlogPost = (obj: unknown): obj is BlogPost => {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'id' in obj &&
          'title' in obj &&
          'content' in obj
        );
      };

      expect(isBlogPost(post)).toBe(true);
      expect(isBlogPost({})).toBe(false);
      expect(isBlogPost(null)).toBe(false);
    });

    it('should correctly identify ContactFormData type', () => {
      const formData = {
        name: 'Test',
        email: 'test@example.com',
        message: 'Message',
      };

      const isContactFormData = (obj: unknown): obj is ContactFormData => {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'name' in obj &&
          'email' in obj &&
          'message' in obj
        );
      };

      expect(isContactFormData(formData)).toBe(true);
      expect(isContactFormData({ name: 'Test' })).toBe(false);
    });
  });

  describe('Array types', () => {
    it('should handle array of BlogPosts', () => {
      const posts: BlogPost[] = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          content: 'Content 1',
          description: 'Excerpt 1',
          author: 'Author 1',
          date: '2024-01-01',
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          content: 'Content 2',
          description: 'Excerpt 2',
          author: 'Author 2',
          date: '2024-01-02',
        },
      ];

      expect(posts).toHaveLength(2);
      expect(posts[0].title).toBe('Post 1');
      expect(posts[1].title).toBe('Post 2');
    });
  });

  describe('Union types', () => {
    it('should handle union types correctly', () => {
      type Status = 'draft' | 'published' | 'archived';

      const statuses: Status[] = ['draft', 'published', 'archived'];

      expect(statuses).toContain('draft');
      expect(statuses).toContain('published');
      expect(statuses).toContain('archived');
    });

    it('should handle discriminated unions', () => {
      type ApiResponse<T> = { status: 'success'; data: T } | { status: 'error'; error: string };

      const successResponse: ApiResponse<BlogPost> = {
        status: 'success',
        data: {
          id: 1,
          title: 'Success',
          slug: 'success',
          content: 'Content',
          description: 'Excerpt',
          author: 'Author',
          date: '2024-01-01',
        },
      };

      const errorResponse: ApiResponse<BlogPost> = {
        status: 'error',
        error: 'Something went wrong',
      };

      expect(successResponse.status).toBe('success');
      expect(errorResponse.status).toBe('error');
    });
  });
});
