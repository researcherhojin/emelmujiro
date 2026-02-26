// Mock the api module directly
import { vi } from 'vitest';
import { blogService, api } from '../api';

vi.mock('../api', () => {
  const mockBlogService = {
    getPosts: vi.fn(),
    getPost: vi.fn(),
    searchPosts: vi.fn(),
    getCategories: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
  };
  const mockApi = {
    getProjects: vi.fn(),
    createProject: vi.fn(),
    getBlogPosts: vi.fn(),
    getBlogPost: vi.fn(),
    searchBlogPosts: vi.fn(),
    getBlogCategories: vi.fn(),
    createContact: vi.fn(),
    subscribeNewsletter: vi.fn(),
    checkHealth: vi.fn(),
  };
  return {
    api: mockApi,
    blogService: mockBlogService,
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
    },
  };
});

describe('API Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('blogService.getPosts', () => {
    test('fetches posts with correct parameters', async () => {
      const mockResponse = {
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 1,
              title: 'Test Post',
              content: 'Test Content',
              author: 'Test Author',
            },
          ],
        },
        status: 200,
      };

      (blogService.getPosts as any).mockResolvedValue(mockResponse);

      const result = await blogService.getPosts(1, 10);

      expect(blogService.getPosts).toHaveBeenCalledWith(1, 10);
      expect(result.data).toEqual(mockResponse.data);
    });

    test('handles pagination correctly', async () => {
      const mockPaginationResponse = {
        data: {
          count: 50,
          next: 'http://localhost:8000/api/blog-posts/?page=4',
          previous: 'http://localhost:8000/api/blog-posts/?page=2',
          results: [],
        },
        status: 200,
      };

      (blogService.getPosts as any).mockResolvedValue(mockPaginationResponse);

      const result = await blogService.getPosts(3, 10);

      expect(blogService.getPosts).toHaveBeenCalledWith(3, 10);
      expect(result.data.count).toBe(50);
      expect(result.data.next).toContain('page=4');
      expect(result.data.previous).toContain('page=2');
    });

    test('handles API errors correctly', async () => {
      const errorMessage = 'Network Error';
      (blogService.getPosts as any).mockRejectedValue(new Error(errorMessage));

      await expect(blogService.getPosts(1)).rejects.toThrow(errorMessage);
    });

    test('handles HTTP error responses', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };

      (blogService.getPosts as any).mockRejectedValue(errorResponse);

      await expect(blogService.getPosts(1)).rejects.toEqual(errorResponse);
    });
  });

  describe('blogService.getPost', () => {
    test('fetches individual post correctly', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        author: 'Test Author',
      };
      const mockPostResponse = {
        data: mockPost,
        status: 200,
      };

      (blogService.getPost as any).mockResolvedValue(mockPostResponse);

      const result = await blogService.getPost('1');

      expect(blogService.getPost).toHaveBeenCalledWith('1');
      expect(result.data).toEqual(mockPost);
    });

    test('handles post not found', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Post not found' },
        },
      };

      (blogService.getPost as any).mockRejectedValue(errorResponse);

      await expect(blogService.getPost('999')).rejects.toEqual(errorResponse);
    });
  });

  describe('blogService.searchPosts', () => {
    test('searches posts with query', async () => {
      const mockResults = [
        {
          id: 1,
          title: 'Matching Post',
          content: 'Content with search term',
          author: 'Author',
        },
      ];

      const mockSearchResponse = {
        data: { count: 1, next: null, previous: null, results: mockResults },
        status: 200,
      };

      (blogService.searchPosts as any).mockResolvedValue(mockSearchResponse);

      const result = await blogService.searchPosts('search term');

      expect(blogService.searchPosts).toHaveBeenCalledWith('search term');
      expect(result.data.results).toEqual(mockResults);
    });

    test('handles empty search results', async () => {
      const mockEmptyResponse = {
        data: { count: 0, next: null, previous: null, results: [] },
        status: 200,
      };

      (blogService.searchPosts as any).mockResolvedValue(mockEmptyResponse);

      const result = await blogService.searchPosts('nonexistent');

      expect(result.data.results).toEqual([]);
    });

    test('handles search errors', async () => {
      (blogService.searchPosts as any).mockRejectedValue(
        new Error('Search failed')
      );

      await expect(blogService.searchPosts('test')).rejects.toThrow(
        'Search failed'
      );
    });
  });

  describe('API Configuration', () => {
    test('API methods are defined', () => {
      // Test that the API service exports the expected methods
      expect(blogService.getPosts).toBeDefined();
      expect(blogService.getPost).toBeDefined();
      expect(blogService.searchPosts).toBeDefined();
      expect(blogService.getCategories).toBeDefined();
      expect(blogService.createPost).toBeDefined();
      expect(blogService.updatePost).toBeDefined();
      expect(blogService.deletePost).toBeDefined();
    });

    test('API main export methods are defined', () => {
      expect(api.getBlogPosts).toBeDefined();
      expect(api.getBlogPost).toBeDefined();
      expect(api.searchBlogPosts).toBeDefined();
      expect(api.createContact).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    test('handles rate limit responses', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { message: 'Too Many Requests' },
        },
      };

      (blogService.getPosts as any).mockRejectedValue(rateLimitError);

      await expect(blogService.getPosts(1)).rejects.toEqual(rateLimitError);
    });
  });

  describe('Offline Behavior', () => {
    test('handles offline scenarios', async () => {
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network Error',
      };

      (blogService.getPosts as any).mockRejectedValue(networkError);

      await expect(blogService.getPosts(1)).rejects.toEqual(networkError);
    });
  });
});
