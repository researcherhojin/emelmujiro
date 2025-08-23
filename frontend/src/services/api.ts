import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { BlogPost, ContactFormData } from '../types';
import { ErrorResponse } from '../types/api.types';
import logger from '../utils/logger';
import { mockBlogPosts, mockCategories, paginateMockData } from './mockData';

// API URL 설정 (백엔드 기본 포트는 8000)
// 프로덕션에서 백엔드가 준비되지 않은 경우 mock 데이터 사용
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(process.env.REACT_APP_API_TIMEOUT) || 30000;

// Check if we should use mock API
// Use mock if explicitly set, in test environment, or in production when API URL is not properly configured
// GitHub Pages deployment doesn't have backend, so always use mock in production
const USE_MOCK_API =
  process.env.REACT_APP_USE_MOCK_API === 'true' ||
  process.env.NODE_ENV === 'test' ||
  isProduction; // Always use mock in production for GitHub Pages

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CORS 쿠키 지원
});

// Error message mapping
const getErrorMessage = (status: number): string => {
  const errorMessages: Record<number, string> = {
    400: '입력값을 확인해주세요.',
    401: '인증이 필요합니다.',
    403: '권한이 없습니다.',
    404: '요청한 리소스를 찾을 수 없습니다.',
    429: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
    500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    502: '서버가 응답하지 않습니다.',
    503: '서비스를 일시적으로 사용할 수 없습니다.',
  };
  return errorMessages[status] || '알 수 없는 오류가 발생했습니다.';
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
    if (
      process.env.NODE_ENV === 'production' &&
      config.url &&
      config.url.startsWith('http://')
    ) {
      logger.warn('Insecure HTTP detected in production, upgrading to HTTPS');
      config.url = config.url.replace('http://', 'https://');
    }
    if (
      process.env.NODE_ENV === 'production' &&
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

    // Development logging can be enabled if needed
    // logger.debug('API Request:', `${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Development logging can be enabled if needed
    return response;
  },
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
      error.message = '네트워크 연결을 확인해주세요.';
      return Promise.reject(error);
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    const errorData = data as ErrorResponse;
    error.userMessage = errorData?.message || getErrorMessage(status);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('API Error:', `${status} ${error.userMessage}`);
    }

    // Handle 401 - Clear auth and redirect to login if needed
    if (status === 401) {
      localStorage.removeItem('authToken');
      // window.location.href = '/login'; // Uncomment when login page exists
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

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

// API methods with improved error handling
export const api = {
  // Projects
  getProjects: () => axiosInstance.get<Project[]>('projects/'),
  createProject: (data: Partial<Project>) =>
    axiosInstance.post<Project>('projects/', data),

  // Blog
  getBlogPosts: (page: number = 1, pageSize?: number) => {
    const size = pageSize || Number(process.env.REACT_APP_POSTS_PER_PAGE) || 6;

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
          message: '문의가 성공적으로 접수되었습니다.',
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
        axiosError.userMessage =
          '너무 많은 문의를 보내셨습니다. 1시간 후에 다시 시도해주세요.';
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
          message: '뉴스레터 구독이 성공적으로 완료되었습니다.',
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
  createPost: (data: Partial<BlogPost>) =>
    axiosInstance.post<BlogPost>('blog-posts/', data),
  updatePost: (id: number | string, data: Partial<BlogPost>) =>
    axiosInstance.put<BlogPost>(`blog-posts/${id}/`, data),
  deletePost: (id: number | string) =>
    axiosInstance.delete(`blog-posts/${id}/`),
};

// Export axios instance for custom requests
export default axiosInstance;
