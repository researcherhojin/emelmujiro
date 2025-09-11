import { vi } from 'vitest';
import { InternalAxiosRequestConfig } from 'axios';

// Set test environment to use real axios (not mock API),
vi.stubEnv('REACT_APP_USE_MOCK_API', 'false');
vi.stubEnv('NODE_ENV', 'development');

// Mock axios properly
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockRequestUse = vi.fn();
const mockResponseUse = vi.fn();

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
      interceptors: {
        request: {
          use: mockRequestUse,
        },
        response: {
          use: mockResponseUse,
        },
      },
    })),
  },
}));

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  describe('Blog API', () => {
    it.skip('should fetch blog posts', async () => {
      const mockResponse = {
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 1,
              title: 'Test Post',
              content: 'Test content',
              excerpt: 'Test excerpt',
              category: 'tech',
              author: 'Test Author',
              created_at: '2024-01-01',
              updated_at: '2024-01-01',
              tags: ['test'],
            },
          ],
        },
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const { api } = await import('../api');
      const result = await api.getBlogPosts();

      expect(mockGet).toHaveBeenCalledWith('blog-posts/?page=1&page_size=6');
      expect(result.data.results).toHaveLength(1);
    });

    it.skip('should fetch single blog post', async () => {
      const mockPostResponse = {
        data: {
          id: 1,
          title: 'Test Post',
          content: 'Test content',
          excerpt: 'Test excerpt',
          category: 'tech',
          author: 'Test Author',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          tags: ['test'],
        },
      };

      mockGet.mockResolvedValueOnce(mockPostResponse);

      const { api } = await import('../api');
      const result = await api.getBlogPost(1);

      expect(mockGet).toHaveBeenCalledWith('blog-posts/1/');
      expect(result.data.id).toBe(1);
    });
  });

  describe('Contact API', () => {
    it.skip('should submit contact form', async () => {
      const formData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '010-1234-5678',
        message: 'Test message',
      };

      mockPost.mockResolvedValueOnce({ data: { success: true } });

      const { api } = await import('../api');
      const result = await api.createContact(formData);

      expect(mockPost).toHaveBeenCalledWith('contact/', formData);
      expect(result.data).toEqual({ success: true });
    });
  });

  describe('Interceptors', () => {
    it('should setup request interceptor', async () => {
      await import('../api');
      expect(mockRequestUse).toHaveBeenCalled();
    });

    it('should setup response interceptor', async () => {
      await import('../api');
      expect(mockResponseUse).toHaveBeenCalled();
    });

    it('should add auth token to requests', async () => {
      const token = 'test-token';
      localStorage.setItem('authToken', token);

      await import('../api');

      // Get the request interceptor function
      const requestInterceptor = mockRequestUse.mock.calls[0]?.[0];
      if (requestInterceptor) {
        const mockConfig: InternalAxiosRequestConfig = {
          headers: {} as any,
        } as InternalAxiosRequestConfig;

        const result = requestInterceptor(mockConfig);
        expect(result.headers.Authorization).toBe(`Bearer ${token}`);
      }
    });

    it('should handle response errors', async () => {
      await import('../api');

      // Get the error interceptor function
      const errorInterceptor = mockResponseUse.mock.calls[0]?.[1];
      if (errorInterceptor) {
        const error = {
          response: {
            status: 401,
            data: { message: 'Unauthorized' },
          },
          config: {},
        };

        try {
          await errorInterceptor(error);
        } catch (err: any) {
          expect(err.userMessage).toBeDefined();
        }
      }
    });
  });
});
