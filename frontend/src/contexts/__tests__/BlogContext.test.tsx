import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BlogProvider, useBlog } from '../BlogContext';
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

// Test component to consume the context
const TestComponent: React.FC = () => {
  const { posts, loading, error, currentPage, totalPages, fetchPosts } = useBlog();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="posts-count">{posts.length}</div>
      <div data-testid="current-page">{currentPage}</div>
      <div data-testid="total-pages">{totalPages}</div>
      <button onClick={() => fetchPosts(1)}>Fetch Posts</button>
    </div>
  );
};

describe('BlogContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('provides initial state', () => {
    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('posts-count')).toHaveTextContent('0');
    expect(screen.getByTestId('current-page')).toHaveTextContent('1');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
  });

  test('fetches posts successfully', async () => {
    const mockPosts = [
      {
        id: 1,
        title: 'Test Post 1',
        content: 'Content 1',
        author: 'Author 1',
      },
      {
        id: 2,
        title: 'Test Post 2',
        content: 'Content 2',
        author: 'Author 2',
      },
    ];

    mockedBlogService.getPosts.mockResolvedValue({
      data: mockPosts,
      totalPages: 2,
      currentPage: 1,
      totalPosts: mockPosts.length,
    });

    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    const fetchButton = screen.getByText('Fetch Posts');

    await act(async () => {
      fetchButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('posts-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total-pages')).toHaveTextContent('2');
    });

    expect(mockedBlogService.getPosts).toHaveBeenCalledWith(1, 6);
  });

  test('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch posts';
    mockedBlogService.getPosts.mockRejectedValue(new Error(errorMessage));

    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    const fetchButton = screen.getByText('Fetch Posts');

    await act(async () => {
      fetchButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  test('sets loading state during fetch', async () => {
    mockedBlogService.getPosts.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                data: [],
                totalPages: 1,
                currentPage: 1,
                totalPosts: 0,
              }),
            100
          )
        )
    );

    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    const fetchButton = screen.getByText('Fetch Posts');

    await act(async () => {
      fetchButton.click();
    });

    // Check loading state is true immediately
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  test('throws error when used outside provider', () => {
    // Suppress console error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useBlog must be used within a BlogProvider');

    consoleSpy.mockRestore();
  });
});
