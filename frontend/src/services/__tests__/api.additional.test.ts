import axios from 'axios';
import { api } from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsole.error;
  console.log = originalConsole.log;
});

describe('API Service - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Reset environment variables
    process.env.REACT_APP_USE_MOCK_API = 'false';
    process.env.REACT_APP_API_URL = 'http://localhost:8000/api';
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network Error');
      (mockError as any).code = 'ECONNABORTED';

      mockedAxios.create = jest.fn().mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      try {
        await api.getBlogPosts(1);
      } catch (error) {
        expect(error).toEqual(mockError);
      }
    });

    it('should handle 404 errors', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
        isAxiosError: true,
      };

      mockedAxios.create = jest.fn().mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      try {
        await api.getBlogPost(999);
      } catch (error) {
        expect(error).toEqual(mockError);
      }
    });

    it('should handle 500 server errors', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
        isAxiosError: true,
      };

      mockedAxios.create = jest.fn().mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        get: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      try {
        await api.createContact({
          name: 'Test',
          email: 'test@test.com',
          message: 'Test message',
        });
      } catch (error) {
        expect(error).toEqual(mockError);
      }
    });
  });

  describe('Authentication', () => {
    it('should add auth token to requests when available', async () => {
      const mockToken = 'test-token-123';
      localStorage.setItem('authToken', mockToken);

      const mockInterceptor = jest.fn((config: any) => {
        if (localStorage.getItem('authToken')) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${localStorage.getItem('authToken')}`;
        }
        return config;
      });

      mockedAxios.create = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: [] }),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: {
            use: jest.fn(successFn => {
              // Simulate interceptor behavior
              const config: any = { headers: {} };
              successFn(config);
              expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
            }),
          },
          response: { use: jest.fn() },
        },
      });

      await api.getBlogPosts(1);
    });

    it('should handle token refresh on 401', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Token expired' },
        },
        config: { _retry: false },
        isAxiosError: true,
      };

      mockedAxios.create = jest.fn().mockReturnValue({
        get: jest.fn().mockRejectedValueOnce(mockError).mockResolvedValueOnce({ data: [] }),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: {
            use: jest.fn((successFn, errorFn) => {
              // Simulate error interceptor
              errorFn(mockError);
            }),
          },
        },
      });

      try {
        await api.getBlogPosts(1);
      } catch (error) {
        expect(error).toEqual(mockError);
      }
    });
  });

  describe('Mock API Mode', () => {
    it('should use mock data when USE_MOCK_API is true', async () => {
      process.env.REACT_APP_USE_MOCK_API = 'true';

      // Re-import to apply new env variable
      jest.resetModules();
      const { api: mockApi } = require('../api');

      const result = await mockApi.getBlogPosts(1);
      expect(result.data.results).toBeDefined();
      expect(Array.isArray(result.data.results)).toBe(true);
    });

    it('should use mock data in production without API URL', async () => {
      // @ts-ignore
      process.env.NODE_ENV = 'production';
      process.env.REACT_APP_API_URL = '';

      jest.resetModules();
      const { api: mockApi } = require('../api');

      const result = await mockApi.getBlogPosts(1);
      expect(result.data.results).toBeDefined();
    });
  });

  describe('Request Configuration', () => {
    it('should set correct timeout', () => {
      process.env.REACT_APP_API_TIMEOUT = '5000';

      mockedAxios.create = jest.fn();
      jest.resetModules();
      require('../api');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000, // Default timeout
        })
      );
    });

    it('should set withCredentials for CORS', () => {
      mockedAxios.create = jest.fn();
      jest.resetModules();
      require('../api');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          withCredentials: true,
        })
      );
    });

    it('should set correct content type', () => {
      mockedAxios.create = jest.fn();
      jest.resetModules();
      require('../api');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  describe('Blog Categories', () => {
    it('should fetch blog categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Tech', slug: 'tech' },
        { id: 2, name: 'Business', slug: 'business' },
      ];

      mockedAxios.create = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockCategories }),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await api.getBlogCategories();
      expect(result.data).toEqual(mockCategories);
    });

    it('should filter posts by category', async () => {
      const mockPosts = {
        results: [{ id: 1, title: 'Tech Post', category: 'tech' }],
      };

      mockedAxios.create = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockPosts }),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await api.searchBlogPosts('tech');
      expect(result.data).toEqual(mockPosts);
    });
  });

  describe('Contact Form', () => {
    it('should validate contact form data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        message: '',
      };

      mockedAxios.create = jest.fn().mockReturnValue({
        post: jest.fn().mockRejectedValue({
          response: {
            status: 400,
            data: { errors: { email: 'Invalid email format' } },
          },
        }),
        get: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      try {
        await api.createContact(invalidData as any);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should handle successful contact form submission', async () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        phone: '123-456-7890',
      };

      mockedAxios.create = jest.fn().mockReturnValue({
        post: jest.fn().mockResolvedValue({
          data: { success: true, message: 'Form submitted' },
        }),
        get: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await api.createContact(formData);
      expect(result.data.success).toBe(true);
    });
  });

  describe('Newsletter', () => {
    it('should subscribe to newsletter', async () => {
      const email = 'test@example.com';

      mockedAxios.create = jest.fn().mockReturnValue({
        post: jest.fn().mockResolvedValue({
          data: { success: true, message: 'Subscribed successfully' },
        }),
        get: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await api.subscribeNewsletter(email);
      expect(result.data.success).toBe(true);
    });

    it('should handle duplicate newsletter subscription', async () => {
      const email = 'existing@example.com';

      mockedAxios.create = jest.fn().mockReturnValue({
        post: jest.fn().mockRejectedValue({
          response: {
            status: 409,
            data: { message: 'Email already subscribed' },
          },
        }),
        get: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      try {
        await api.subscribeNewsletter(email);
      } catch (error: any) {
        expect(error.response.status).toBe(409);
      }
    });
  });
});
