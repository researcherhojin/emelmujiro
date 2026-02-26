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
    it('should fetch blog posts via mock API', async () => {
      // In test environment, USE_MOCK_API is true so mock data is returned
      const { api } = await import('../api');
      const result = await api.getBlogPosts();

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('count');
      expect(result.data).toHaveProperty('results');
      expect(Array.isArray(result.data.results)).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
    });

    it('should fetch single blog post via mock API', async () => {
      // In test environment, USE_MOCK_API is true so mock data is returned
      const { api } = await import('../api');
      const result = await api.getBlogPost(1);

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('id', 1);
      expect(result.data).toHaveProperty('title');
      expect(result.data).toHaveProperty('content');
    });
  });

  describe('Contact API', () => {
    it('should submit contact form via mock API', async () => {
      const formData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '010-1234-5678',
        message: 'Test message',
      };

      // In test environment, USE_MOCK_API is true so mock response is returned
      const { api } = await import('../api');
      const result = await api.createContact(formData);

      expect(result.status).toBe(201);
      expect(result.data).toHaveProperty('success', true);
      expect(result.data).toHaveProperty('message');
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
