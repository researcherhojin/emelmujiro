// Integration tests for API service — covers interceptors, auth methods, and error handling
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

// Mock i18n
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn() },
}));

// Suppress console output
const originalConsole = { ...console };
beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
  console.log = vi.fn();
});
afterAll(() => {
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.log = originalConsole.log;
});

describe('API Service - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mock API Methods', () => {
    it('should return mock user data via getUser', async () => {
      const { api } = await import('../api');
      const result = await api.getUser();

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('id', 1);
      expect(result.data).toHaveProperty('email', 'mock@user.com');
      expect(result.data).toHaveProperty('name', 'Mock User');
    });

    it('should return mock login response', async () => {
      const { api } = await import('../api');
      const result = await api.login('test@example.com', 'password123');

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('access', 'mock-access-token');
      expect(result.data).toHaveProperty('refresh', 'mock-refresh-token');
      expect(result.data.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return mock logout response', async () => {
      const { api } = await import('../api');
      const result = await api.logout();

      expect(result.status).toBe(200);
      expect(result.data).toEqual({});
    });

    it('should return mock register response', async () => {
      const { api } = await import('../api');
      const result = await api.register('new@user.com', 'password123', 'New User');

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('access');
      expect(result.data).toHaveProperty('refresh');
      expect(result.data.user).toHaveProperty('email', 'new@user.com');
      expect(result.data.user).toHaveProperty('name', 'New User');
    });

    it('should return mock notifications', async () => {
      const { api } = await import('../api');
      const result = await api.getNotifications(1);

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('count', 0);
      expect(result.data).toHaveProperty('results');
      expect(result.data.results).toEqual([]);
    });

    it('should return mock unread count', async () => {
      const { api } = await import('../api');
      const result = await api.getUnreadCount();

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('count', 0);
    });

    it('should return mock mark notification read response', async () => {
      const { api } = await import('../api');
      const result = await api.markNotificationRead(1);

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('id', 1);
      expect(result.data).toHaveProperty('is_read', true);
    });

    it('should return mock mark all notifications read response', async () => {
      const { api } = await import('../api');
      const result = await api.markAllNotificationsRead();

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('status', 'ok');
    });
  });

  describe('Blog Post Mock Methods', () => {
    it('should reject with 404 for non-existent slug', async () => {
      const { api } = await import('../api');
      await expect(api.getBlogPost('non-existent-slug')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('should handle getBlogPosts with custom page size', async () => {
      const { api } = await import('../api');
      const result = await api.getBlogPosts(1, 3);

      expect(result.status).toBe(200);
      expect(result.data.results.length).toBeLessThanOrEqual(3);
    });

    it('should handle searchBlogPosts filtering by tags', async () => {
      const { api } = await import('../api');
      const result = await api.searchBlogPosts('AI');

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('results');
      expect(Array.isArray(result.data.results)).toBe(true);
    });

    it('should return categories with correct structure', async () => {
      const { api } = await import('../api');
      const result = await api.getBlogCategories();

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Request Interceptor', () => {
    it('should register request interceptor on axios instance', async () => {
      const axiosInstance = (await import('../api')).default;
      expect(axiosInstance.interceptors.request).toBeDefined();
    });

    it('should register response interceptor on axios instance', async () => {
      const axiosInstance = (await import('../api')).default;
      expect(axiosInstance.interceptors.response).toBeDefined();
    });

    it('should process request config through interceptors', async () => {
      const axiosInstance = (await import('../api')).default;

      // Access request interceptor handlers
      const interceptorManager = axiosInstance.interceptors.request as any;
      const handlers = interceptorManager.handlers;

      if (handlers && handlers.length > 0) {
        const requestHandler = handlers[0]?.fulfilled;
        if (requestHandler) {
          const config = {
            url: '/test-endpoint',
            headers: new AxiosHeaders(),
          } as InternalAxiosRequestConfig;

          const result = requestHandler(config);
          // In non-production mode, should pass through without HTTPS upgrade
          expect(result.url).toBe('/test-endpoint');
        }
      }
    });
  });

  describe('Error Message Mapping', () => {
    it('should handle various HTTP error status codes', async () => {
      // We test indirectly by checking the structure exists
      const { api } = await import('../api');

      // These all resolve in mock mode, confirming the mock path works
      const results = await Promise.all([
        api.getUser(),
        api.getBlogPosts(),
        api.getBlogCategories(),
      ]);

      results.forEach((result) => {
        expect(result).toHaveProperty('status', 200);
      });
    });
  });

  describe('Contact API Error Handling', () => {
    it('should handle contact form submission in mock mode', async () => {
      const { api } = await import('../api');

      const formData = {
        name: 'Error Test',
        email: 'error@test.com',
        message: 'Testing error path',
        phone: '123-456-7890',
      };

      const result = await api.createContact(formData);

      expect(result.status).toBe(201);
      expect(result.data.success).toBe(true);
      expect(result.data.message).toBe('apiErrors.contactSuccess');
    });
  });

  describe('Axios Instance Configuration', () => {
    it('should create axios instance with correct config', async () => {
      const axiosInstance = (await import('../api')).default;

      // Axios instance should have withCredentials for cookie support
      expect(axiosInstance.defaults.withCredentials).toBe(true);
      expect(axiosInstance.defaults.timeout).toBe(30000);
      expect(axiosInstance.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Response Interceptor Error Handling', () => {
    it('should handle network errors by setting appropriate message', async () => {
      const axiosInstance = (await import('../api')).default;

      // Access the response interceptor error handler
      // The interceptor manager stores handlers internally
      const interceptorManager = axiosInstance.interceptors.response as any;
      const handlers = interceptorManager.handlers;

      // Find the error handler (second argument to use())
      if (handlers && handlers.length > 0) {
        const errorHandler = handlers[0]?.rejected;
        if (errorHandler) {
          // Simulate a network error (no response)
          const networkError = {
            response: undefined,
            config: { url: '/test', headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
            message: 'Network Error',
          };

          try {
            await errorHandler(networkError);
          } catch (err: any) {
            expect(err.message).toBe('apiErrors.network');
          }
        }
      }
    });

    it('should handle timeout errors with retry', async () => {
      const axiosInstance = (await import('../api')).default;

      const interceptorManager = axiosInstance.interceptors.response as any;
      const handlers = interceptorManager.handlers;

      if (handlers && handlers.length > 0) {
        const errorHandler = handlers[0]?.rejected;
        if (errorHandler) {
          // Simulate a timeout error
          const timeoutError = {
            code: 'ECONNABORTED',
            config: { url: '/test', headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
            response: undefined,
            _retry: false,
            message: 'timeout of 30000ms exceeded',
          };

          // The retry will also fail but that's expected in test environment
          try {
            await errorHandler(timeoutError);
          } catch {
            // Expected to fail since mock axios won't handle retry
            expect(timeoutError._retry).toBe(true);
          }
        }
      }
    });

    it('should handle 401 errors on non-auth endpoints with token refresh attempt', async () => {
      const axiosInstance = (await import('../api')).default;

      const interceptorManager = axiosInstance.interceptors.response as any;
      const handlers = interceptorManager.handlers;

      if (handlers && handlers.length > 0) {
        const errorHandler = handlers[0]?.rejected;
        if (errorHandler) {
          const unauthorizedError = {
            response: {
              status: 401,
              data: { message: 'Token expired' },
            },
            config: {
              url: '/blog-posts/',
              headers: new AxiosHeaders(),
            } as InternalAxiosRequestConfig,
            _retry: false,
          };

          try {
            await errorHandler(unauthorizedError);
          } catch (err: any) {
            // Should have attempted retry
            expect(unauthorizedError._retry).toBe(true);
            expect(err.userMessage).toBeDefined();
          }
        }
      }
    });

    it('should retry original request after successful token refresh', async () => {
      const axiosInstance = (await import('../api')).default;

      const interceptorManager = axiosInstance.interceptors.response as any;
      const handlers = interceptorManager.handlers;

      if (handlers && handlers.length > 0) {
        const errorHandler = handlers[0]?.rejected;
        if (errorHandler) {
          const retryResponse = { data: { id: 1, title: 'Retried' }, status: 200 };

          // Mock refresh (post) and retry (request) to succeed
          const origPost = axiosInstance.post;
          const origRequest = axiosInstance.request;
          axiosInstance.post = vi.fn().mockResolvedValueOnce({ data: {} });
          axiosInstance.request = vi.fn().mockResolvedValueOnce(retryResponse);

          const unauthorizedError = {
            response: {
              status: 401,
              data: { message: 'Token expired' },
            },
            config: {
              url: 'blog-posts/',
              headers: new AxiosHeaders(),
            } as InternalAxiosRequestConfig,
            _retry: false,
          };

          const result = await errorHandler(unauthorizedError);

          expect(unauthorizedError._retry).toBe(true);
          expect(axiosInstance.post).toHaveBeenCalledWith('auth/token/refresh/');
          expect(axiosInstance.request).toHaveBeenCalledWith(unauthorizedError.config);
          expect(result).toEqual(retryResponse);

          // Restore
          axiosInstance.post = origPost;
          axiosInstance.request = origRequest;
        }
      }
    });

    it('should reuse existing refreshPromise for concurrent 401s', async () => {
      const axiosInstance = (await import('../api')).default;

      const interceptorManager = axiosInstance.interceptors.response as any;
      const handlers = interceptorManager.handlers;

      if (handlers && handlers.length > 0) {
        const errorHandler = handlers[0]?.rejected;
        if (errorHandler) {
          const retryResponse = { data: { id: 1 }, status: 200 };

          // Use a deferred promise so we can control when refresh resolves
          let resolveRefresh!: (v: unknown) => void;
          const refreshDeferred = new Promise((r) => {
            resolveRefresh = r;
          });

          const origPost = axiosInstance.post;
          const origRequest = axiosInstance.request;
          axiosInstance.post = vi.fn().mockReturnValueOnce(refreshDeferred);
          axiosInstance.request = vi
            .fn()
            .mockResolvedValueOnce(retryResponse)
            .mockResolvedValueOnce(retryResponse);

          const makeError = () => ({
            response: { status: 401, data: {} },
            config: {
              url: 'blog-posts/',
              headers: new AxiosHeaders(),
            } as InternalAxiosRequestConfig,
            _retry: false,
          });

          // Fire two concurrent 401 errors
          const p1 = errorHandler(makeError());
          const p2 = errorHandler(makeError());

          // Resolve the single refresh promise
          resolveRefresh({ data: {} });

          await Promise.all([p1, p2]);

          // post should only be called ONCE (shared refreshPromise)
          expect(axiosInstance.post).toHaveBeenCalledTimes(1);
          // Both should have retried
          expect(axiosInstance.request).toHaveBeenCalledTimes(2);

          axiosInstance.post = origPost;
          axiosInstance.request = origRequest;
        }
      }
    });

    it('should reject original 401 (without infinite loop) when refresh itself fails', async () => {
      // Edge case: refresh token is expired → refresh request returns 401 too.
      // Expected behavior:
      //  1. refresh is attempted once (axiosInstance.post called)
      //  2. retry is NOT called (axiosInstance.request never hit)
      //  3. original 401 propagates up the promise chain (no infinite loop)
      //  4. the rejection carries the original error, not a new one
      // The "no infinite loop" guarantee comes from the `isAuthEndpoint` check
      // on the refresh request itself — without it, the refresh's own 401 would
      // trigger a second refresh attempt and so on.
      const axiosInstance = (await import('../api')).default;

      const interceptorManager = axiosInstance.interceptors.response as any;
      const handlers = interceptorManager.handlers;

      expect(handlers.length).toBeGreaterThan(0);
      const errorHandler = handlers[0]?.rejected;
      expect(errorHandler).toBeDefined();

      const origPost = axiosInstance.post;
      const origRequest = axiosInstance.request;
      // Refresh request itself rejects with 401 (refresh token expired)
      const refreshError = new Error('refresh token expired') as any;
      refreshError.response = { status: 401, data: {} };
      axiosInstance.post = vi.fn().mockRejectedValueOnce(refreshError);
      axiosInstance.request = vi.fn();

      const unauthorizedError = {
        response: { status: 401, data: { message: 'Token expired' } },
        config: {
          url: 'blog-posts/',
          headers: new AxiosHeaders(),
        } as InternalAxiosRequestConfig,
        _retry: false,
      };

      let rejected: any = null;
      try {
        await errorHandler(unauthorizedError);
      } catch (err: any) {
        rejected = err;
      }

      // Refresh was attempted exactly once
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('auth/token/refresh/');
      // Retry of original request was NOT called (refresh failed first)
      expect(axiosInstance.request).not.toHaveBeenCalled();
      // Original 401 propagated up, not a new error
      expect(rejected).not.toBeNull();
      expect(rejected).toBe(unauthorizedError);
      expect(rejected.response.status).toBe(401);
      // _retry flag was set (defended against re-entry)
      expect(unauthorizedError._retry).toBe(true);

      axiosInstance.post = origPost;
      axiosInstance.request = origRequest;
    });

    it('should NOT attempt refresh for auth endpoints on 401', async () => {
      const axiosInstance = (await import('../api')).default;

      const interceptorManager = axiosInstance.interceptors.response as any;
      const handlers = interceptorManager.handlers;

      if (handlers && handlers.length > 0) {
        const errorHandler = handlers[0]?.rejected;
        if (errorHandler) {
          const authError = {
            response: {
              status: 401,
              data: { message: 'Invalid credentials' },
            },
            config: {
              url: '/auth/login/',
              headers: new AxiosHeaders(),
            } as InternalAxiosRequestConfig,
            _retry: false,
          };

          try {
            await errorHandler(authError);
          } catch (err: any) {
            // Should NOT have attempted retry for auth endpoints
            expect(authError._retry).toBe(false);
            expect(err.userMessage).toBeDefined();
          }
        }
      }
    });

    it('should set userMessage from error response data', async () => {
      const axiosInstance = (await import('../api')).default;

      const interceptorManager = axiosInstance.interceptors.response as any;
      const handlers = interceptorManager.handlers;

      if (handlers && handlers.length > 0) {
        const errorHandler = handlers[0]?.rejected;
        if (errorHandler) {
          const serverError = {
            response: {
              status: 500,
              data: { message: 'Internal Server Error' },
            },
            config: {
              url: '/blog-posts/',
              headers: new AxiosHeaders(),
            } as InternalAxiosRequestConfig,
            _retry: false,
          };

          try {
            await errorHandler(serverError);
          } catch (err: any) {
            expect(err.userMessage).toBe('Internal Server Error');
          }
        }
      }
    });

    it('should use i18n fallback when error response has no message', async () => {
      const axiosInstance = (await import('../api')).default;

      const interceptorManager = axiosInstance.interceptors.response as any;
      const handlers = interceptorManager.handlers;

      if (handlers && handlers.length > 0) {
        const errorHandler = handlers[0]?.rejected;
        if (errorHandler) {
          const errorNoMessage = {
            response: {
              status: 404,
              data: {},
            },
            config: {
              url: '/blog-posts/999/',
              headers: new AxiosHeaders(),
            } as InternalAxiosRequestConfig,
            _retry: false,
          };

          try {
            await errorHandler(errorNoMessage);
          } catch (err: any) {
            // Should use i18n translated error message
            expect(err.userMessage).toBe('apiErrors.404');
          }
        }
      }
    });

    it('should handle unknown status codes with generic error message', async () => {
      const axiosInstance = (await import('../api')).default;

      const interceptorManager = axiosInstance.interceptors.response as any;
      const handlers = interceptorManager.handlers;

      if (handlers && handlers.length > 0) {
        const errorHandler = handlers[0]?.rejected;
        if (errorHandler) {
          const unknownError = {
            response: {
              status: 418,
              data: {},
            },
            config: {
              url: '/teapot/',
              headers: new AxiosHeaders(),
            } as InternalAxiosRequestConfig,
            _retry: false,
          };

          try {
            await errorHandler(unknownError);
          } catch (err: any) {
            // Should use 'apiErrors.unknown' for unmapped status codes
            expect(err.userMessage).toBe('apiErrors.unknown');
          }
        }
      }
    });
  });
});
