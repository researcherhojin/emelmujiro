import {
  getCachedPosts,
  getCachedPost,
  cacheBlogPost,
  clearBlogCache,
  updateLastAccessedTime,
  removeCachedPost,
  getBlogCacheStats,
  isBlogCacheAvailable,
  isBlogPostCached,
  getRecentlyAccessedPosts,
  cleanupBlogCache,
  initBlogCache,
} from '../blogCache';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn(),
    ready: Promise.resolve({
      sync: {
        register: jest.fn(),
      },
    }),
  },
  writable: true,
});

describe('blogCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('isBlogCacheAvailable', () => {
    it('should return true when localStorage and serviceWorker are available', () => {
      expect(isBlogCacheAvailable()).toBe(true);
    });
  });

  describe('getCachedPosts', () => {
    it('should return empty array when no cached posts exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = getCachedPosts();
      expect(result).toEqual([]);
    });

    it('should return cached posts when they exist', () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Post 1',
          content: 'Content 1',
          cachedAt: Date.now(),
          lastAccessed: Date.now(),
        },
        {
          id: '2',
          title: 'Test Post 2',
          content: 'Content 2',
          cachedAt: Date.now(),
          lastAccessed: Date.now(),
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPosts));

      const result = getCachedPosts();
      expect(result).toEqual(mockPosts);
    });

    it('should handle invalid JSON in cache', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = getCachedPosts();
      expect(result).toEqual([]);
    });
  });

  describe('cacheBlogPost', () => {
    it('should cache a blog post', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
      };

      localStorageMock.getItem.mockReturnValue('[]');

      const result = await cacheBlogPost(mockPost);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should update existing cached post', async () => {
      const existingPost = {
        id: '1',
        title: 'Old Title',
        content: 'Old content',
        cachedAt: Date.now() - 1000,
        lastAccessed: Date.now() - 1000,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([existingPost]));

      const updatedPost = {
        id: '1',
        title: 'New Title',
        content: 'New content',
      };

      const result = await cacheBlogPost(updatedPost);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('getCachedPost', () => {
    it('should return null when post is not cached', () => {
      localStorageMock.getItem.mockReturnValue('[]');

      const result = getCachedPost('1');
      expect(result).toBeNull();
    });

    it('should return cached post when it exists', () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockPost]));

      const result = getCachedPost('1');
      expect(result).toEqual(mockPost);
    });
  });

  describe('updateLastAccessedTime', () => {
    it('should update the last accessed time of a cached post', () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        cachedAt: Date.now() - 1000,
        lastAccessed: Date.now() - 1000,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockPost]));

      updateLastAccessedTime('1');

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('removeCachedPost', () => {
    it('should remove a cached post', () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Post 1',
          content: 'Content 1',
          cachedAt: Date.now(),
          lastAccessed: Date.now(),
        },
        {
          id: '2',
          title: 'Post 2',
          content: 'Content 2',
          cachedAt: Date.now(),
          lastAccessed: Date.now(),
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPosts));

      const result = removeCachedPost('1');

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should return false when post does not exist', () => {
      localStorageMock.getItem.mockReturnValue('[]');

      const result = removeCachedPost('999');

      expect(result).toBe(false);
    });
  });

  describe('clearBlogCache', () => {
    it('should clear all cached posts', () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Post 1',
          content: 'Content 1',
          cachedAt: Date.now(),
          lastAccessed: Date.now(),
        },
        {
          id: '2',
          title: 'Post 2',
          content: 'Content 2',
          cachedAt: Date.now(),
          lastAccessed: Date.now(),
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPosts));

      const result = clearBlogCache();

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'emelmujiro-blog-cache'
      );
    });
  });

  describe('getBlogCacheStats', () => {
    it('should return cache statistics', () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Post 1',
          content: 'Content 1',
          cachedAt: Date.now() - 2000,
          lastAccessed: Date.now() - 1000,
        },
        {
          id: '2',
          title: 'Post 2',
          content: 'Content 2',
          cachedAt: Date.now() - 1000,
          lastAccessed: Date.now(),
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPosts));

      const stats = getBlogCacheStats();

      expect(stats.totalPosts).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.oldestPost).toBeDefined();
      expect(stats.newestPost).toBeDefined();
    });
  });

  describe('isBlogPostCached', () => {
    it('should return true when post is cached', () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockPost]));

      expect(isBlogPostCached('1')).toBe(true);
    });

    it('should return false when post is not cached', () => {
      localStorageMock.getItem.mockReturnValue('[]');

      expect(isBlogPostCached('999')).toBe(false);
    });
  });

  describe('getRecentlyAccessedPosts', () => {
    it('should return recently accessed posts in order', () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Post 1',
          content: 'Content 1',
          cachedAt: Date.now(),
          lastAccessed: Date.now() - 3000,
        },
        {
          id: '2',
          title: 'Post 2',
          content: 'Content 2',
          cachedAt: Date.now(),
          lastAccessed: Date.now() - 1000,
        },
        {
          id: '3',
          title: 'Post 3',
          content: 'Content 3',
          cachedAt: Date.now(),
          lastAccessed: Date.now() - 2000,
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPosts));

      const result = getRecentlyAccessedPosts(2);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2'); // Most recently accessed
      expect(result[1].id).toBe('3'); // Second most recently accessed
    });
  });

  describe('cleanupBlogCache', () => {
    it('should remove old posts from cache', () => {
      const oldDate = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      const recentDate = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago

      const mockPosts = [
        {
          id: '1',
          title: 'Old Post',
          content: 'Old content',
          cachedAt: oldDate,
          lastAccessed: oldDate,
        },
        {
          id: '2',
          title: 'Recent Post',
          content: 'Recent content',
          cachedAt: recentDate,
          lastAccessed: recentDate,
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPosts));

      cleanupBlogCache();

      expect(localStorageMock.setItem).toHaveBeenCalled();
      // The setItem should be called with only the recent post
      const savedData = localStorageMock.setItem.mock.calls[0][1];
      const savedPosts = JSON.parse(savedData);
      expect(savedPosts).toHaveLength(1);
      expect(savedPosts[0].id).toBe('2');
    });
  });

  describe('initBlogCache', () => {
    it('should initialize the blog cache', () => {
      initBlogCache();

      // Should check if cache exists
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'emelmujiro-blog-cache'
      );
    });

    it('should create empty cache if none exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      initBlogCache();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'emelmujiro-blog-cache',
        '[]'
      );
    });
  });
});
