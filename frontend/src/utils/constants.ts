// API Configuration
export const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export const API_TIMEOUT = 30000; // 30 seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Storage Keys
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  SAVED_CONTENT: 'saved-content',
  OFFLINE_DATA: 'offlineData',
} as const;

export const SESSION_STORAGE_KEYS = {
  TEMP_DATA: 'tempData',
  FORM_DRAFT: 'formDraft',
  SCROLL_POSITION: 'scrollPosition',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',
  PROFILE: '/profile',
  SHARE: '/share',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: '올바른 이메일 주소를 입력해주세요',
  },
  phone: {
    pattern: /^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$/,
    message: '올바른 전화번호를 입력해주세요',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: '비밀번호는 8자 이상, 대소문자와 숫자를 포함해야 합니다',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요',
  VALIDATION_ERROR: '입력값을 확인해주세요',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  UNAUTHORIZED: '인증이 필요합니다',
  FORBIDDEN: '권한이 없습니다',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_PWA: true,
  ENABLE_CHAT: true,
  ENABLE_ANALYTICS: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'YYYY-MM-DD',
  LONG: 'YYYY년 MM월 DD일',
  WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  RELATIVE: 'relative',
} as const;

// Breakpoints (in pixels)
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1280,
} as const;

// Limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_MESSAGE_LENGTH = 1000;
export const DEBOUNCE_DELAY = 300; // milliseconds
export const THROTTLE_DELAY = 1000; // milliseconds

// Social Media Links
export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/researcherhojin',
  LINKEDIN: 'https://linkedin.com/in/hojinahn',
  TWITTER: 'https://twitter.com',
  FACEBOOK: 'https://facebook.com',
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  SHORT: 200,
  MEDIUM: 400,
  LONG: 600,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 50,
  CACHE_VERSION: 'v1',
} as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
] as const;

// File Types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'text/plain'],
  VIDEO: ['video/mp4', 'video/webm'],
} as const;

// Status Codes
export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

// PWA Configuration
export const PWA_CONFIG = {
  SERVICE_WORKER_PATH: '/service-worker-enhanced.js',
  CACHE_NAME: 'emelmujiro-v1',
  OFFLINE_PAGE: '/offline.html',
} as const;
