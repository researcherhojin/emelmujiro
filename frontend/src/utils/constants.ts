/**
 * Application-wide constants
 */

// Inquiry type mappings
export const INQUIRY_TYPE_MAP = {
  consulting: 'AI 컨설팅',
  education: '기업 AI 교육',
  llm: 'LLM 솔루션',
  data: '데이터 분석',
} as const;

// Contact information
export const CONTACT_EMAIL =
  process.env.REACT_APP_CONTACT_EMAIL || 'researcherhojin@gmail.com';

// Form limits
export const FORM_LIMITS = {
  name: { min: 2, max: 50 },
  email: { min: 5, max: 100 },
  phone: { min: 10, max: 20 },
  company: { min: 0, max: 100 },
  message: { min: 10, max: 1000 },
} as const;

// Business hours
export const BUSINESS_HOURS = {
  weekdays: '09:00 - 18:00',
  weekends: '휴무',
} as const;

// Response times
export const RESPONSE_TIME = '24시간 이내';

// Service categories
export const SERVICE_CATEGORIES = [
  {
    id: 'consulting',
    name: 'AI 컨설팅',
    description: '비즈니스 맞춤형 AI 솔루션 제공',
    features: ['AI 도입 전략 수립', '기술 검토 및 평가', 'ROI 분석'],
  },
  {
    id: 'education',
    name: '기업 AI 교육',
    description: '실무 중심의 AI 교육 프로그램',
    features: ['맞춤형 커리큘럼', '실습 위주 교육', '사후 멘토링'],
  },
  {
    id: 'llm',
    name: 'LLM 솔루션',
    description: '대규모 언어 모델 구축 및 최적화',
    features: ['커스텀 LLM 개발', 'Fine-tuning', 'API 통합'],
  },
  {
    id: 'data',
    name: '데이터 분석',
    description: '데이터 기반 인사이트 도출',
    features: ['데이터 파이프라인', '예측 모델링', '시각화 대시보드'],
  },
] as const;

// Animation durations (ms)
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  blog: '/api/blog',
  contact: '/api/contact',
  newsletter: '/api/newsletter',
  auth: '/api/auth',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  authToken: 'authToken',
  userPreferences: 'userPreferences',
  theme: 'theme',
  language: 'language',
  pendingContact: 'pendingContact',
  notificationDismissed: 'notificationBannerDismissed',
} as const;

// Supported languages
export const LANGUAGES = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
] as const;

// Default meta tags
export const DEFAULT_META = {
  title: '에멜무지로 - AI 기반 소프트웨어 개발 및 IT 교육 전문가',
  description:
    'AI 기술을 활용한 맞춤형 솔루션 개발, 기업 교육, LLM 구축 등 종합 IT 서비스를 제공합니다.',
  keywords: 'AI, 인공지능, 머신러닝, 딥러닝, LLM, 기업교육, IT컨설팅',
  ogImage: '/og-image.png',
} as const;
