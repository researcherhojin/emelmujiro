import { api } from '../api';
import axios from 'axios';
import { PaginatedResponse, BlogPost } from '../../types';

// Mock axios for integration tests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock axios create to return the mocked axios instance
    mockedAxios.create.mockReturnValue(mockedAxios);

    // Default successful response
    mockedAxios.get.mockResolvedValue({
      data: { data: [], totalPages: 1, currentPage: 1, totalPosts: 0 },
      status: 200,
    });
  });

  describe('blogService.getPosts', () => {
    test('fetches posts with correct parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              title: 'Test Post',
              content: 'Test Content',
              author: 'Test Author',
            },
          ],
          totalPages: 1,
          currentPage: 1,
          totalPosts: 1,
        },
        status: 200,
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await blogService.getPosts(1, 10);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/blog-posts/', {
        params: { page: 1, limit: 10 },
      });

      expect(result).toEqual({
        data: mockResponse.data.data,
        totalPages: 1,
        currentPage: 1,
        totalPosts: 1,
      });
    });

    test('handles pagination correctly', async () => {
      const mockResponse = {
        data: {
          data: [],
          totalPages: 5,
          currentPage: 3,
          totalPosts: 50,
        },
        status: 200,
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await blogService.getPosts(3, 10);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/blog-posts/', {
        params: { page: 3, limit: 10 },
      });

      expect(result.currentPage).toBe(3);
      expect(result.totalPages).toBe(5);
    });

    test('handles API errors correctly', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(blogService.getPosts(1)).rejects.toThrow(errorMessage);
    });

    test('handles HTTP error responses', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

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

      mockedAxios.get.mockResolvedValue({
        data: mockPost,
        status: 200,
      });

      const result = await blogService.getPost('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/blog-posts/1/');
      expect(result).toEqual(mockPost);
    });

    test('handles post not found', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Post not found' },
        },
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

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

      mockedAxios.get.mockResolvedValue({
        data: mockResults,
        status: 200,
      });

      const result = await blogService.searchPosts('search term');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/blog-posts/search/', {
        params: { q: 'search term' },
      });

      expect(result).toEqual(mockResults);
    });

    test('handles empty search results', async () => {
      mockedAxios.get.mockResolvedValue({
        data: [],
        status: 200,
      });

      const result = await blogService.searchPosts('nonexistent');

      expect(result).toEqual([]);
    });

    test('handles search errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Search failed'));

      await expect(blogService.searchPosts('test')).rejects.toThrow('Search failed');
    });
  });

  describe('API Configuration', () => {
    test('uses correct base URL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: expect.stringContaining('http'), // Should contain http/https
        timeout: expect.any(Number),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
    });

    test('includes request interceptor for HTTPS upgrade', () => {
      // Test that the interceptor is set up
      expect(mockedAxios.interceptors.request.use).toHaveBeenCalled();
    });

    test('includes response interceptor for error handling', () => {
      // Test that the response interceptor is set up
      expect(mockedAxios.interceptors.response.use).toHaveBeenCalled();
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

      mockedAxios.get.mockRejectedValue(rateLimitError);

      await expect(blogService.getPosts(1)).rejects.toEqual(rateLimitError);
    });
  });

  describe('Offline Behavior', () => {
    test('handles offline scenarios', async () => {
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network Error',
      };

      mockedAxios.get.mockRejectedValue(networkError);

      await expect(blogService.getPosts(1)).rejects.toEqual(networkError);
    });
  });
});
