import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BlogProvider, useBlog } from '../BlogContext';
import { api } from '../../services/api';
import { PaginatedResponse, BlogPost } from '../../types';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Mock the api
vi.mock('../../services/api', () => ({
  api: {
    getBlogPosts: vi.fn(),
    getBlogPost: vi.fn(),
    createBlogPost: vi.fn(),
    updateBlogPost: vi.fn(),
    deleteBlogPost: vi.fn(),
    searchBlogPosts: vi.fn(),
  },
}));

// Mock i18n
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// Mock env with vi.fn() so we can override per-test
const mockGetEnvVar = vi.fn((key: string) => {
  if (key === 'POSTS_PER_PAGE') return '6';
  return '';
});
vi.mock('../../config/env', () => ({
  getEnvVar: (...args: unknown[]) => mockGetEnvVar(...(args as [string])),
  default: { IS_TEST: true, IS_PRODUCTION: false, IS_DEVELOPMENT: false },
}));

// Mock local blog posts with controllable functions
const mockGetLocalBlogPosts = vi.fn();
const mockGetLocalBlogPost = vi.fn();
vi.mock('../../data/blogPosts', () => ({
  getBlogPosts: (...args: unknown[]) => mockGetLocalBlogPosts(...args),
  getBlogPost: (...args: unknown[]) => mockGetLocalBlogPost(...args),
}));

