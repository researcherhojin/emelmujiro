// API Response Types
export interface BlogPost {
  id: string | number;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  author: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
  published?: boolean;
  views?: number;
  likes?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Component Props Types
// ButtonProps are now defined in Button.tsx component

export interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  placeholder?: string;
}

// Service Types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// Navigation Types
export interface NavLink {
  to: string;
  label: string;
  isActive?: boolean;
}

// SEO Types
export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}
