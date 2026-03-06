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
