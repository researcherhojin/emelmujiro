import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogListPage from '../BlogListPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) return `${key}:${JSON.stringify(params)}`;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

const mockFetchPosts = vi.fn();
const mockBlogContext = {
  posts: [] as Record<string, unknown>[],
  currentPost: null,
  loading: false,
  error: null as string | null,
  totalPages: 1,
  currentPage: 1,
  fetchPosts: mockFetchPosts,
  fetchPostById: vi.fn(),
  clearCurrentPost: vi.fn(),
};

vi.mock('../../../contexts/BlogContext', () => ({
  useBlog: () => mockBlogContext,
}));

// Capture onSearch callback to simulate search filtering
let capturedOnSearch: ((results: Record<string, unknown>[]) => void) | null = null;

vi.mock('../BlogSearch', () => ({
  default: ({ onSearch }: { onSearch: (results: Record<string, unknown>[]) => void }) => {
    capturedOnSearch = onSearch;
    return (
      <input
        data-testid="blog-search"
        onChange={() => onSearch([])}
        placeholder="blog.searchPlaceholder"
      />
    );
  },
}));

vi.mock('../BlogCard', () => ({
  default: ({ post, featured }: { post: { title: string }; featured?: boolean }) => (
    <div data-testid={featured ? 'blog-card-featured' : 'blog-card'}>{post.title}</div>
  ),
}));

