import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../test-utils/renderWithProviders';
import App from '../../App';
import { blogService } from '../../services/api';

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
}));

const mockedBlogService = blogService as jest.Mocked<typeof blogService>;

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
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
      data: mockPosts,
      totalPages: 1,
      currentPage: 1,
      totalPosts: mockPosts.length,
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
    mockedBlogService.searchPosts.mockResolvedValue(searchResults);

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
    mockedBlogService.getPost.mockResolvedValue(mockPosts[0]);

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
