import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import useAppStore from '../useAppStore';

// Mock crypto.randomUUID for deterministic IDs
vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' });

// Default initial state used to reset the store between tests
const initialState = {
  // UI
  theme: 'system' as const,
  sidebarOpen: false,
  mobileMenuOpen: false,
  notifications: [],
  // Auth
  user: null,
  isAuthenticated: false,
  isLoading: false,
  // Blog
  posts: [],
  selectedPost: null,
  isLoadingPosts: false,
  // Chat
  messages: [],
  isTyping: false,
  isConnected: false,
};

describe('useAppStore', () => {
  beforeEach(() => {
    act(() => {
      useAppStore.setState(initialState);
    });
  });

  // ─── UI Slice ──────────────────────────────────────────────────────────

  describe('UI Slice', () => {
    it('has correct initial defaults', () => {
      const state = useAppStore.getState();
      expect(state.theme).toBe('system');
      expect(state.sidebarOpen).toBe(false);
      expect(state.mobileMenuOpen).toBe(false);
      expect(state.notifications).toEqual([]);
    });

    it('setTheme changes theme to light', () => {
      act(() => {
        useAppStore.getState().setTheme('light');
      });
      expect(useAppStore.getState().theme).toBe('light');
    });

    it('setTheme changes theme to dark', () => {
      act(() => {
        useAppStore.getState().setTheme('dark');
      });
      expect(useAppStore.getState().theme).toBe('dark');
    });

    it('setTheme changes theme back to system', () => {
      act(() => {
        useAppStore.getState().setTheme('dark');
      });
      act(() => {
        useAppStore.getState().setTheme('system');
      });
      expect(useAppStore.getState().theme).toBe('system');
    });

    it('toggleSidebar toggles sidebarOpen from false to true', () => {
      act(() => {
        useAppStore.getState().toggleSidebar();
      });
      expect(useAppStore.getState().sidebarOpen).toBe(true);
    });

    it('toggleSidebar toggles sidebarOpen back to false', () => {
      act(() => {
        useAppStore.getState().toggleSidebar();
      });
      act(() => {
        useAppStore.getState().toggleSidebar();
      });
      expect(useAppStore.getState().sidebarOpen).toBe(false);
    });

    it('toggleMobileMenu toggles mobileMenuOpen from false to true', () => {
      act(() => {
        useAppStore.getState().toggleMobileMenu();
      });
      expect(useAppStore.getState().mobileMenuOpen).toBe(true);
    });

    it('toggleMobileMenu toggles mobileMenuOpen back to false', () => {
      act(() => {
        useAppStore.getState().toggleMobileMenu();
      });
      act(() => {
        useAppStore.getState().toggleMobileMenu();
      });
      expect(useAppStore.getState().mobileMenuOpen).toBe(false);
    });

    it('addNotification adds a notification with id and timestamp', () => {
      const now = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      act(() => {
        useAppStore
          .getState()
          .addNotification({ type: 'success', message: 'Test notification' });
      });

      const { notifications } = useAppStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        id: expect.any(String),
        type: 'success',
        message: 'Test notification',
        timestamp: now,
      });

      vi.restoreAllMocks();
    });

    it('addNotification appends multiple notifications', () => {
      act(() => {
        useAppStore
          .getState()
          .addNotification({ type: 'info', message: 'First' });
      });
      act(() => {
        useAppStore
          .getState()
          .addNotification({ type: 'error', message: 'Second' });
      });

      const { notifications } = useAppStore.getState();
      expect(notifications).toHaveLength(2);
      expect(notifications[0].message).toBe('First');
      expect(notifications[1].message).toBe('Second');
    });

    it('removeNotification removes a notification by id', () => {
      act(() => {
        useAppStore.setState({
          notifications: [
            { id: 'n1', type: 'info', message: 'Keep me', timestamp: 1 },
            { id: 'n2', type: 'error', message: 'Remove me', timestamp: 2 },
          ],
        });
      });

      act(() => {
        useAppStore.getState().removeNotification('n2');
      });

      const { notifications } = useAppStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].id).toBe('n1');
    });

    it('removeNotification does nothing if id does not exist', () => {
      act(() => {
        useAppStore.setState({
          notifications: [
            {
              id: 'n1',
              type: 'info',
              message: 'Stay here',
              timestamp: 1,
            },
          ],
        });
      });

      act(() => {
        useAppStore.getState().removeNotification('nonexistent');
      });

      expect(useAppStore.getState().notifications).toHaveLength(1);
    });

    it('clearNotifications empties the notifications array', () => {
      act(() => {
        useAppStore.setState({
          notifications: [
            { id: 'n1', type: 'info', message: 'A', timestamp: 1 },
            { id: 'n2', type: 'warning', message: 'B', timestamp: 2 },
          ],
        });
      });

      act(() => {
        useAppStore.getState().clearNotifications();
      });

      expect(useAppStore.getState().notifications).toEqual([]);
    });
  });

  // ─── Auth Slice ─────────────────────────────────────────────────────────

  describe('Auth Slice', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    };

    it('has correct initial defaults', () => {
      const state = useAppStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('login sets user and isAuthenticated to true', () => {
      act(() => {
        useAppStore.getState().login(mockUser);
      });

      const state = useAppStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('logout clears user and sets isAuthenticated to false', () => {
      // First login
      act(() => {
        useAppStore.getState().login(mockUser);
      });

      // Then logout
      act(() => {
        useAppStore.getState().logout();
      });

      const state = useAppStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('setLoading updates isLoading to true', () => {
      act(() => {
        useAppStore.getState().setLoading(true);
      });

      expect(useAppStore.getState().isLoading).toBe(true);
    });

    it('setLoading updates isLoading to false', () => {
      act(() => {
        useAppStore.getState().setLoading(true);
      });
      act(() => {
        useAppStore.getState().setLoading(false);
      });

      expect(useAppStore.getState().isLoading).toBe(false);
    });
  });

  // ─── Blog Slice ─────────────────────────────────────────────────────────

  describe('Blog Slice', () => {
    const mockPost = {
      id: 'post-1',
      title: 'Test Post',
      content: 'Test content',
      author: 'Author',
      createdAt: '2026-01-01T00:00:00Z',
      tags: ['test', 'vitest'],
    };

    const mockPost2 = {
      id: 'post-2',
      title: 'Second Post',
      content: 'More content',
      author: 'Author 2',
      createdAt: '2026-01-02T00:00:00Z',
      tags: ['second'],
    };

    it('has correct initial defaults', () => {
      const state = useAppStore.getState();
      expect(state.posts).toEqual([]);
      expect(state.selectedPost).toBeNull();
      expect(state.isLoadingPosts).toBe(false);
    });

    it('setPosts replaces the posts array', () => {
      const posts = [mockPost, mockPost2];

      act(() => {
        useAppStore.getState().setPosts(posts);
      });

      expect(useAppStore.getState().posts).toEqual(posts);
    });

    it('setPosts can replace existing posts with a new array', () => {
      act(() => {
        useAppStore.getState().setPosts([mockPost]);
      });
      act(() => {
        useAppStore.getState().setPosts([mockPost2]);
      });

      const { posts } = useAppStore.getState();
      expect(posts).toHaveLength(1);
      expect(posts[0].id).toBe('post-2');
    });

    it('addPost appends a post to the array', () => {
      act(() => {
        useAppStore.getState().setPosts([mockPost]);
      });
      act(() => {
        useAppStore.getState().addPost(mockPost2);
      });

      const { posts } = useAppStore.getState();
      expect(posts).toHaveLength(2);
      expect(posts[1]).toEqual(mockPost2);
    });

    it('updatePost updates a matching post by id', () => {
      act(() => {
        useAppStore.getState().setPosts([mockPost, mockPost2]);
      });

      act(() => {
        useAppStore
          .getState()
          .updatePost('post-1', { title: 'Updated Title', content: 'Updated' });
      });

      const updated = useAppStore.getState().posts[0];
      expect(updated.title).toBe('Updated Title');
      expect(updated.content).toBe('Updated');
      // Other fields remain unchanged
      expect(updated.author).toBe('Author');
      expect(updated.tags).toEqual(['test', 'vitest']);
    });

    it('updatePost does nothing if id does not match', () => {
      act(() => {
        useAppStore.getState().setPosts([mockPost]);
      });

      act(() => {
        useAppStore
          .getState()
          .updatePost('nonexistent', { title: 'Should not change' });
      });

      expect(useAppStore.getState().posts[0].title).toBe('Test Post');
    });

    it('deletePost removes a post by id', () => {
      act(() => {
        useAppStore.getState().setPosts([mockPost, mockPost2]);
      });

      act(() => {
        useAppStore.getState().deletePost('post-1');
      });

      const { posts } = useAppStore.getState();
      expect(posts).toHaveLength(1);
      expect(posts[0].id).toBe('post-2');
    });

    it('deletePost does nothing if id does not match', () => {
      act(() => {
        useAppStore.getState().setPosts([mockPost]);
      });

      act(() => {
        useAppStore.getState().deletePost('nonexistent');
      });

      expect(useAppStore.getState().posts).toHaveLength(1);
    });

    it('selectPost sets selectedPost to a post id', () => {
      act(() => {
        useAppStore.getState().selectPost('post-1');
      });

      expect(useAppStore.getState().selectedPost).toBe('post-1');
    });

    it('selectPost can set selectedPost to null', () => {
      act(() => {
        useAppStore.getState().selectPost('post-1');
      });
      act(() => {
        useAppStore.getState().selectPost(null);
      });

      expect(useAppStore.getState().selectedPost).toBeNull();
    });

    it('setLoadingPosts updates isLoadingPosts', () => {
      act(() => {
        useAppStore.getState().setLoadingPosts(true);
      });

      expect(useAppStore.getState().isLoadingPosts).toBe(true);

      act(() => {
        useAppStore.getState().setLoadingPosts(false);
      });

      expect(useAppStore.getState().isLoadingPosts).toBe(false);
    });
  });

  // ─── Chat Slice ─────────────────────────────────────────────────────────

  describe('Chat Slice', () => {
    it('has correct initial defaults', () => {
      const state = useAppStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.isTyping).toBe(false);
      expect(state.isConnected).toBe(false);
    });

    it('addMessage adds a message with id and timestamp', () => {
      const now = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      act(() => {
        useAppStore.getState().addMessage({ content: 'Hello', sender: 'user' });
      });

      const { messages } = useAppStore.getState();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        id: expect.any(String),
        content: 'Hello',
        sender: 'user',
        timestamp: now,
      });

      vi.restoreAllMocks();
    });

    it('addMessage appends multiple messages', () => {
      act(() => {
        useAppStore
          .getState()
          .addMessage({ content: 'User msg', sender: 'user' });
      });
      act(() => {
        useAppStore
          .getState()
          .addMessage({ content: 'Agent response', sender: 'agent' });
      });

      const { messages } = useAppStore.getState();
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('User msg');
      expect(messages[0].sender).toBe('user');
      expect(messages[1].content).toBe('Agent response');
      expect(messages[1].sender).toBe('agent');
    });

    it('addMessage supports system sender', () => {
      act(() => {
        useAppStore
          .getState()
          .addMessage({ content: 'System notice', sender: 'system' });
      });

      expect(useAppStore.getState().messages[0].sender).toBe('system');
    });

    it('clearMessages empties the messages array', () => {
      act(() => {
        useAppStore
          .getState()
          .addMessage({ content: 'To be cleared', sender: 'user' });
      });

      act(() => {
        useAppStore.getState().clearMessages();
      });

      expect(useAppStore.getState().messages).toEqual([]);
    });

    it('setTyping updates isTyping to true', () => {
      act(() => {
        useAppStore.getState().setTyping(true);
      });

      expect(useAppStore.getState().isTyping).toBe(true);
    });

    it('setTyping updates isTyping to false', () => {
      act(() => {
        useAppStore.getState().setTyping(true);
      });
      act(() => {
        useAppStore.getState().setTyping(false);
      });

      expect(useAppStore.getState().isTyping).toBe(false);
    });

    it('setConnected updates isConnected to true', () => {
      act(() => {
        useAppStore.getState().setConnected(true);
      });

      expect(useAppStore.getState().isConnected).toBe(true);
    });

    it('setConnected updates isConnected to false', () => {
      act(() => {
        useAppStore.getState().setConnected(true);
      });
      act(() => {
        useAppStore.getState().setConnected(false);
      });

      expect(useAppStore.getState().isConnected).toBe(false);
    });
  });

  // ─── Cross-Slice Independence ──────────────────────────────────────────

  describe('Cross-Slice Independence', () => {
    it('UI actions do not affect Auth state', () => {
      const mockUser = {
        id: 'u1',
        email: 'a@b.com',
        name: 'Name',
        role: 'user',
      };

      act(() => {
        useAppStore.getState().login(mockUser);
      });
      act(() => {
        useAppStore.getState().setTheme('dark');
      });
      act(() => {
        useAppStore.getState().toggleSidebar();
      });

      const state = useAppStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('Auth logout does not affect blog posts', () => {
      const mockPost = {
        id: 'p1',
        title: 'T',
        content: 'C',
        author: 'A',
        createdAt: '2026-01-01',
        tags: [],
      };

      act(() => {
        useAppStore.getState().setPosts([mockPost]);
      });
      act(() => {
        useAppStore.getState().login({
          id: 'u1',
          email: 'a@b.com',
          name: 'N',
          role: 'user',
        });
      });
      act(() => {
        useAppStore.getState().logout();
      });

      expect(useAppStore.getState().posts).toHaveLength(1);
      expect(useAppStore.getState().posts[0].id).toBe('p1');
    });

    it('clearing chat messages does not affect notifications', () => {
      act(() => {
        useAppStore.setState({
          notifications: [
            { id: 'n1', type: 'info', message: 'Notice', timestamp: 1 },
          ],
        });
      });
      act(() => {
        useAppStore.getState().addMessage({ content: 'msg', sender: 'user' });
      });
      act(() => {
        useAppStore.getState().clearMessages();
      });

      expect(useAppStore.getState().messages).toEqual([]);
      expect(useAppStore.getState().notifications).toHaveLength(1);
    });
  });

  // ─── Persistence Configuration ─────────────────────────────────────────

  describe('Persistence Configuration', () => {
    it('persist partialize includes only theme, user, and isAuthenticated', () => {
      // Access the persist API to verify partialize config
      const persistOptions = useAppStore.persist;
      expect(persistOptions).toBeDefined();
      expect(persistOptions.getOptions().name).toBe('app-store');

      // Verify partialize by checking what it returns
      const { partialize } = persistOptions.getOptions();
      if (partialize) {
        const fullState = useAppStore.getState();
        const persisted = partialize(fullState);
        const keys = Object.keys(persisted);

        expect(keys).toContain('theme');
        expect(keys).toContain('user');
        expect(keys).toContain('isAuthenticated');
        // Non-persisted keys should not be present
        expect(keys).not.toContain('sidebarOpen');
        expect(keys).not.toContain('mobileMenuOpen');
        expect(keys).not.toContain('notifications');
        expect(keys).not.toContain('isLoading');
        expect(keys).not.toContain('posts');
        expect(keys).not.toContain('selectedPost');
        expect(keys).not.toContain('messages');
        expect(keys).not.toContain('isTyping');
        expect(keys).not.toContain('isConnected');
      }
    });
  });
});
