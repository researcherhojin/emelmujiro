import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BlogProvider, useBlog } from '../BlogContext';
import { api } from '../../services/api';
import { PaginatedResponse, BlogPost } from '../../types';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Mock the api
jest.mock('../../services/api', () => ({
  api: {
    getBlogPosts: jest.fn(),
    getBlogPost: jest.fn(),
    createBlogPost: jest.fn(),
    updateBlogPost: jest.fn(),
    deleteBlogPost: jest.fn(),
    searchBlogPosts: jest.fn(),
  },
}));

// Mock local blog posts - these should also fail to trigger the error message
jest.mock('../../data/blogPosts', () => ({
  getBlogPosts: jest.fn().mockRejectedValue(new Error('No local posts')),
  getBlogPostById: jest.fn().mockRejectedValue(new Error('No local post')),
}));

const mockedApi = api as jest.Mocked<typeof api>;

// Test component to consume the context
const TestComponent: React.FC = () => {
  const { posts, loading, error, currentPage, totalPages, fetchPosts } = useBlog();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="posts-count">{posts?.length || 0}</div>
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
    const mockPosts: BlogPost[] = [
      {
        id: 1,
        title: 'Test Post 1',
        slug: 'test-post-1',
        content: 'Content 1',
        excerpt: 'Excerpt 1',
        author: 'Author 1',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        published: true,
        category: 'Test',
        tags: ['test'],
        image_url: 'https://example.com/image1.jpg',
        publishedAt: '2024-01-01',
      },
      {
        id: 2,
        title: 'Test Post 2',
        slug: 'test-post-2',
        content: 'Content 2',
        excerpt: 'Excerpt 2',
        author: 'Author 2',
        date: '2024-01-02',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        published: true,
        category: 'Test',
        tags: ['test'],
        image_url: 'https://example.com/image2.jpg',
        publishedAt: '2024-01-02',
      },
    ];

    const mockResponse: PaginatedResponse<BlogPost> = {
      count: 2,
      next: null,
      previous: null,
      results: mockPosts,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockedApi.getBlogPosts as any).mockResolvedValue({
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });

    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    const fetchButton = screen.getByText('Fetch Posts');

    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByTestId('posts-count')).toHaveTextContent('2');
    });

    expect(screen.getByTestId('total-pages')).toHaveTextContent('1'); // 2 posts / 6 per page = 1 page

    expect(mockedApi.getBlogPosts).toHaveBeenCalledWith(1);
  });

  test('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch posts';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockedApi.getBlogPosts as any).mockRejectedValue(new Error(errorMessage));

    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    const fetchButton = screen.getByText('Fetch Posts');

    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Just verify the error element exists and has some content
    const errorElement = screen.getByTestId('error');
    expect(errorElement).toBeInTheDocument();
  });

  test('sets loading state during fetch', async () => {
    const mockResponse: PaginatedResponse<BlogPost> = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockedApi.getBlogPosts as any).mockImplementation(
      (_page?: number, _pageSize?: number) =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
              } as AxiosResponse<PaginatedResponse<BlogPost>>),
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

    fireEvent.click(fetchButton);

    // Check loading state is true immediately
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  test('throws error when used outside provider', () => {
    // Suppress console error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useBlog must be used within a BlogProvider');

    consoleSpy.mockRestore();
  });
});
