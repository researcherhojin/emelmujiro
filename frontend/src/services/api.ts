import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { BlogPost, ContactFormData, ErrorResponse } from '../types';
import logger from '../utils/logger';
import env from '../config/env';
import i18n from '../i18n';
import { mockBlogPosts, mockCategories, paginateMockData } from './mockData';

// Use centralized env config instead of direct process.env access
const API_URL = env.API_URL;
const API_TIMEOUT = 30000;

// Check if we should use mock API
// Mock is used in tests, or when no real backend URL is configured.
// When VITE_API_URL points to an actual deployed backend, mock is disabled.
const PLACEHOLDER_API = 'https://api.emelmujiro.com/api';
const USE_MOCK_API =
  env.IS_TEST || !env.API_URL || env.API_URL === PLACEHOLDER_API;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CORS cookie support
});

// Error message mapping (i18n)
const getErrorMessage = (status: number): string => {
  const errorKeys: Record<number, string> = {
    400: 'apiErrors.400',
    401: 'apiErrors.401',
    403: 'apiErrors.403',
    404: 'apiErrors.404',
    429: 'apiErrors.429',
    500: 'apiErrors.500',
    502: 'apiErrors.502',
    503: 'apiErrors.503',
  };
  return i18n.t(errorKeys[status] || 'apiErrors.unknown');
};

// Custom error interface
interface CustomAxiosError extends AxiosError {
  userMessage?: string;
  _retry?: boolean;
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Security: Always use HTTPS in production
    if (env.IS_PRODUCTION && config.url && config.url.startsWith('http://')) {
      logger.warn('Insecure HTTP detected in production, upgrading to HTTPS');
      config.url = config.url.replace('http://', 'https://');
    }
    if (
      env.IS_PRODUCTION &&
      config.baseURL &&
      config.baseURL.startsWith('http://')
    ) {
      logger.warn(
        'Insecure HTTP in baseURL detected in production, upgrading to HTTPS'
      );
      config.baseURL = config.baseURL.replace('http://', 'https://');
    }

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: CustomAxiosError) => {
    const originalRequest = error.config;

    // Handle timeout errors
    if (error.code === 'ECONNABORTED' && originalRequest && !error._retry) {
      error._retry = true;
      logger.warn('Request timeout, retrying...');
      return axiosInstance(originalRequest);
    }

    // Handle network errors
    if (!error.response) {
      error.message = i18n.t('apiErrors.network');
      return Promise.reject(error);
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    const errorData = data as ErrorResponse;
    error.userMessage = errorData?.message || getErrorMessage(status);

    // Log error in development
    if (env.IS_DEVELOPMENT) {
      logger.error('API Error:', `${status} ${error.userMessage}`);
    }

    // Handle 401 - Try refresh token, then clear auth
    if (status === 401 && originalRequest && !error._retry) {
      error._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${API_URL}/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          const { access } = refreshResponse.data;
          localStorage.setItem('authToken', access);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return axiosInstance(originalRequest);
        } catch {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      } else {
        localStorage.removeItem('authToken');
      }
    }

    return Promise.reject(error);
  }
);

// API response interfaces
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API methods with improved error handling
export const api = {
  // Blog
  getBlogPosts: (page: number = 1, pageSize?: number) => {
    const size = pageSize || 6;

    // Use mock data if backend is not available
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: paginateMockData(mockBlogPosts, page, size),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }

    return axiosInstance.get<PaginatedResponse<BlogPost>>(
      `blog-posts/?page=${page}&page_size=${size}`
    );
  },
  getBlogPost: (id: number | string) => {
    if (USE_MOCK_API) {
      const post = mockBlogPosts.find(
        (p) => p.id === Number(id) || p.slug === id
      );
      if (!post) {
        // Instead of rejecting, return a default post for testing
        const defaultPost = {
          ...mockBlogPosts[0],
          id: Number(id) || 99999,
          title: `Mock Post ${id}`,
          content: `This is mock content for post ${id}`,
        };
        return Promise.resolve({
          data: {
            ...defaultPost,
            createdAt: defaultPost.created_at, // Add createdAt alias
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        });
      }
      return Promise.resolve({
        data: {
          ...post,
          createdAt: post.created_at, // Add createdAt alias
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.get<BlogPost>(`blog-posts/${id}/`);
  },
  searchBlogPosts: (query: string) => {
    if (USE_MOCK_API) {
      const filtered = mockBlogPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.content.toLowerCase().includes(query.toLowerCase()) ||
          (post.tags &&
            post.tags.some((tag) =>
              tag.toLowerCase().includes(query.toLowerCase())
            ))
      );
      return Promise.resolve({
        data: paginateMockData(filtered, 1, 10),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.get<PaginatedResponse<BlogPost>>(
      `blog-posts/?search=${query}`
    );
  },
  getBlogCategories: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: mockCategories,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.get<string[]>('categories/');
  },

  // Contact
  createContact: async (data: ContactFormData) => {
    if (USE_MOCK_API) {
      // Simulate successful contact submission
      return Promise.resolve({
        data: {
          ...data,
          success: true,
          message: i18n.t('apiErrors.contactSuccess'),
          id: Date.now(),
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }

    try {
      const response = await axiosInstance.post('contact/', data);
      return response;
    } catch (error) {
      // Add specific handling for contact errors
      const axiosError = error as CustomAxiosError;
      if (axiosError.response?.status === 429) {
        axiosError.userMessage = i18n.t('apiErrors.contactRateLimit');
      }
      throw axiosError;
    }
  },

  // Newsletter
  subscribeNewsletter: (email: string) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          success: true,
          message: i18n.t('apiErrors.newsletterSuccess'),
          email,
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.post('newsletter/', { email });
  },

  // Auth
  getUser: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: { id: 1, email: 'mock@user.com', name: 'Mock User' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.get('/auth/user/');
  },
  login: (email: string, password: string) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
          user: { id: 1, email, name: 'Mock User' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.post('/auth/login/', { username: email, password });
  },
  logout: (refreshToken: string) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.post('/auth/logout/', { refresh: refreshToken });
  },
  register: (email: string, password: string, name: string) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
          user: { id: 1, email, name },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.post('/auth/register/', {
      username: email,
      email,
      password,
      password_confirm: password,
      first_name: name,
    });
  },

  // Health check
  checkHealth: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: { status: 'healthy' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.get<{ status: string }>('health/');
  },
};

// Export specific services for backward compatibility
export const blogService = {
  getPosts: api.getBlogPosts,
  getPost: api.getBlogPost,
  searchPosts: api.searchBlogPosts,
  getCategories: api.getBlogCategories,
  createPost: (data: Partial<BlogPost>) => {
    if (USE_MOCK_API) {
      const newPost = {
        id: Date.now(),
        slug: `post-${Date.now()}`,
        ...data,
      } as BlogPost;
      return Promise.resolve({
        data: newPost,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.post<BlogPost>('blog-posts/', data);
  },
  updatePost: (id: number | string, data: Partial<BlogPost>) => {
    if (USE_MOCK_API) {
      const existingPost = mockBlogPosts.find((p) => p.id === Number(id));
      const updatedPost = { ...existingPost, ...data, id } as BlogPost;
      return Promise.resolve({
        data: updatedPost,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.put<BlogPost>(`blog-posts/${id}/`, data);
  },
  deletePost: (id: number | string) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: undefined as never,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.delete(`blog-posts/${id}/`);
  },
};

// Export axios instance for custom requests
export default axiosInstance;
