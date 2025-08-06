import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { BlogPost, ContactFormData } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
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
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log('API Request:', config.method?.toUpperCase(), config.url);
        }
        
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful response in development
        if (process.env.NODE_ENV === 'development') {
            console.log('API Response:', response.config.url, response.status);
        }
        return response;
    },
    async (error: CustomAxiosError) => {
        const originalRequest = error.config;
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED' && originalRequest && !error._retry) {
            error._retry = true;
            console.warn('Request timeout, retrying...');
            return axiosInstance(originalRequest);
        }
        
        // Handle network errors
        if (!error.response) {
            error.message = '네트워크 연결을 확인해주세요.';
            return Promise.reject(error);
        }
        
        // Handle HTTP errors
        const { status, data } = error.response;
        error.userMessage = (data as any)?.message || getErrorMessage(status);
        
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('API Error:', status, error.userMessage);
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
    createProject: (data: Partial<Project>) => axiosInstance.post<Project>('projects/', data),
    
    // Blog
    getBlogPosts: (page: number = 1) => axiosInstance.get<PaginatedResponse<BlogPost>>(`blog-posts/?page=${page}`),
    getBlogPost: (id: number | string) => axiosInstance.get<BlogPost>(`blog-posts/${id}/`),
    
    // Contact
    createContact: async (data: ContactFormData) => {
        try {
            const response = await axiosInstance.post('contact/', data);
            return response;
        } catch (error: any) {
            // Add specific handling for contact errors
            if (error.response?.status === 429) {
                error.userMessage = '너무 많은 문의를 보내셨습니다. 1시간 후에 다시 시도해주세요.';
            }
            throw error;
        }
    },
    
    // Newsletter
    subscribeNewsletter: (email: string) => axiosInstance.post('newsletter/', { email }),
    
    // Health check
    checkHealth: () => axiosInstance.get<{ status: string }>('health/'),
};

// Export axios instance for custom requests
export default axiosInstance;