import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { BlogPost } from '../../../types';

// Mock MarkdownRenderer (lazy-loaded in BlogDetail)
vi.mock('../MarkdownRenderer', () => ({
  default: function MarkdownRenderer({ content }: { content: string }) {
    return <div data-testid="markdown-content">{content}</div>;
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

let mockParams: Record<string, string> = { slug: 'test-post' };

vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// Mock useLocalizedPath hook
const mockLocalizedNavigate = vi.fn();
vi.mock('../../../hooks/useLocalizedPath', () => ({
  useLocalizedPath: () => ({
    localizedPath: (path: string) => path,
    localizedNavigate: mockLocalizedNavigate,
    switchLanguagePath: (lang: string) => `/${lang}`,
  }),
}));

// Mock SEOHelmet and StructuredData
vi.mock('../../common/SEOHelmet', () => ({
  default: function SEOHelmet() {
    return null;
  },
}));
vi.mock('../../common/StructuredData', () => ({
  default: function StructuredData() {
    return null;
  },
}));

// Mock UnifiedLoading
vi.mock('../../common/UnifiedLoading', () => ({
  PageLoading: function PageLoading({ message }: { message?: string }) {
    return <div data-testid="page-loading">{message || 'Loading...'}</div>;
  },
}));

// Mock analytics
vi.mock('../../../utils/analytics', () => ({
  trackBlogView: vi.fn(),
}));

// Mock date format
vi.mock('../../../utils/dateFormat', () => ({
  formatDate: (date: string) => date,
}));

// Mock constants
vi.mock('../../../utils/constants', () => ({
  SITE_URL: 'https://example.com',
}));

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

// Mock useAuth hook — use a variable so we can change it per test
let mockUser: { role?: string } | null = null;
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock api
const mockToggleBlogPublish = vi.fn();
const mockDeleteBlogPost = vi.fn();
vi.mock('../../../services/api', () => ({
  api: {
    toggleBlogPublish: (...args: unknown[]) => mockToggleBlogPublish(...args),
    deleteBlogPost: (...args: unknown[]) => mockDeleteBlogPost(...args),
  },
}));

// Mock logger
vi.mock('../../../utils/logger', () => ({
  default: { error: vi.fn() },
}));

// Mock useBlog hook
import { useBlog } from '../../../contexts/BlogContext';
vi.mock('../../../contexts/BlogContext', () => ({
  useBlog: vi.fn(),
  BlogProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import BlogDetail from '../BlogDetail';
import { BlogProvider } from '../../../contexts/BlogContext';

let mockPost: BlogPost | null = null;
let mockLoading = false;
let mockError: string | null = null;

describe('BlogDetail Component', () => {
  beforeEach(() => {
    mockPost = null;
    mockLoading = false;
    mockError = null;
    mockUser = null;
    mockParams = { slug: 'test-post' };
    mockNavigate.mockClear();
    mockFetchPostById.mockClear();
    mockClearCurrentPost.mockClear();
    mockLocalizedNavigate.mockClear();
    mockToggleBlogPublish.mockClear();
    mockDeleteBlogPost.mockClear();

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

  test('renders loading state', () => {
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
    expect(screen.getByText('blogDetail.loading')).toBeInTheDocument();
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
    // 404 errors navigate to /404 page via localizedNavigate, so component returns null
    expect(mockLocalizedNavigate).toHaveBeenCalledWith('/404', { replace: true });
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
    expect(screen.getByText('common.goBack')).toBeInTheDocument();
  });

  test('renders blog post details', async () => {
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
    // MarkdownRenderer is lazy-loaded — wait for Suspense to resolve
    await waitFor(() => {
      expect(screen.getByTestId('markdown-content')).toHaveTextContent('This is test content');
    });
    // Author is shown with t('blogDetail.author') prefix (which returns key)
    expect(screen.getByText(/blogDetail\.author/)).toBeInTheDocument();
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

    // The back button text is t('common.goBack') which returns the key
    const backButton = screen.getAllByText('common.goBack')[0];
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('calls fetchPostById on mount', () => {
    renderComponent();
    expect(mockFetchPostById).toHaveBeenCalledWith('test-post');
  });

  test('calls clearCurrentPost on unmount', () => {
    const { unmount } = renderComponent();
    unmount();
    expect(mockClearCurrentPost).toHaveBeenCalled();
  });

  test('renders content_html with DOMPurify when available', () => {
    mockPost = {
      id: 1,
      title: 'HTML Content Post',
      content: 'Plain text fallback',
      content_html: '<p>Rich <strong>HTML</strong> content</p>',
      excerpt: 'Test excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Test Author',
      category: 'Technology',
      tags: [],
      published: true,
      slug: 'html-content-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    // Should render HTML content, not markdown
    expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument();
    // The sanitized HTML content should be rendered via dangerouslySetInnerHTML
    const htmlContainer =
      document.querySelector('[dangerouslysetinnerhtml]') || document.querySelector('.prose');
    expect(htmlContainer).toBeTruthy();
    expect(htmlContainer!.innerHTML).toContain('<strong>HTML</strong>');
  });

  test('renders markdown fallback when no content_html', () => {
    mockPost = {
      id: 1,
      title: 'Markdown Post',
      content: '# Markdown heading',
      excerpt: 'Test excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Test Author',
      category: 'Technology',
      tags: [],
      published: true,
      slug: 'markdown-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    expect(screen.getByTestId('markdown-content')).toHaveTextContent('# Markdown heading');
  });

  test('renders admin toolbar when user is admin', () => {
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'Admin Post',
      content: 'Admin content',
      excerpt: 'Test excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'admin-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    // Admin toolbar should be visible
    expect(screen.getByText('blogAdmin.label')).toBeInTheDocument();
    expect(screen.getByText('blogAdmin.published')).toBeInTheDocument();
    expect(screen.getByText('common.edit')).toBeInTheDocument();
    expect(screen.getByText('common.delete')).toBeInTheDocument();
  });

  test('does not render admin toolbar for non-admin users', () => {
    mockUser = { role: 'user' };
    mockPost = {
      id: 1,
      title: 'Regular Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Author',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'regular-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    expect(screen.queryByText('common.edit')).not.toBeInTheDocument();
    expect(screen.queryByText('common.delete')).not.toBeInTheDocument();
  });

  test('admin toolbar shows draft status for unpublished post', () => {
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'Draft Post',
      content: 'Draft content',
      excerpt: 'Draft excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: false,
      slug: 'draft-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    expect(screen.getByText('blogAdmin.draft')).toBeInTheDocument();
  });

  test('admin toggle publish calls API and refetches post', async () => {
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'Toggle Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'toggle-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    mockToggleBlogPublish.mockResolvedValue({
      data: { id: 1, is_published: false },
    });

    renderComponent();

    // Click the publish toggle button
    const publishBtn = screen.getByText('blogAdmin.published');
    fireEvent.click(publishBtn);

    await screen.findByRole('alert');

    expect(mockToggleBlogPublish).toHaveBeenCalledWith('test-post');
    expect(mockFetchPostById).toHaveBeenCalledWith('test-post');
  });

  test('admin toggle publish shows error toast on failure', async () => {
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'Error Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'error-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    mockToggleBlogPublish.mockRejectedValue(new Error('API error'));

    renderComponent();

    fireEvent.click(screen.getByText('blogAdmin.published'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('blogAdmin.toggleError');
  });

  test('admin delete flow shows confirmation and deletes post', async () => {
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'Delete Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'delete-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    mockDeleteBlogPost.mockResolvedValue({});

    renderComponent();

    // Click delete button — shows confirmation
    fireEvent.click(screen.getByText('common.delete'));
    expect(screen.getByText('blogAdmin.confirmDelete')).toBeInTheDocument();
    expect(screen.getByText('common.confirm')).toBeInTheDocument();
    expect(screen.getByText('common.cancel')).toBeInTheDocument();

    // Confirm delete
    fireEvent.click(screen.getByText('common.confirm'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('blogAdmin.deleted');
    expect(mockDeleteBlogPost).toHaveBeenCalledWith('test-post');
  });

  test('admin delete confirmation can be cancelled', () => {
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'Cancel Delete Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'cancel-delete-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    // Click delete, then cancel
    fireEvent.click(screen.getByText('common.delete'));
    expect(screen.getByText('blogAdmin.confirmDelete')).toBeInTheDocument();

    fireEvent.click(screen.getByText('common.cancel'));
    // Confirmation should be gone, delete button should be back
    expect(screen.queryByText('blogAdmin.confirmDelete')).not.toBeInTheDocument();
    expect(screen.getByText('common.delete')).toBeInTheDocument();
  });

  test('admin delete shows error toast on failure', async () => {
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'Error Delete Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'error-delete-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    mockDeleteBlogPost.mockRejectedValue(new Error('Delete failed'));

    renderComponent();

    fireEvent.click(screen.getByText('common.delete'));
    fireEvent.click(screen.getByText('common.confirm'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('blogAdmin.deleteError');
  });

  test('admin edit button navigates to edit page', () => {
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'Edit Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'edit-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    fireEvent.click(screen.getByText('common.edit'));
    expect(mockLocalizedNavigate).toHaveBeenCalledWith('/insights/edit/1');
  });

  test('renders post without image_url', () => {
    mockPost = {
      id: 1,
      title: 'No Image Post',
      content: 'Content without image',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Author',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'no-image-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    expect(screen.getByText('No Image Post')).toBeInTheDocument();
    // No img element should be present
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('renders post with tags', () => {
    mockPost = {
      id: 1,
      title: 'Tagged Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Author',
      category: 'Tech',
      tags: ['react', 'typescript', 'vite'],
      published: true,
      slug: 'tagged-post',
      date: '2024-01-01',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText('vite')).toBeInTheDocument();
  });

  test('renders post with date and category metadata', () => {
    mockPost = {
      id: 1,
      title: 'Meta Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-06-15',
      updated_at: '2024-06-15',
      author: 'Author',
      category: 'AI Education',
      tags: [],
      published: true,
      slug: 'meta-post',
      date: '2024-06-15',
      publishedAt: '2024-06-15',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    expect(screen.getByText('AI Education')).toBeInTheDocument();
    // Date should be rendered via formatDate (mocked to return the date string as-is)
    expect(screen.getByText('2024-06-15')).toBeInTheDocument();
  });

  test('handles error state go back button click', () => {
    mockError = 'Something went wrong';
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: null,
      loading: false,
      error: mockError,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const backButton = screen.getByText('common.goBack');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('preventImageAction prevents default on context menu and drag (line 24)', () => {
    mockPost = {
      id: 1,
      title: 'Image Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Author',
      category: 'Test',
      tags: [],
      image_url: 'https://example.com/test.jpg',
      published: true,
      slug: 'image-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();

    // Test contextmenu event preventDefault (line 24)
    const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(contextMenuEvent, 'preventDefault');
    img.dispatchEvent(contextMenuEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();

    // Test dragstart event preventDefault (line 24)
    const dragStartEvent = new Event('dragstart', { bubbles: true, cancelable: true });
    const dragPreventSpy = vi.spyOn(dragStartEvent, 'preventDefault');
    img.dispatchEvent(dragStartEvent);
    expect(dragPreventSpy).toHaveBeenCalled();
  });

  test('renders post without updated_at, falling back to date for SEO meta (lines 196, 208)', () => {
    mockPost = {
      id: 1,
      title: 'No Updated At Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-03-01',
      author: 'Author',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'no-updated-at',
      date: '2024-03-01',
      publishedAt: '2024-03-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    // The post should render successfully even without updated_at
    expect(screen.getByText('No Updated At Post')).toBeInTheDocument();
  });

  test('renders post without excerpt, falling back to title for SEO meta (lines 189, 205)', () => {
    mockPost = {
      id: 1,
      title: 'No Excerpt Post',
      content: 'Content',
      created_at: '2024-03-01',
      updated_at: '2024-03-01',
      author: 'Author',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'no-excerpt',
      date: '2024-03-01',
      publishedAt: '2024-03-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    expect(screen.getByText('No Excerpt Post')).toBeInTheDocument();
  });

  test('admin toggle publish shows unpublished toast when toggling to draft', async () => {
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'Unpublish Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: false,
      slug: 'unpublish-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    // Toggle returns published: true (toggling from draft to published)
    mockToggleBlogPublish.mockResolvedValue({
      data: { id: 1, is_published: true },
    });

    renderComponent();

    // Click the draft toggle button
    fireEvent.click(screen.getByText('blogAdmin.draft'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('blogAdmin.published');
  });

  test('renders post without category or date', () => {
    mockPost = {
      id: 1,
      title: 'Bare Post',
      content: 'Content',
      excerpt: '',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Author',
      tags: [],
      published: true,
      slug: 'bare-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    // Should still render the title
    expect(screen.getByText('Bare Post')).toBeInTheDocument();
  });

  test('handleTogglePublish returns early when id is undefined (line 40)', async () => {
    // Remove id from params to trigger the early return guard
    mockParams = {};
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'No ID Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'no-id-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    // Click the publish toggle button
    fireEvent.click(screen.getByText('blogAdmin.published'));

    // Wait a tick to let the async handler run
    await new Promise((r) => setTimeout(r, 0));

    // API should NOT have been called because id is undefined
    expect(mockToggleBlogPublish).not.toHaveBeenCalled();
  });

  test('handleDelete setTimeout callback navigates to /insights after 500ms (line 57)', async () => {
    vi.useFakeTimers();

    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'Delete Navigate Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'delete-navigate-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    mockDeleteBlogPost.mockResolvedValue({});

    renderComponent();

    // Click delete to show confirmation
    fireEvent.click(screen.getByText('common.delete'));
    // Confirm delete
    fireEvent.click(screen.getByText('common.confirm'));

    // Flush the async deleteBlogPost promise
    await vi.advanceTimersByTimeAsync(0);

    expect(mockDeleteBlogPost).toHaveBeenCalledWith('test-post');

    // Navigate should not have been called yet (setTimeout 500ms pending)
    expect(mockLocalizedNavigate).not.toHaveBeenCalled();

    // Advance timers past the 500ms setTimeout
    await vi.advanceTimersByTimeAsync(500);

    expect(mockLocalizedNavigate).toHaveBeenCalledWith('/insights');

    vi.useRealTimers();
  });

  test('handleDelete returns early when id is undefined (line 53)', async () => {
    // Remove id from params to trigger the early return guard
    mockParams = {};
    mockUser = { role: 'admin' };
    mockPost = {
      id: 1,
      title: 'No ID Delete Post',
      content: 'Content',
      excerpt: 'Excerpt',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      author: 'Admin',
      category: 'Test',
      tags: [],
      published: true,
      slug: 'no-id-delete-post',
      publishedAt: '2024-01-01',
    };
    (useBlog as ReturnType<typeof vi.fn>).mockReturnValue({
      currentPost: mockPost,
      loading: false,
      error: null,
      fetchPostById: mockFetchPostById,
      clearCurrentPost: mockClearCurrentPost,
      posts: [],
      fetchPosts: vi.fn(),
      totalPages: 1,
      currentPage: 1,
    });

    renderComponent();

    // Click delete to show confirmation
    fireEvent.click(screen.getByText('common.delete'));
    // Confirm delete
    fireEvent.click(screen.getByText('common.confirm'));

    // Wait a tick to let the async handler run
    await new Promise((r) => setTimeout(r, 0));

    // API should NOT have been called because id is undefined
    expect(mockDeleteBlogPost).not.toHaveBeenCalled();
  });
});
