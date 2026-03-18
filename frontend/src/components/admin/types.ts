// Shared types for admin dashboard components

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalMessages: number;
  totalViews: number;
}

export interface ContentItem {
  id: string | number;
  title: string;
  type: 'blog' | 'page' | 'notification';
  status: 'published' | 'draft' | 'archived';
  author: string;
  createdAt: string;
  views?: number;
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  inquiry_type: string;
  is_processed: boolean;
  created_at: string;
}

export interface NotificationPref {
  system_enabled: boolean;
  blog_enabled: boolean;
  contact_enabled: boolean;
  admin_enabled: boolean;
  email_enabled: boolean;
}
