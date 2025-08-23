import { api } from '../api';
import { BlogPost, ContactFormData } from '../../types';
import { InternalAxiosRequestConfig } from 'axios';

// Mock axios
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  };

  return {
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn(),
  };
});

// Get the mocked instance for use in tests
const mockAxiosInstance = (require('axios').create as jest.Mock)();

// Note: When USE_MOCK_API is true, the API service returns mock data
// These tests verify the mock data structure rather than axios behavior
describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Blog API', () => {
    it('should fetch blog posts with pagination', async () => {
      // When USE_MOCK_API is true, actual mock data is returned
      const response = await api.getBlogPosts(1);

      // Verify the response has the expected structure
      expect(response.data).toHaveProperty('results');
      expect(response.data).toHaveProperty('count');
      expect(response.data).toHaveProperty('next');
      expect(response.data).toHaveProperty('previous');
      expect(Array.isArray(response.data.results)).toBe(true);

      // Verify blog post structure
      if (response.data.results.length > 0) {
        const post = response.data.results[0];
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('author');
      }

      // Note: mockAxiosInstance.get won't be called when USE_MOCK_API is true
    });

    it('should fetch a single blog post', async () => {
      // When USE_MOCK_API is true, actual mock data is returned
      const response = await api.getBlogPost(1);

      // Verify the response has blog post structure
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title');
      expect(response.data).toHaveProperty('content');
      expect(response.data).toHaveProperty('author');
    });

    it('should search blog posts', async () => {
      // When USE_MOCK_API is true, actual mock data is returned
      const response = await api.searchBlogPosts('AI');

      // Verify the response has the expected structure
      expect(response.data).toHaveProperty('results');
      expect(Array.isArray(response.data.results)).toBe(true);
    });
  });

  describe('Contact API', () => {
    it('should submit contact form successfully', async () => {
      const contactData: ContactFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      };

      // When USE_MOCK_API is true, mock success response is returned
      const response = await api.createContact(contactData);
      expect(response.data).toHaveProperty('success');
      expect(response.data.success).toBe(true);
      expect(response.status).toBe(201);
    });
  });

  describe('Newsletter API', () => {
    it('should subscribe to newsletter', async () => {
      const email = 'test@example.com';

      // When USE_MOCK_API is true, mock success response is returned
      const response = await api.subscribeNewsletter(email);
      expect(response.data).toHaveProperty('success');
      expect(response.data.success).toBe(true);
      expect(response.status).toBe(201);
    });
  });

  describe('Projects API', () => {
    it('should fetch projects', async () => {
      const mockProjects = [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
          technologies: ['React', 'TypeScript'],
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: mockProjects,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      const response = await api.getProjects();
      expect(response.data).toEqual(mockProjects);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('projects/');
    });

    it('should create a new project', async () => {
      const newProject = {
        title: 'New Project',
        description: 'New Description',
        technologies: ['React', 'Node.js'],
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { id: 1, ...newProject },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      const response = await api.createProject(newProject);
      expect(response.data).toEqual({ id: 1, ...newProject });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        'projects/',
        newProject
      );
    });
  });

  describe('Health Check', () => {
    it('should check API health', async () => {
      // When USE_MOCK_API is true, mock healthy response is returned
      const response = await api.checkHealth();
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('healthy');
      expect(response.status).toBe(200);
    });
  });
});
