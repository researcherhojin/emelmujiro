import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  BlogPost,
  BlogComment,
  ContactFormData,
  ErrorResponse,
  Notification,
  PaginatedResponse,
} from '../types';
import logger from '../utils/logger';
import env from '../config/env';
import i18n from '../i18n';
import { mockBlogPosts, mockCategories, paginateMockData } from './mockData';

// Use centralized env config instead of direct process.env access
const API_URL = env.API_URL;
const API_TIMEOUT = 30000;

// Check if we should use mock API
// Mock is only used in tests or when no API URL is configured.
const USE_MOCK_API = env.IS_TEST || !env.API_URL;

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
    if (env.IS_PRODUCTION && config.baseURL && config.baseURL.startsWith('http://')) {
      logger.warn('Insecure HTTP in baseURL detected in production, upgrading to HTTPS');
      config.baseURL = config.baseURL.replace('http://', 'https://');
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

    // Handle 401 - Try cookie-based token refresh
    if (status === 401 && originalRequest && !error._retry) {
      error._retry = true;
      try {
        await axiosInstance.post('/auth/token/refresh/');
        return axiosInstance(originalRequest);
      } catch {
        // Refresh failed - user needs to re-login
      }
    }

    return Promise.reject(error);
  }
);

// API methods with improved error handling
export const api = {
  // Blog Read (public)
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
      const post = mockBlogPosts.find((p) => p.id === Number(id) || p.slug === id);
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
          (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())))
      );
      return Promise.resolve({
        data: paginateMockData(filtered, 1, 10),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.get<PaginatedResponse<BlogPost>>(`blog-posts/?search=${query}`);
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

  // Blog Write (admin only — used by BlogEditor; delete/toggle/categories pending admin UI)
  createBlogPost: (data: Record<string, unknown>) => {
    return axiosInstance.post<BlogPost>('blog-posts/', data);
  },
  updateBlogPost: (id: number | string, data: Record<string, unknown>) => {
    return axiosInstance.patch<BlogPost>(`blog-posts/${id}/`, data);
  },
  deleteBlogPost: (id: number | string) => {
    return axiosInstance.delete(`blog-posts/${id}/`);
  },
  uploadBlogImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosInstance.post<{ url: string }>('blog-posts/upload-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  toggleBlogPublish: (id: number | string) => {
    return axiosInstance.post<{ id: number; is_published: boolean }>(
      `blog-posts/${id}/toggle-publish/`
    );
  },
  likeBlogPost: (id: number | string) => {
    return axiosInstance.post<{ liked: boolean; likes: number }>(`blog-posts/${id}/like/`);
  },

  // Blog Comments (public — deleteComment pending admin UI)
  getComments: (postId: number | string) => {
    return axiosInstance.get<BlogComment[]>(`blog-posts/${postId}/comments/`);
  },
  createComment: (
    postId: number | string,
    data: { author_name: string; content: string; parent?: number }
  ) => {
    return axiosInstance.post<BlogComment>(`blog-posts/${postId}/comments/`, {
      ...data,
      post: postId,
    });
  },
  deleteComment: (postId: number | string, commentId: number) => {
    return axiosInstance.delete(`blog-posts/${postId}/comments/${commentId}/`);
  },
  likeComment: (postId: number | string, commentId: number) => {
    return axiosInstance.post<{ liked: boolean; likes: number }>(
      `blog-posts/${postId}/comments/${commentId}/like/`
    );
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
  logout: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.post('/auth/logout/');
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

  // Notifications
  getNotifications: (page: number = 1) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: { count: 0, next: null, previous: null, results: [] as Notification[] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.get<PaginatedResponse<Notification>>(`notifications/?page=${page}`);
  },
  getUnreadCount: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: { count: 0 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.get<{ count: number }>('notifications/unread_count/');
  },
  markNotificationRead: (id: number) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: { id, is_read: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.patch(`notifications/${id}/`, { is_read: true });
  },
  markAllNotificationsRead: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
    }
    return axiosInstance.post('notifications/mark_all_read/');
  },
};

// Export axios instance for custom requests
export default axiosInstance;
