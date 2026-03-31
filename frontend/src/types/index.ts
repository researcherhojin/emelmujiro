// Blog Types
export interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  content: string;
  content_html?: string;
  description: string;
  author: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  date: string;
  created_at?: string;
  updated_at?: string;
  is_published?: boolean;
  view_count?: number;
  likes?: number;
  is_featured?: boolean;
}

export interface BlogComment {
  id: number;
  post: number;
  parent: number | null;
  author_name: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
  replies: BlogComment[];
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
