// Mock axios before importing api
import axios from 'axios';
import { blogService } from '../api';
import { PaginatedResponse, BlogPost } from '../../types';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

describe('API Service Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock axios.create to return our mocked instance
    mockedAxios.create = jest.fn().mockReturnValue(mockedAxiosInstance);

    // Default successful response
    mockedAxiosInstance.get.mockResolvedValue({
      data: { count: 0, next: null, previous: null, results: [] },
      status: 200,
    });
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

      mockedAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await blogService.getPosts(1, 10);

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('blog-posts/?page=1&page_size=10');

      expect(result.data).toEqual(mockResponse.data);
    });

    test('handles pagination correctly', async () => {
      const mockResponse = {
        data: {
          count: 50,
          next: 'http://localhost:8000/api/blog-posts/?page=4',
          previous: 'http://localhost:8000/api/blog-posts/?page=2',
          results: [],
        },
        status: 200,
      };

      mockedAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await blogService.getPosts(3, 10);

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('blog-posts/?page=3&page_size=10');

      expect(result.data.count).toBe(50);
      expect(result.data.next).toContain('page=4');
      expect(result.data.previous).toContain('page=2');
    });

    test('handles API errors correctly', async () => {
      const errorMessage = 'Network Error';
      mockedAxiosInstance.get.mockRejectedValue(new Error(errorMessage));

      await expect(blogService.getPosts(1)).rejects.toThrow(errorMessage);
    });

    test('handles HTTP error responses', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };

      mockedAxiosInstance.get.mockRejectedValue(errorResponse);

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

      mockedAxiosInstance.get.mockResolvedValue({
        data: mockPost,
        status: 200,
      });

      const result = await blogService.getPost('1');

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('blog-posts/1/');
      expect(result.data).toEqual(mockPost);
    });

    test('handles post not found', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Post not found' },
        },
      };

      mockedAxiosInstance.get.mockRejectedValue(errorResponse);

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

      mockedAxiosInstance.get.mockResolvedValue({
        data: { count: 1, next: null, previous: null, results: mockResults },
        status: 200,
      });

      const result = await blogService.searchPosts('search term');

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('blog-posts/?search=search term');

      expect(result.data).toEqual(mockResults);
    });

    test('handles empty search results', async () => {
      mockedAxiosInstance.get.mockResolvedValue({
        data: { count: 0, next: null, previous: null, results: [] },
        status: 200,
      });

      const result = await blogService.searchPosts('nonexistent');

      expect(result.data.results).toEqual([]);
    });

    test('handles search errors', async () => {
      mockedAxiosInstance.get.mockRejectedValue(new Error('Search failed'));

      await expect(blogService.searchPosts('test')).rejects.toThrow('Search failed');
    });
  });

  describe('API Configuration', () => {
    test('uses correct base URL', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.any(String),
          timeout: expect.any(Number),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    test('includes request interceptor for HTTPS upgrade', () => {
      // Test that the interceptor is set up
      const createdInstance = (axios.create as jest.Mock).mock.results[0]?.value;
      expect(createdInstance?.interceptors?.request?.use).toHaveBeenCalled();
    });

    test('includes response interceptor for error handling', () => {
      // Test that the response interceptor is set up
      const createdInstance = (axios.create as jest.Mock).mock.results[0]?.value;
      expect(createdInstance?.interceptors?.response?.use).toHaveBeenCalled();
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

      mockedAxiosInstance.get.mockRejectedValue(rateLimitError);

      await expect(blogService.getPosts(1)).rejects.toEqual(rateLimitError);
    });
  });

  describe('Offline Behavior', () => {
    test('handles offline scenarios', async () => {
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network Error',
      };

      mockedAxiosInstance.get.mockRejectedValue(networkError);

      await expect(blogService.getPosts(1)).rejects.toEqual(networkError);
    });
  });
});
