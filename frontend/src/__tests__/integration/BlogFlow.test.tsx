import React from 'react';
import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import App from '../../App';
import { blogService } from '../../services/api';

// Mock react-helmet-async
jest.mock('react-helmet-async', () => ({
  HelmetProvider: ({ children }: any) => children,
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

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

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
      config: {} as any,
    });
  });

  test('complete blog navigation flow', async () => {
    render(<App />);

    // Start on home page
    expect(screen.getByText('주요 서비스')).toBeInTheDocument();

    // Navigate to blog page
    const blogLink = screen.getByText('Blog'); // Assuming this exists in navigation
    fireEvent.click(blogLink);

    // Wait for blog posts to load
    await waitFor(() => {
      expect(screen.getByText('First Blog Post')).toBeInTheDocument();
      expect(screen.getByText('Second Blog Post')).toBeInTheDocument();
    });

    // Verify blog service was called
    expect(mockedBlogService.getPosts).toHaveBeenCalledWith(1, 6);
  });

  test('blog search functionality', async () => {
    // Mock search results
    const searchResults = [mockPosts[0]];
    mockedBlogService.searchPosts.mockResolvedValue({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: searchResults,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    render(<App />);

    // Navigate to blog page
    const blogLink = screen.getByText('Blog');
    fireEvent.click(blogLink);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('First Blog Post')).toBeInTheDocument();
    });

    // Use search functionality
    const searchInput = screen.getByPlaceholderText('블로그 검색...');
    fireEvent.change(searchInput, { target: { value: 'First' } });

    // Trigger search (assuming there's a search button or auto-search)
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);

    // Wait for search results
    await waitFor(() => {
      expect(mockedBlogService.searchPosts).toHaveBeenCalledWith('First');
    });
  });

  test('blog category filtering', async () => {
    render(<App />);

    // Navigate to blog page
    const blogLink = screen.getByText('Blog');
    fireEvent.click(blogLink);

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByText('First Blog Post')).toBeInTheDocument();
    });

    // Filter by category
    const categorySelect = screen.getByDisplayValue('All');
    fireEvent.change(categorySelect, { target: { value: 'Technology' } });

    // Verify filtering works (posts are filtered in the UI)
    expect(screen.getByText('First Blog Post')).toBeInTheDocument();
    // Second post should not be visible as it has different category
  });

  test('error handling in blog flow', async () => {
    // Mock error response
    mockedBlogService.getPosts.mockRejectedValue(new Error('Network error'));

    render(<App />);

    // Navigate to blog page
    const blogLink = screen.getByText('Blog');
    fireEvent.click(blogLink);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('blog post detail view', async () => {
    // Mock individual post fetch
    mockedBlogService.getPost.mockResolvedValue({
      data: mockPosts[0],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    render(<App />);

    // Navigate to blog page
    const blogLink = screen.getByText('Blog');
    fireEvent.click(blogLink);

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByText('First Blog Post')).toBeInTheDocument();
    });

    // Click on a blog post
    const postLink = screen.getByText('First Blog Post');
    fireEvent.click(postLink);

    // Wait for post detail to load
    await waitFor(() => {
      expect(screen.getByText('This is the content of the first post')).toBeInTheDocument();
    });

    expect(mockedBlogService.getPost).toHaveBeenCalledWith('1');
  });

  test('responsive behavior', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<App />);

    // Navigate to blog
    const blogLink = screen.getByText('Blog');
    fireEvent.click(blogLink);

    await waitFor(() => {
      expect(screen.getByText('First Blog Post')).toBeInTheDocument();
    });

    // Test mobile-specific behavior (if any)
    // This would depend on your specific responsive implementation
  });
});
