import { api } from '../api';
import { BlogPost, ContactFormData } from '../../types';

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

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Blog API', () => {
    it('should fetch blog posts with pagination', async () => {
      const mockPosts: BlogPost[] = [
        {
          id: 1,
          title: 'Test Post',
          slug: 'test-post',
          content: 'Test content',
          excerpt: 'Test excerpt',
          author: 'Test Author',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          published: true,
        },
      ];

      const mockResponse = {
        data: {
          count: 1,
          next: null,
          previous: null,
          results: mockPosts,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const response = await api.getBlogPosts(1);
      expect(response.data.results).toEqual(mockPosts);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('blog-posts/?page=1&page_size=6');
    });

    it('should fetch a single blog post', async () => {
      const mockPost: BlogPost = {
        id: 1,
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        author: 'Test Author',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        published: true,
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: mockPost,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const response = await api.getBlogPost(1);
      expect(response.data).toEqual(mockPost);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('blog-posts/1/');
    });

    it('should search blog posts', async () => {
      const searchQuery = 'test';
      const mockResults: BlogPost[] = [];

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          count: 0,
          next: null,
          previous: null,
          results: mockResults,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const response = await api.searchBlogPosts(searchQuery);
      expect(response.data.results).toEqual(mockResults);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('blog-posts/?search=test');
    });
  });

  describe('Contact API', () => {
    it('should submit contact form successfully', async () => {
      const contactData: ContactFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      };

      mockAxiosInstance.post.mockResolvedValue({
        status: 201,
        data: { id: 1, ...contactData },
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const response = await api.createContact(contactData);
      expect(response.status).toBe(201);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('contact/', contactData);
    });
  });

  describe('Newsletter API', () => {
    it('should subscribe to newsletter', async () => {
      const email = 'test@example.com';

      mockAxiosInstance.post.mockResolvedValue({
        data: { email, subscribed: true },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const response = await api.subscribeNewsletter(email);
      expect(response.data).toEqual({ email, subscribed: true });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('newsletter/', { email });
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
        config: {} as any,
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
        config: {} as any,
      });

      const response = await api.createProject(newProject);
      expect(response.data).toEqual({ id: 1, ...newProject });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/projects/', newProject);
    });
  });

  describe('Health Check', () => {
    it('should check API health', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const response = await api.checkHealth();
      expect(response.data).toEqual({ status: 'ok' });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/health/');
    });
  });
});
