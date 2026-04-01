// Tests for API service in non-mock mode — exercises real axios code paths
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock i18n
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn() },
}));

// Mock env to disable mock API (USE_MOCK_API = IS_TEST || !API_URL -> false || false = false)
vi.mock('../../config/env', () => ({
  default: {
    IS_TEST: false,
    IS_PRODUCTION: false,
    IS_DEVELOPMENT: true,
    API_URL: 'http://localhost:8000/api',
  },
  getEnvVar: () => '',
}));

// Mock axios to intercept real HTTP calls
const mockGet = vi.fn().mockResolvedValue({ data: {}, status: 200 });
const mockPost = vi.fn().mockResolvedValue({ data: {}, status: 200 });
const mockPatch = vi.fn().mockResolvedValue({ data: {}, status: 200 });
const mockDelete = vi.fn().mockResolvedValue({ data: {}, status: 200 });

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      patch: mockPatch,
      delete: mockDelete,
      defaults: {
        headers: { common: {}, 'Content-Type': 'application/json' },
        withCredentials: true,
        timeout: 30000,
      },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

// Suppress console output
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('API Service - Non-Mock Mode (real axios paths)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Blog Write Operations', () => {
    it('should call axios.post for createBlogPost', async () => {
      const { api } = await import('../api');
      await api.createBlogPost({ title: 'Test Post' });
      expect(mockPost).toHaveBeenCalledWith('blog-posts/', { title: 'Test Post' });
    });

    it('should call axios.patch for updateBlogPost', async () => {
      const { api } = await import('../api');
      await api.updateBlogPost(1, { title: 'Updated' });
      expect(mockPatch).toHaveBeenCalledWith('blog-posts/1/', { title: 'Updated' });
    });

    it('should call axios.delete for deleteBlogPost', async () => {
      const { api } = await import('../api');
      await api.deleteBlogPost(1);
      expect(mockDelete).toHaveBeenCalledWith('blog-posts/1/');
    });

    it('should call axios.post with FormData for uploadBlogImage', async () => {
      const { api } = await import('../api');
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      await api.uploadBlogImage(file);
      expect(mockPost).toHaveBeenCalled();
      const callArgs = mockPost.mock.calls[0];
      expect(callArgs[0]).toBe('blog-posts/upload-image/');
      expect(callArgs[1]).toBeInstanceOf(FormData);
      expect(callArgs[2]).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
    });

    it('should call axios.post for toggleBlogPublish', async () => {
      const { api } = await import('../api');
      await api.toggleBlogPublish(5);
      expect(mockPost).toHaveBeenCalledWith('blog-posts/5/toggle-publish/');
    });

    it('should call axios.post for likeBlogPost', async () => {
      const { api } = await import('../api');
      await api.likeBlogPost(3);
      expect(mockPost).toHaveBeenCalledWith('blog-posts/3/like/');
    });
  });

  describe('Blog Comment Operations', () => {
    it('should call axios.get for getComments', async () => {
      const { api } = await import('../api');
      await api.getComments(1);
      expect(mockGet).toHaveBeenCalledWith('blog-posts/1/comments/');
    });

    it('should call axios.post for createComment', async () => {
      const { api } = await import('../api');
      await api.createComment(1, { author_name: 'Test', content: 'Hello' });
      expect(mockPost).toHaveBeenCalledWith('blog-posts/1/comments/', {
        author_name: 'Test',
        content: 'Hello',
        post: 1,
      });
    });

    it('should call axios.delete for deleteComment', async () => {
      const { api } = await import('../api');
      await api.deleteComment(1, 5);
      expect(mockDelete).toHaveBeenCalledWith('blog-posts/1/comments/5/');
    });

    it('should call axios.post for likeComment', async () => {
      const { api } = await import('../api');
      await api.likeComment(1, 5);
      expect(mockPost).toHaveBeenCalledWith('blog-posts/1/comments/5/like/');
    });
  });

  describe('Blog Read Operations (non-mock)', () => {
    it('should call axios.get for getBlogPosts', async () => {
      const { api } = await import('../api');
      await api.getBlogPosts(2, 10);
      expect(mockGet).toHaveBeenCalledWith('blog-posts/', {
        params: { page: 2, page_size: 10 },
      });
    });

    it('should use default page size of 6 for getBlogPosts', async () => {
      const { api } = await import('../api');
      await api.getBlogPosts(1);
      expect(mockGet).toHaveBeenCalledWith('blog-posts/', {
        params: { page: 1, page_size: 6 },
      });
    });

    it('should call axios.get for getBlogPost', async () => {
      const { api } = await import('../api');
      await api.getBlogPost(5);
      expect(mockGet).toHaveBeenCalledWith('blog-posts/5/');
    });

    it('should call axios.get for searchBlogPosts', async () => {
      const { api } = await import('../api');
      await api.searchBlogPosts('react');
      expect(mockGet).toHaveBeenCalledWith('blog-posts/', {
        params: { search: 'react' },
      });
    });

    it('should call axios.get for getBlogCategories', async () => {
      const { api } = await import('../api');
      await api.getBlogCategories();
      expect(mockGet).toHaveBeenCalledWith('categories/');
    });
  });

  describe('Auth Operations (non-mock)', () => {
    it('should call axios.get for getUser', async () => {
      const { api } = await import('../api');
      await api.getUser();
      expect(mockGet).toHaveBeenCalledWith('auth/user/');
    });

    it('should call axios.post for login', async () => {
      const { api } = await import('../api');
      await api.login('test@test.com', 'pass123');
      expect(mockPost).toHaveBeenCalledWith('auth/login/', {
        username: 'test@test.com',
        password: 'pass123',
      });
    });

    it('should call axios.post for logout', async () => {
      const { api } = await import('../api');
      await api.logout();
      expect(mockPost).toHaveBeenCalledWith('auth/logout/');
    });

    it('should call axios.post for register', async () => {
      const { api } = await import('../api');
      await api.register('new@test.com', 'pass123', 'New User');
      expect(mockPost).toHaveBeenCalledWith('auth/register/', {
        username: 'new@test.com',
        email: 'new@test.com',
        password: 'pass123',
        password_confirm: 'pass123',
        first_name: 'New User',
      });
    });
  });

  describe('Notification Operations (non-mock)', () => {
    it('should call axios.get for getNotifications', async () => {
      const { api } = await import('../api');
      await api.getNotifications(2);
      expect(mockGet).toHaveBeenCalledWith('notifications/', {
        params: { page: 2 },
      });
    });

    it('should call axios.get for getUnreadCount', async () => {
      const { api } = await import('../api');
      await api.getUnreadCount();
      expect(mockGet).toHaveBeenCalledWith('notifications/unread_count/');
    });

    it('should call axios.patch for markNotificationRead', async () => {
      const { api } = await import('../api');
      await api.markNotificationRead(42);
      expect(mockPatch).toHaveBeenCalledWith('notifications/42/', { is_read: true });
    });

    it('should call axios.post for markAllNotificationsRead', async () => {
      const { api } = await import('../api');
      await api.markAllNotificationsRead();
      expect(mockPost).toHaveBeenCalledWith('notifications/mark_all_read/');
    });
  });

  describe('Contact Form (non-mock)', () => {
    it('should call axios.post for createContact', async () => {
      const { api } = await import('../api');
      const formData = { name: 'Test', email: 'test@test.com', message: 'Hello' };
      await api.createContact(formData);
      expect(mockPost).toHaveBeenCalledWith('contact/', formData);
    });

    it('should handle 429 rate limit error for createContact', async () => {
      const rateError = {
        response: { status: 429, data: {} },
        isAxiosError: true,
      };
      mockPost.mockRejectedValueOnce(rateError);

      const { api } = await import('../api');
      try {
        await api.createContact({ name: 'A', email: 'a@b.c', message: 'Hi' });
        expect(true).toBe(false); // Should not reach here
      } catch (err: any) {
        expect(err.response.status).toBe(429);
        expect(err.userMessage).toBe('apiErrors.contactRateLimit');
      }
    });

    it('should pass through non-429 errors for createContact', async () => {
      const serverError = {
        response: { status: 500, data: { message: 'Server error' } },
        isAxiosError: true,
      };
      mockPost.mockRejectedValueOnce(serverError);

      const { api } = await import('../api');
      try {
        await api.createContact({ name: 'A', email: 'a@b.c', message: 'Hi' });
        expect(true).toBe(false);
      } catch (err: any) {
        expect(err.response.status).toBe(500);
      }
    });
  });
});
