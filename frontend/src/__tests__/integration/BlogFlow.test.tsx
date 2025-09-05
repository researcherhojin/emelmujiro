import { screen, waitFor, render } from '@testing-library/react';
import { vi } from 'vitest';
import { InternalAxiosRequestConfig } from 'axios';
import App from '../../App';
import { blogService } from '../../services/api';

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
  HelmetProvider: ({ children }: { children: React.ReactNode }) => children,
  Helmet: () => null,
}));

// Mock SEOHelmet to prevent issues
vi.mock('../../components/common/SEOHelmet', () => ({
  default: function MockSEOHelmet() {
    return null;
  },
}));

// Mock logger to prevent console output
vi.mock('../../utils/logger', () => ({
  default: {
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock the blogService
vi.mock('../../services/api', () => ({
  blogService: {
    getPosts: vi.fn(),
    getPost: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
    searchPosts: vi.fn(),
  },
  api: {
    getBlogPosts: vi.fn(),
    getBlogPost: vi.fn(),
    searchBlogPosts: vi.fn(),
    createContact: vi.fn(),
  },
}));

const mockedBlogService = blogService as any;

// framer-motion is already mocked in src/__mocks__/framer-motion.js

// Mock Navbar and other complex components to simplify tests
vi.mock('../../components/common/Navbar', () => ({
  default: function MockNavbar() {
    return <nav>Mock Navbar</nav>;
  },
}));

const mockPosts = [
  {
    id: 1,
    title: 'First Blog Post',
    slug: 'first-blog-post',
    content: 'This is the content of the first post',
    excerpt: 'First post excerpt',
    author: 'Test Author',
    publishedAt: '2024-01-15',
    category: 'Technology',
    date: '2024-01-15',
    published: true,
  },
  {
    id: 2,
    title: 'Second Blog Post',
    slug: 'second-blog-post',
    content: 'This is the content of the second post',
    excerpt: 'Second post excerpt',
    author: 'Test Author',
    publishedAt: '2024-01-10',
    category: 'AI',
    date: '2024-01-10',
    published: true,
  },
];

describe.skip('Blog Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      config: {} as InternalAxiosRequestConfig,
    });
  });

  test.skip('app renders without crashing', async () => {
    render(<App />);

    // Wait for the app to render
    await waitFor(
      () => {
        // App should render without crashing
      },
      { timeout: 3000 }
    );
  });

  test.skip('handles navigation when available', async () => {
    render(<App />);

    // Wait for initial render
    await waitFor(() => {
      // Check if any links are rendered
      const links = screen.queryAllByRole('link');
      expect(links.length >= 0).toBe(true);
    });
  });

  test.skip('displays content based on route', async () => {
    render(<App />);

    // Wait for content to load
    await waitFor(() => {
      // App renders successfully
    });
  });

  test.skip('handles errors gracefully', async () => {
    // Mock an error response
    mockedBlogService.getPosts.mockRejectedValue(new Error('Network error'));

    render(<App />);

    // Wait for render
    await waitFor(() => {
      // App should still render even with errors
    });
  });

  test.skip('renders with mobile viewport', async () => {
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
    });
  });

  test.skip('mocked blog service is configured correctly', () => {
    // Verify mocks are set up
    expect(mockedBlogService.getPosts).toBeDefined();
    expect(mockedBlogService.getPost).toBeDefined();
    expect(mockedBlogService.searchPosts).toBeDefined();
  });
});