const makePosts = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Post ${i + 1}`,
    content: '',
    excerpt: '',
    author: '',
    publishedAt: '',
    slug: `post-${i + 1}`,
  }));

describe('BlogListPage', () => {
  const renderPage = () =>
    render(
      <HelmetProvider>
        <MemoryRouter>
          <BlogListPage />
        </MemoryRouter>
      </HelmetProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    mockBlogContext.posts = [];
    mockBlogContext.loading = false;
    mockBlogContext.error = null;
    mockBlogContext.totalPages = 1;
    mockBlogContext.currentPage = 1;
    capturedOnSearch = null;
  });

  it('renders page title and subtitle', () => {
    renderPage();
    expect(screen.getByText('blog.title')).toBeInTheDocument();
    expect(screen.getByText('blog.subtitle')).toBeInTheDocument();
  });

  it('calls fetchPosts on mount', () => {
    renderPage();
    expect(mockFetchPosts).toHaveBeenCalledWith(1);
  });

  it('shows coming soon state when no posts', () => {
    renderPage();
    expect(screen.getByText('blog.comingSoon')).toBeInTheDocument();
    expect(screen.getByText('blog.comingSoonDescription')).toBeInTheDocument();
  });

  it('renders blog cards when posts exist', () => {
    mockBlogContext.posts = makePosts(1) as never[];

    renderPage();
    expect(screen.getByText('Post 1')).toBeInTheDocument();
  });

  it('shows error message when error exists', () => {
    mockBlogContext.error = 'Failed to load';
    renderPage();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('does not show pagination when only 1 page', () => {
    renderPage();
    expect(screen.queryByText('blog.previousPage')).not.toBeInTheDocument();
  });

  it('shows pagination when multiple pages', () => {
    mockBlogContext.totalPages = 3;
    mockBlogContext.currentPage = 2;
    renderPage();
    expect(screen.getByText('blog.previousPage')).toBeInTheDocument();
    expect(screen.getByText('blog.nextPage')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockBlogContext.loading = true;
    renderPage();
    // When loading, page title should not be rendered (PageLoading replaces content)
    expect(screen.queryByText('blog.title')).not.toBeInTheDocument();
  });

  it('renders featured post as first post and remaining in grid', () => {
    mockBlogContext.posts = makePosts(4) as never[];
    renderPage();

    // First post should be featured
    expect(screen.getByTestId('blog-card-featured')).toBeInTheDocument();
    expect(screen.getByTestId('blog-card-featured')).toHaveTextContent('Post 1');

    // Remaining 3 posts should be regular cards
    const regularCards = screen.getAllByTestId('blog-card');
    expect(regularCards).toHaveLength(3);
  });

  it('does not show remaining posts grid when only 1 post', () => {
    mockBlogContext.posts = makePosts(1) as never[];
    renderPage();

    expect(screen.getByTestId('blog-card-featured')).toBeInTheDocument();
    expect(screen.queryAllByTestId('blog-card')).toHaveLength(0);
  });

  it('shows search bar when posts exist', () => {
    mockBlogContext.posts = makePosts(2) as never[];
    renderPage();

    expect(screen.getByTestId('blog-search')).toBeInTheDocument();
  });

  it('does not show search bar when no posts', () => {
    renderPage();
    expect(screen.queryByTestId('blog-search')).not.toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    mockBlogContext.totalPages = 3;
    mockBlogContext.currentPage = 1;
    mockBlogContext.posts = makePosts(1) as never[];
    renderPage();

    const prevButton = screen.getByText('blog.previousPage').closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    mockBlogContext.totalPages = 3;
    mockBlogContext.currentPage = 3;
    mockBlogContext.posts = makePosts(1) as never[];
    renderPage();

    const nextButton = screen.getByText('blog.nextPage').closest('button');
    expect(nextButton).toBeDisabled();
  });

  it('calls fetchPosts with next page and scrolls to top when clicking next', () => {
    mockBlogContext.totalPages = 3;
    mockBlogContext.currentPage = 1;
    mockBlogContext.posts = makePosts(1) as never[];
    renderPage();

    const nextButton = screen.getByText('blog.nextPage');
    fireEvent.click(nextButton);

    expect(mockFetchPosts).toHaveBeenCalledWith(2);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('calls fetchPosts with previous page when clicking previous', () => {
    mockBlogContext.totalPages = 3;
    mockBlogContext.currentPage = 2;
    mockBlogContext.posts = makePosts(1) as never[];
    renderPage();

    const prevButton = screen.getByText('blog.previousPage');
    fireEvent.click(prevButton);

    expect(mockFetchPosts).toHaveBeenCalledWith(1);
  });

  it('displays page indicator with current and total pages', () => {
    mockBlogContext.totalPages = 5;
    mockBlogContext.currentPage = 3;
    mockBlogContext.posts = makePosts(1) as never[];
    renderPage();

    expect(screen.getByText('blog.pageOf:{"current":3,"total":5}')).toBeInTheDocument();
  });

  it('shows error and posts together when error exists but posts loaded', () => {
    mockBlogContext.error = 'Partial load error';
    mockBlogContext.posts = makePosts(2) as never[];
    renderPage();

    expect(screen.getByText('Partial load error')).toBeInTheDocument();
    expect(screen.getByTestId('blog-card-featured')).toBeInTheDocument();
  });

  it('updates filtered posts when onSearch is called', () => {
    mockBlogContext.posts = makePosts(3) as never[];
    renderPage();

    // Initially 3 posts visible (1 featured + 2 regular)
    expect(screen.getByTestId('blog-card-featured')).toBeInTheDocument();
    expect(screen.getAllByTestId('blog-card')).toHaveLength(2);

    // Simulate search filtering to 1 result
    act(() => {
      if (capturedOnSearch) {
        capturedOnSearch([makePosts(3)[0]]);
      }
    });

    // Now only 1 post should be visible (featured only, no regular)
    expect(screen.getByTestId('blog-card-featured')).toBeInTheDocument();
    expect(screen.queryAllByTestId('blog-card')).toHaveLength(0);
  });

  it('shows coming soon when search returns empty results', () => {
    mockBlogContext.posts = makePosts(3) as never[];
    renderPage();

    // Simulate search returning 0 results
    act(() => {
      if (capturedOnSearch) {
        capturedOnSearch([]);
      }
    });

    expect(screen.getByText('blog.comingSoon')).toBeInTheDocument();
  });

  it('renders section label text', () => {
    renderPage();
    expect(screen.getByText('blog.sectionLabel')).toBeInTheDocument();
  });
});
