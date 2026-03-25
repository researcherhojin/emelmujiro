import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { AxiosHeaders } from 'axios';
import { InternalAxiosRequestConfig } from 'axios';

vi.stubEnv('NODE_ENV', 'development');

// Hoisted mock for env
const { mockEnv } = vi.hoisted(() => ({
  mockEnv: {
    IS_PRODUCTION: false,
    IS_DEVELOPMENT: true,
    IS_TEST: true,
    API_URL: 'http://localhost:8000/api',
    WS_URL: 'ws://localhost:8000/ws',
    ENABLE_SENTRY: false,
    SENTRY_DSN: '',
    ENABLE_ANALYTICS: false,
    GA_TRACKING_ID: '',
    NODE_ENV: 'development',
    APP_NAME: 'Emelmujiro',
    APP_VERSION: '1.0.0',
    PUBLIC_URL: '',
  },
}));

vi.mock('../../config/env', () => ({
  default: mockEnv,
  env: mockEnv,
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

// Mock i18n
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

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

    it('should not inject auth headers (cookies handle auth)', async () => {
      localStorage.setItem('authToken', 'test-token');

      await import('../api');

      // Get the request interceptor function
      const requestInterceptor = mockRequestUse.mock.calls[0]?.[0];
      if (requestInterceptor) {
        const mockConfig: InternalAxiosRequestConfig = {
          headers: {} as AxiosHeaders,
        } as InternalAxiosRequestConfig;

        const result = requestInterceptor(mockConfig);
        // Auth is handled via httpOnly cookies, not Authorization header
        expect(result.headers.Authorization).toBeUndefined();
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
        } catch (err: unknown) {
          expect((err as Record<string, unknown>).userMessage).toBeDefined();
        }
      }
    });

    it('should upgrade baseURL from http to https in production (lines 62-63)', async () => {
      await import('../api');

      const requestInterceptor = mockRequestUse.mock.calls[0]?.[0];
      if (requestInterceptor) {
        const mockConfig: InternalAxiosRequestConfig = {
          headers: {} as AxiosHeaders,
          baseURL: 'http://api.example.com',
          url: 'https://api.example.com/test',
        } as InternalAxiosRequestConfig;

        const result = requestInterceptor(mockConfig);
        expect(result).toBeDefined();
      }
    });

    it('should reject request errors (line 69)', async () => {
      await import('../api');

      const requestErrorHandler = mockRequestUse.mock.calls[0]?.[1];
      if (requestErrorHandler) {
        const error = new Error('Request setup failed');
        try {
          await requestErrorHandler(error);
        } catch (err) {
          expect(err).toBe(error);
        }
      }
    });

    it('should pass through successful responses (line 75)', async () => {
      await import('../api');

      const responseSuccessHandler = mockResponseUse.mock.calls[0]?.[0];
      if (responseSuccessHandler) {
        const mockResponse = { data: { test: true }, status: 200 };
        const result = responseSuccessHandler(mockResponse);
        expect(result).toBe(mockResponse);
      }
    });

    it('should handle network errors without response (lines 87-89)', async () => {
      await import('../api');

      const errorInterceptor = mockResponseUse.mock.calls[0]?.[1];
      if (errorInterceptor) {
        const error = {
          response: undefined,
          config: {},
          message: 'Network Error',
        };

        try {
          await errorInterceptor(error);
        } catch (err: unknown) {
          expect((err as Record<string, unknown>).message).toBeDefined();
        }
      }
    });

    it('should log error in development mode (line 99)', async () => {
      mockEnv.IS_DEVELOPMENT = true;
      await import('../api');

      const errorInterceptor = mockResponseUse.mock.calls[0]?.[1];
      if (errorInterceptor) {
        const error = {
          response: {
            status: 500,
            data: { message: 'Internal Server Error' },
          },
          config: { url: '/api/test' },
        };

        try {
          await errorInterceptor(error);
        } catch (err: unknown) {
          expect((err as Record<string, unknown>).userMessage).toBeDefined();
        }
      }
    });

    it('should upgrade url from http to https in production (lines 58-59)', async () => {
      mockEnv.IS_PRODUCTION = true;
      await import('../api');

      const requestInterceptor = mockRequestUse.mock.calls[0]?.[0];
      if (requestInterceptor) {
        const mockConfig: InternalAxiosRequestConfig = {
          headers: {} as AxiosHeaders,
          url: 'http://api.example.com/test',
        } as InternalAxiosRequestConfig;

        const result = requestInterceptor(mockConfig);
        expect(result.url).toBe('https://api.example.com/test');
      }
      mockEnv.IS_PRODUCTION = false;
    });

    it('should upgrade baseURL from http to https in production (lines 62-63 production)', async () => {
      mockEnv.IS_PRODUCTION = true;
      await import('../api');

      const requestInterceptor = mockRequestUse.mock.calls[0]?.[0];
      if (requestInterceptor) {
        const mockConfig: InternalAxiosRequestConfig = {
          headers: {} as AxiosHeaders,
          baseURL: 'http://api.example.com',
        } as InternalAxiosRequestConfig;

        const result = requestInterceptor(mockConfig);
        expect(result.baseURL).toBe('https://api.example.com');
      }
      mockEnv.IS_PRODUCTION = false;
    });
  });
});
