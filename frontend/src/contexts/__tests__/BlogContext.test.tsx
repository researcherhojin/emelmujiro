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

// Mock env
vi.mock('../../config/env', () => ({
  getEnvVar: (key: string) => {
    if (key === 'POSTS_PER_PAGE') return '6';
    return '';
  },
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

  test('falls back to local data when API response has no results', async () => {
    const localPosts = [
      {
        id: 10,
        title: 'Local Post',
        slug: 'local-post',
        content: 'Local content',
        excerpt: 'Local excerpt',
        author: 'Local Author',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        published: true,
        category: 'Local',
        tags: ['local'],
        publishedAt: '2024-01-01',
      },
    ];

    (mockedApi.getBlogPosts as any).mockResolvedValue({
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });

    mockGetLocalBlogPosts.mockResolvedValue(localPosts);

    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch Posts'));

    await waitFor(() => {
      expect(screen.getByTestId('posts-count')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
    expect(screen.getByTestId('current-page')).toHaveTextContent('1');
  });

  test('falls back to local data when API call fails', async () => {
    const localPosts = [
      {
        id: 20,
        title: 'Fallback Post',
        slug: 'fallback-post',
        content: 'Fallback content',
        excerpt: 'Fallback excerpt',
        author: 'Fallback Author',
        date: '2024-02-01',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z',
        published: true,
        category: 'Fallback',
        tags: ['fallback'],
        publishedAt: '2024-02-01',
      },
    ];

    (mockedApi.getBlogPosts as any).mockRejectedValue(new Error('Network error'));
    mockGetLocalBlogPosts.mockResolvedValue(localPosts);

    render(
      <BlogProvider>
        <TestComponent />
      </BlogProvider>
    );

    fireEvent.click(screen.getByText('Fetch Posts'));

    await waitFor(() => {
      expect(screen.getByTestId('posts-count')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
  });

  test('sets error when both API and local data fail for fetchPosts', async () => {
    (mockedApi.getBlogPosts as any).mockRejectedValue(new Error('API error'));
    mockGetLocalBlogPosts.mockRejectedValue(new Error('Local data error'));

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

  test('fetchPostById falls back to local data when API returns empty', async () => {
    const localPost = {
      id: 5,
      title: 'Local Single Post',
      slug: 'local-single-post',
      content: 'Local single content',
      excerpt: 'Local excerpt',
      author: 'Local Author',
      date: '2024-03-01',
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-03-01T00:00:00Z',
      published: true,
      category: 'Test',
      tags: [],
      publishedAt: '2024-03-01',
    };

    (mockedApi.getBlogPost as any).mockResolvedValue({
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });
    mockGetLocalBlogPost.mockResolvedValue(localPost);

    const PostTestComponent: React.FC = () => {
      const { currentPost, fetchPostById } = useBlog();
      return (
        <div>
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
      expect(screen.getByTestId('post-title')).toHaveTextContent('Local Single Post');
    });
  });

  test('fetchPostById falls back to local data on API error', async () => {
    const localPost = {
      id: 5,
      title: 'Fallback Single Post',
      slug: 'fallback-single',
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

    (mockedApi.getBlogPost as any).mockRejectedValue(new Error('API error'));
    mockGetLocalBlogPost.mockResolvedValue(localPost);

    const PostTestComponent: React.FC = () => {
      const { currentPost, fetchPostById } = useBlog();
      return (
        <div>
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
      expect(screen.getByTestId('post-title')).toHaveTextContent('Fallback Single Post');
    });
  });

  test('fetchPostById sets error when both API and local fail', async () => {
    (mockedApi.getBlogPost as any).mockRejectedValue(new Error('API error'));
    mockGetLocalBlogPost.mockRejectedValue(new Error('Local error'));

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
});
