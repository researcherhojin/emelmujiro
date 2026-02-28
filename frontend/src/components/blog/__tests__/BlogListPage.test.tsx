import React from 'react';
import { render, screen } from '@testing-library/react';
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
  posts: [],
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

vi.mock('../BlogSearch', () => ({
  default: ({ onSearch }: { onSearch: (results: never[]) => void }) => (
    <input
      data-testid="blog-search"
      onChange={() => onSearch([])}
      placeholder="blog.searchPlaceholder"
    />
  ),
}));

vi.mock('../BlogCard', () => ({
  default: ({ post }: { post: { title: string } }) => (
    <div data-testid="blog-card">{post.title}</div>
  ),
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
  });

  it('renders page title and subtitle', () => {
    renderPage();
    expect(screen.getByText('blog.title')).toBeInTheDocument();
    expect(screen.getByText('blog.subtitle')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderPage();
    expect(screen.getByTestId('blog-search')).toBeInTheDocument();
  });

  it('calls fetchPosts on mount', () => {
    renderPage();
    expect(mockFetchPosts).toHaveBeenCalledWith(1);
  });

  it('shows empty state when no posts', () => {
    renderPage();
    expect(screen.getByText('blog.noPosts')).toBeInTheDocument();
    expect(screen.getByText('blog.noPostsDescription')).toBeInTheDocument();
  });

  it('renders blog cards when posts exist', () => {
    mockBlogContext.posts = [
      {
        id: 1,
        title: 'Test Post',
        content: '',
        excerpt: '',
        author: '',
        publishedAt: '',
        slug: '',
      },
    ] as never[];

    renderPage();
    expect(screen.getByTestId('blog-card')).toBeInTheDocument();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
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
});