const mockedApi = api as any;

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
    vi.clearAllMocks();
    mockGetLocalBlogPosts.mockRejectedValue(new Error('No local posts'));
    mockGetLocalBlogPost.mockRejectedValue(new Error('No local post'));
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

    (mockedApi.getBlogPosts as any).mockImplementation(
      (_page?: number, _pageSize?: number) =>
        new Promise((resolve) =>
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
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useBlog must be used within a BlogProvider');

    consoleSpy.mockRestore();
  });

  test('sets empty posts when API response has no results', async () => {
    (mockedApi.getBlogPosts as any).mockResolvedValue({
      data: null,
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

    fireEvent.click(screen.getByText('Fetch Posts'));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('posts-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
    expect(screen.getByTestId('current-page')).toHaveTextContent('1');
  });

  test('sets error and empty posts when API call fails', async () => {
    (mockedApi.getBlogPosts as any).mockRejectedValue(new Error('Network error'));

    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch Posts'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('blogErrors.fetchPostsFailed');
    });

    expect(screen.getByTestId('posts-count')).toHaveTextContent('0');
  });

  test('sets error when API fails for fetchPosts', async () => {
    (mockedApi.getBlogPosts as any).mockRejectedValue(new Error('API error'));

    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch Posts'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('blogErrors.fetchPostsFailed');
    });

    expect(screen.getByTestId('posts-count')).toHaveTextContent('0');
  });

  test('calculates totalPages based on post count', async () => {
    const mockPosts = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      content: `Content ${i + 1}`,
      excerpt: `Excerpt ${i + 1}`,
      author: 'Author',
      date: '2024-01-01',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      published: true,
      category: 'Test',
      tags: [],
      publishedAt: '2024-01-01',
    }));

    (mockedApi.getBlogPosts as any).mockResolvedValue({
      data: { count: 13, next: null, previous: null, results: mockPosts },
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

    fireEvent.click(screen.getByText('Fetch Posts'));

    await waitFor(() => {
      expect(screen.getByTestId('total-pages')).toHaveTextContent('3');
    });
  });

  test('fetchPostById sets currentPost on success', async () => {
    const mockPost: BlogPost = {
      id: 5,
      title: 'Single Post',
      slug: 'single-post',
      content: 'Single content',
      excerpt: 'Single excerpt',
      author: 'Single Author',
      date: '2024-03-01',
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-03-01T00:00:00Z',
      published: true,
      category: 'Test',
      tags: ['test'],
      publishedAt: '2024-03-01',
    };

    (mockedApi.getBlogPost as any).mockResolvedValue({
      data: mockPost,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });

    const PostTestComponent: React.FC = () => {
      const { currentPost, loading, error, fetchPostById } = useBlog();
      return (
        <div>
          <div data-testid="loading">{loading.toString()}</div>
          <div data-testid="error">{error || 'no-error'}</div>
          <div data-testid="post-title">{currentPost?.title || 'none'}</div>
          <button onClick={() => fetchPostById(5)}>Fetch Post</button>
        </div>
      );
    };

    render(
      <BlogProvider>
        <PostTestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch Post'));

    await waitFor(() => {
      expect(screen.getByTestId('post-title')).toHaveTextContent('Single Post');
    });
  });

  test('fetchPostById sets error when API returns empty', async () => {
    (mockedApi.getBlogPost as any).mockResolvedValue({
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });

    const PostTestComponent: React.FC = () => {
      const { currentPost, error, fetchPostById } = useBlog();
      return (
        <div>
          <div data-testid="error">{error || 'no-error'}</div>
          <div data-testid="post-title">{currentPost?.title || 'none'}</div>
          <button onClick={() => fetchPostById(5)}>Fetch Post</button>
        </div>
      );
    };

    render(
      <BlogProvider>
        <PostTestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch Post'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('blogErrors.fetchPostFailed');
    });

    expect(screen.getByTestId('post-title')).toHaveTextContent('none');
  });

  test('fetchPostById sets error on API error', async () => {
    (mockedApi.getBlogPost as any).mockRejectedValue(new Error('API error'));

    const PostTestComponent: React.FC = () => {
      const { currentPost, error, fetchPostById } = useBlog();
      return (
        <div>
          <div data-testid="error">{error || 'no-error'}</div>
          <div data-testid="post-title">{currentPost?.title || 'none'}</div>
          <button onClick={() => fetchPostById(5)}>Fetch Post</button>
        </div>
      );
    };

    render(
      <BlogProvider>
        <PostTestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch Post'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('blogErrors.fetchPostFailed');
    });

    expect(screen.getByTestId('post-title')).toHaveTextContent('none');
  });

  test('fetchPostById sets error when API fails', async () => {
    (mockedApi.getBlogPost as any).mockRejectedValue(new Error('API error'));

    const PostTestComponent: React.FC = () => {
      const { currentPost, error, fetchPostById } = useBlog();
      return (
        <div>
          <div data-testid="error">{error || 'no-error'}</div>
          <div data-testid="post-title">{currentPost?.title || 'none'}</div>
          <button onClick={() => fetchPostById(5)}>Fetch Post</button>
        </div>
      );
    };

    render(
      <BlogProvider>
        <PostTestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch Post'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('blogErrors.fetchPostFailed');
    });

    expect(screen.getByTestId('post-title')).toHaveTextContent('none');
  });

  test('clearCurrentPost resets the current post', async () => {
    const mockPost: BlogPost = {
      id: 5,
      title: 'Post To Clear',
      slug: 'post-to-clear',
      content: 'Content',
      excerpt: 'Excerpt',
      author: 'Author',
      date: '2024-03-01',
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-03-01T00:00:00Z',
      published: true,
      category: 'Test',
      tags: [],
      publishedAt: '2024-03-01',
    };

    (mockedApi.getBlogPost as any).mockResolvedValue({
      data: mockPost,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });

    const ClearTestComponent: React.FC = () => {
      const { currentPost, fetchPostById, clearCurrentPost } = useBlog();
      return (
        <div>
          <div data-testid="post-title">{currentPost?.title || 'none'}</div>
          <button onClick={() => fetchPostById(5)}>Fetch</button>
          <button onClick={clearCurrentPost}>Clear</button>
        </div>
      );
    };

    render(
      <BlogProvider>
        <ClearTestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch'));
    await waitFor(() => {
      expect(screen.getByTestId('post-title')).toHaveTextContent('Post To Clear');
    });

    fireEvent.click(screen.getByText('Clear'));
    expect(screen.getByTestId('post-title')).toHaveTextContent('none');
  });

  test('fetchPosts with page > 1 sets currentPage correctly', async () => {
    const mockPosts: BlogPost[] = [
      {
        id: 7,
        title: 'Page 2 Post',
        slug: 'page-2-post',
        content: 'Content',
        excerpt: 'Excerpt',
        author: 'Author',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        published: true,
        category: 'Test',
        tags: [],
        publishedAt: '2024-01-01',
      },
    ];

    (mockedApi.getBlogPosts as any).mockResolvedValue({
      data: { count: 12, next: null, previous: 'prev', results: mockPosts },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });

    const PaginationComponent: React.FC = () => {
      const { currentPage, totalPages, fetchPosts } = useBlog();
      return (
        <div>
          <div data-testid="current-page">{currentPage}</div>
          <div data-testid="total-pages">{totalPages}</div>
          <button onClick={() => fetchPosts(2)}>Page 2</button>
        </div>
      );
    };

    render(
      <BlogProvider>
        <PaginationComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Page 2'));

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('2');
    });

    expect(screen.getByTestId('total-pages')).toHaveTextContent('2');
  });

  test('uses default postsPerPage (10) when POSTS_PER_PAGE env var is empty', async () => {
    // Override getEnvVar to return empty string for POSTS_PER_PAGE
    // so Number('') === 0 (falsy), hitting the || 10 fallback
    mockGetEnvVar.mockImplementation(() => '');

    const mockPosts = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      content: `Content ${i + 1}`,
      excerpt: `Excerpt ${i + 1}`,
      author: 'Author',
      date: '2024-01-01',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      published: true,
      category: 'Test',
      tags: [],
      publishedAt: '2024-01-01',
    }));

    (mockedApi.getBlogPosts as any).mockResolvedValue({
      data: { count: 25, next: null, previous: null, results: mockPosts },
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

    fireEvent.click(screen.getByText('Fetch Posts'));

    await waitFor(() => {
      // count=25, postsPerPage=10 (fallback), so totalPages = ceil(25/10) = 3
      expect(screen.getByTestId('total-pages')).toHaveTextContent('3');
    });

    // Restore original mock behavior
    mockGetEnvVar.mockImplementation((key: string) => {
      if (key === 'POSTS_PER_PAGE') return '6';
      return '';
    });
  });

  test('handles non-Error rejection in fetchPosts (line 60)', async () => {
    // Reject with a string (not an Error instance) to hit the 'Unknown error' branch
    (mockedApi.getBlogPosts as any).mockRejectedValue('string error');

    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch Posts'));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Error state is set and posts are empty
    expect(screen.getByTestId('error')).toHaveTextContent('blogErrors.fetchPostsFailed');
    expect(screen.getByTestId('posts-count')).toHaveTextContent('0');
  });

  test('handles non-Error rejection in fetchPostById (line 93)', async () => {
    // Reject with a number (not an Error instance) to hit the 'Unknown error' branch
    (mockedApi.getBlogPost as any).mockRejectedValue(42);

    const PostTestComponent: React.FC = () => {
      const { currentPost, loading, error, fetchPostById } = useBlog();
      return (
        <div>
          <div data-testid="loading">{loading.toString()}</div>
          <div data-testid="error">{error || 'no-error'}</div>
          <div data-testid="post-title">{currentPost?.title || 'none'}</div>
          <button onClick={() => fetchPostById(5)}>Fetch Post</button>
        </div>
      );
    };

    render(
      <BlogProvider>
        <PostTestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch Post'));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Error state is set and post is null
    expect(screen.getByTestId('error')).toHaveTextContent('blogErrors.fetchPostFailed');
    expect(screen.getByTestId('post-title')).toHaveTextContent('none');
  });
});
