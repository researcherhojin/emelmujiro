import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BlogDetail from '../BlogDetail';
import { BlogProvider } from '../../../contexts/BlogContext';
import { BlogPost } from '../../../types';

// Mock react-markdown to avoid dependency issues
vi.mock('react-markdown', () => ({
  default: function ReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>;
  },
}));

// Mock remark-gfm to avoid dependency issues
vi.mock('remark-gfm', () => ({
  default: function remarkGfm() {
    return {};
  },
}));

// Mock ErrorBoundary to prevent error catching during tests
vi.mock('../../common/ErrorBoundary', () => ({
  default: function ErrorBoundary({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  },
}));

// Mock PageLoading component
vi.mock('../../common/PageLoading', () => ({
  default: function PageLoading({ message }: { message?: string }) {
    return <div>{message || 'Loading...'}</div>;
  },
}));

// Mock SEO component that uses Helmet
vi.mock('../../layout/SEO', () => ({
  default: function SEO() {
    return null;
  },
}));

// Mock other blog components
vi.mock('../BlogInteractions', () => ({
  default: function BlogInteractions() {
    return <div>Blog Interactions</div>;
  },
}));

vi.mock('../BlogComments', () => ({
  default: function BlogComments() {
    return <div>Blog Comments</div>;
  },
}));

const mockNavigate = vi.fn();
const mockFetchPostById = vi.fn();
const mockClearCurrentPost = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  };
});

// Mock useBlog hook
import { useBlog } from '../../../contexts/BlogContext';
vi.mock('../../../contexts/BlogContext', () => ({
  useBlog: vi.fn(),
  BlogProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

let mockPost: BlogPost | null = null;
let mockLoading = false;
let mockError: string | null = null;

describe('BlogDetail Component', () => {
  beforeEach(() => {
    mockPost = null;
    mockLoading = false;
    mockError = null;
    mockNavigate.mockClear();
    mockFetchPostById.mockClear();
    mockClearCurrentPost.mockClear();

    // Setup the mock implementation
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: mockLoading,
      error: mockError,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <BlogProvider>
          <BlogDetail />
        </BlogProvider>
      </BrowserRouter>
    );
  };

  test.skip('renders loading state', () => {
    mockLoading = true;
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: mockLoading,
      error: mockError,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();
    expect(
      screen.getByText('블로그 포스트를 불러오는 중입니다...')
    ).toBeInTheDocument();
  });

  test('renders error state for 404', () => {
    mockError = '404';
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: mockLoading,
      error: mockError,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();
    // 404 errors navigate to /404 page, so component returns null
    expect(mockNavigate).toHaveBeenCalledWith('/404', { replace: true });
  });

  test('renders error state for other errors', () => {
    mockError = 'Network error';
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: mockLoading,
      error: mockError,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();
    // Check for error message (the actual error message is shown)
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('뒤로 가기')).toBeInTheDocument();
  });

  test('renders blog post details', () => {
    mockPost = {
      id: 1,
      title: 'Test Blog Post',
      content: 'This is test content',
      excerpt: 'Test excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      views: 100,
      likes: 10,
      author: 'Test Author',
      category: 'Technology',
      tags: ['test', 'blog'],
      image_url: 'test.jpg',
      published: true,
      slug: 'test-blog-post',
      readTime: 5,
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: mockLoading,
      error: mockError,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-content')).toHaveTextContent(
      'This is test content'
    );
    // Author is shown with "작성자: " prefix
    expect(screen.getByText(/작성자: Test Author/)).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  test('handles back button click', () => {
    mockPost = {
      id: 1,
      title: 'Test Blog Post',
      content: 'This is test content',
      excerpt: 'Test excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      views: 100,
      likes: 10,
      author: 'Test Author',
      category: 'Technology',
      tags: ['test', 'blog'],
      image_url: 'test.jpg',
      published: true,
      slug: 'test-blog-post',
      readTime: 5,
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: mockLoading,
      error: mockError,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    const backButton = screen.getByText('뒤로가기');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('calls fetchPostById on mount', () => {
    renderComponent();
    expect(mockFetchPostById).toHaveBeenCalledWith('1');
  });

  test('calls clearCurrentPost on unmount', () => {
    const { unmount } = renderComponent();
    unmount();
    expect(mockClearCurrentPost).toHaveBeenCalled();
  });
});
