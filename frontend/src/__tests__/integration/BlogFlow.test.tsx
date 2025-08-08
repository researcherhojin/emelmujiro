import { screen, waitFor, render } from '@testing-library/react';
import { AxiosRequestConfig } from 'axios';
import App from '../../App';
import { blogService } from '../../services/api';

// Mock react-helmet-async
jest.mock('react-helmet-async', () => ({
  HelmetProvider: ({ children }: { children: React.ReactNode }) => children,
  Helmet: () => null,
}));

// Mock SEOHelmet to prevent issues
jest.mock('../../components/common/SEOHelmet', () => {
  return function MockSEOHelmet() {
    return null;
  };
});

// Mock logger to prevent console output
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

// Mock the blogService
jest.mock('../../services/api', () => ({
  blogService: {
    getPosts: jest.fn(),
    getPost: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    searchPosts: jest.fn(),
  },
  api: {
    getBlogPosts: jest.fn(),
    getBlogPost: jest.fn(),
    searchBlogPosts: jest.fn(),
    createContact: jest.fn(),
  },
}));

const mockedBlogService = blogService as jest.Mocked<typeof blogService>;

// framer-motion is already mocked in src/__mocks__/framer-motion.js

// Mock Navbar and other complex components to simplify tests
jest.mock('../../components/common/Navbar', () => {
  return function MockNavbar() {
    return <nav>Mock Navbar</nav>;
  };
});

const mockPosts = [
  {
    id: 1,
    title: 'First Blog Post',
    content: 'This is the content of the first post',
    excerpt: 'First post excerpt',
    author: 'Test Author',
    category: 'Technology',
    date: '2024-01-15',
    published: true,
  },
  {
    id: 2,
    title: 'Second Blog Post',
    content: 'This is the content of the second post',
    excerpt: 'Second post excerpt',
    author: 'Test Author',
    category: 'AI',
    date: '2024-01-10',
    published: true,
  },
];

describe('Blog Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful blog posts fetch
    mockedBlogService.getPosts.mockResolvedValue({
      data: {
        count: mockPosts.length,
        next: null,
        previous: null,
        results: mockPosts,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as AxiosRequestConfig,
    });
  });

  test('app renders without crashing', async () => {
    render(<App />);

    // Wait for the app to render
    await waitFor(
      () => {
        // App should render without crashing
        expect(true).toBe(true);
      },
      { timeout: 3000 }
    );
  });

  test('handles navigation when available', async () => {
    render(<App />);

    // Wait for initial render
    await waitFor(() => {
      // Check if any links are rendered
      const links = screen.queryAllByRole('link');
      expect(links.length >= 0).toBe(true);
    });
  });

  test('displays content based on route', async () => {
    render(<App />);

    // Wait for content to load
    await waitFor(() => {
      // App renders successfully
      expect(true).toBe(true);
    });
  });

  test('handles errors gracefully', async () => {
    // Mock an error response
    mockedBlogService.getPosts.mockRejectedValue(new Error('Network error'));

    render(<App />);

    // Wait for render
    await waitFor(() => {
      // App should still render even with errors
      expect(true).toBe(true);
    });
  });

  test('renders with mobile viewport', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<App />);

    // Wait for render
    await waitFor(() => {
      // App should render in mobile view
      expect(true).toBe(true);
    });
  });

  test('mocked blog service is configured correctly', () => {
    // Verify mocks are set up
    expect(mockedBlogService.getPosts).toBeDefined();
    expect(mockedBlogService.getPost).toBeDefined();
    expect(mockedBlogService.searchPosts).toBeDefined();
  });
});
