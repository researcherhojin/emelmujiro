// Blog Types
export interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
  published?: boolean;
  views?: number;
  likes?: number;
  readTime?: number;
}

// Service Types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  subject?: string;
  inquiryType?: 'consulting' | 'education' | 'llm' | 'data';
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  notification_type: 'system' | 'blog' | 'contact' | 'admin';
  url: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// Admin Types
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff' | 'user';
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
}

// Analytics Types
export interface VisitDataPoint {
  date: string;
  visits: number;
  unique_visitors: number;
}

export interface PageVisitData {
  page_path: string;
  visits: number;
}

// API Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
  status?: number;
}
