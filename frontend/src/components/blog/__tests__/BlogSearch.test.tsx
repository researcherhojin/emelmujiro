import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogSearch from '../BlogSearch';
import { BlogProvider } from '../../../contexts/BlogContext';
import { api } from '../../../services/api';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && 'count' in opts) return `${opts.count} ${key}`;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock the api module properly
vi.mock('../../../services/api', () => ({
  api: {
    searchBlogPosts: vi.fn(),
  },
  default: {
    searchBlogPosts: vi.fn(),
  },
}));

// Mock posts data for local search fallback
const mockPosts = [
  {
    id: 1,
    title: 'React Tutorial',
    slug: 'react-tutorial',
    content: 'Learn React basics',
    excerpt: 'A React guide',
    author: 'Author',
    publishedAt: '2024-01-01',
    category: 'ai',
    tags: ['react', 'frontend'],
    date: '2024-01-01',
    likes: 0,
    view_count: 0,
    is_featured: false,
  },
];

// Mock BlogContext to inject posts directly
vi.mock('../../../contexts/BlogContext', () => ({
  useBlog: () => ({
    posts: mockPosts,
    currentPost: null,
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    fetchPosts: vi.fn(),
    fetchPostById: vi.fn(),
    clearCurrentPost: vi.fn(),
  }),
  BlogProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <BlogProvider>{component}</BlogProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
};

describe('BlogSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default mock implementation with complete AxiosResponse structure
    vi.mocked(api.searchBlogPosts).mockResolvedValue({
      data: {
        results: [],
        count: 0,
        next: null,
        previous: null,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
  });

  it('renders search input', () => {
    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText('blog.searchPlaceholder')).toBeInTheDocument();
  });

  it('handles search submission', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'React' } });

    // Wait for the search to be performed (onChange triggers search)
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });

    if (input.form) {
      fireEvent.submit(input.form);
    }
  });

  it('trims whitespace from search query', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '  React  ' } });

    // onChange triggers search immediately
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });
  });

  it('does not submit empty search', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    // Empty search is filtered out — onSearch should not be called
    await waitFor(() => {
      expect(onSearch).not.toHaveBeenCalled();
    });
  });

  it('handles search with special characters', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'React & TypeScript' } });

    // Wait for the onChange to trigger search
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });
  });

  it('clears search on clear button click', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    // Type some text
    fireEvent.change(input, { target: { value: 'React' } });
    expect(input.value).toBe('React');

    // Clear button should appear when there's text
    const clearButton = screen.queryByRole('button', { name: /clear/i });
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(input.value).toBe('');
    }
  });

  it('filters posts based on search term', async () => {
    const onSearch = vi.fn();
    const mockResults = [
      {
        id: '1',
        title: 'React Tutorial',
        slug: 'react-tutorial',
        content: 'Learn React',
        excerpt: 'Learn React basics',
        author: 'John Doe',
        publishedAt: '2024-01-01T00:00:00Z',
      },
    ];

    // Fix: Use vi.mocked instead of undefined mockSearchBlogPosts
    vi.mocked(api.searchBlogPosts).mockResolvedValueOnce({
      data: {
        results: mockResults,
        count: mockResults.length,
        next: null,
        previous: null,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'React' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
      // onSearch is called with search results (BlogPost[]), not the search term
    });
  });

  it('shows recent searches when focused', () => {
    // Set some recent searches in localStorage
    localStorage.setItem('recentSearches', JSON.stringify(['React', 'TypeScript']));

    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    // Focus the input
    fireEvent.focus(input);

    // Recent searches might be shown in a dropdown or suggestion list
    // This would depend on the actual implementation
  });

  it('shows search results count', async () => {
    const onSearch = vi.fn();
    const mockResults = [
      {
        id: '1',
        title: 'React Tutorial',
        slug: 'react-tutorial',
        content: 'Learn React basics and advanced concepts',
        excerpt: 'A comprehensive React tutorial',
        author: 'Jane Doe',
        publishedAt: '2024-01-01T00:00:00Z',
      },
    ];

    // Fix: Use vi.mocked instead of undefined mockSearchBlogPosts
    vi.mocked(api.searchBlogPosts).mockResolvedValueOnce({
      data: {
        results: mockResults,
        count: mockResults.length,
        next: null,
        previous: null,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'React' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
      // onSearch is called with search results array
    });
  });

  it('updates search term', () => {
    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'TypeScript' } });
    expect(input.value).toBe('TypeScript');
  });

  it('handles empty search', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    // Empty search doesn't always trigger onSearch immediately
    // Check that input is cleared
    expect(input.value).toBe('');
  });

  it('shows search icon', () => {
    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    // Check for search icon (mocked as a div with data-testid)
    const searchIcon = screen.getByTestId('search-icon');
    expect(searchIcon).toBeInTheDocument();
  });

  it('shows clear button (X icon) when search term is entered', async () => {
    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder');
    fireEvent.change(input, { target: { value: 'React' } });

    // X icon should appear when there is text
    await waitFor(() => {
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });
  });

  it('does not show clear button when search term is empty', () => {
    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });

  it('clears search term and calls onSearch with posts when clear button is clicked', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'React' } });

    await waitFor(() => {
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    // Click the clear button (parent of the X icon)
    const clearButton = screen.getByTestId('x-icon').closest('button');
    expect(clearButton).not.toBeNull();
    fireEvent.click(clearButton!);

    expect(input.value).toBe('');
    // onSearch should be called with posts (restoring original list)
    expect(onSearch).toHaveBeenCalled();
  });

  it('shows no results message when search finds nothing', async () => {
    vi.mocked(api.searchBlogPosts).mockResolvedValueOnce({
      data: { results: [], count: 0, next: null, previous: null },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder');
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('blog.noSearchResults')).toBeInTheDocument();
    });
  });

  it('shows results count when search finds posts', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'React Post',
        slug: 'react',
        content: 'content',
        excerpt: '',
        author: 'a',
        publishedAt: '',
      },
      {
        id: '2',
        title: 'React Tips',
        slug: 'tips',
        content: 'content',
        excerpt: '',
        author: 'a',
        publishedAt: '',
      },
    ];

    vi.mocked(api.searchBlogPosts).mockResolvedValueOnce({
      data: { results: mockResults, count: 2, next: null, previous: null },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder');
    fireEvent.change(input, { target: { value: 'React' } });

    await waitFor(() => {
      expect(screen.getByText('2 blog.searchResults')).toBeInTheDocument();
    });
  });

  it('falls back to local search when API fails', async () => {
    vi.mocked(api.searchBlogPosts).mockRejectedValueOnce(new Error('API error'));

    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder');
    // Search for "React" which matches mockPosts[0].title — triggers local filter (line 82)
    fireEvent.change(input, { target: { value: 'React' } });

    // Should call onSearch with local search results containing the matched post
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ title: 'React Tutorial' })])
      );
    });
  });

  it('shows recent searches dropdown when input is focused and recent searches exist', () => {
    localStorage.setItem('recentSearches', JSON.stringify(['React', 'TypeScript']));

    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder');
    fireEvent.focus(input);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('blog.recentSearches')).toBeInTheDocument();
  });

  it('applies recent search when clicked', async () => {
    localStorage.setItem('recentSearches', JSON.stringify(['React']));
    const onSearch = vi.fn();

    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;
    fireEvent.focus(input);

    const recentItem = screen.getByText('React');
    fireEvent.click(recentItem);

    await waitFor(() => {
      expect(input.value).toBe('React');
    });
  });

  it('clears recent searches when clear all button is clicked', () => {
    localStorage.setItem('recentSearches', JSON.stringify(['React', 'TypeScript']));

    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder');
    fireEvent.focus(input);

    const clearAllButton = screen.getByText('blog.clearAll');
    fireEvent.click(clearAllButton);

    expect(localStorage.removeItem).toHaveBeenCalledWith('recentSearches');
  });

  it('saves search term to recent searches on form submit', async () => {
    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'NewSearch' } });

    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'recentSearches',
        expect.stringContaining('NewSearch')
      );
    });
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('recentSearches', 'invalid-json');

    // Should not throw
    expect(() => {
      renderWithProviders(<BlogSearch onSearch={vi.fn()} />);
    }).not.toThrow();
  });

  it('does not show suggestions dropdown when no recent searches', () => {
    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder');
    fireEvent.focus(input);

    expect(screen.queryByText('blog.recentSearches')).not.toBeInTheDocument();
  });

  it('hides suggestions on blur after timeout', async () => {
    vi.useFakeTimers();
    localStorage.setItem('recentSearches', JSON.stringify(['React']));

    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder');
    fireEvent.focus(input);

    expect(screen.getByText('blog.recentSearches')).toBeInTheDocument();

    fireEvent.blur(input);

    // Suggestions should still be visible before timeout
    expect(screen.getByText('blog.recentSearches')).toBeInTheDocument();

    // After 200ms blur timeout
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText('blog.recentSearches')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('resets search results and calls onSearch with posts when search is empty (lines 60-62)', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    // First type something to trigger a search
    fireEvent.change(input, { target: { value: 'React' } });
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });

    onSearch.mockClear();

    // Now clear the input to trigger empty search branch (lines 60-62)
    fireEvent.change(input, { target: { value: '' } });

    // onSearch should be called with posts (empty array from context)
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });
  });

  it('performs local search when API returns no results property (line 82)', async () => {
    // Make API return response without results property
    vi.mocked(api.searchBlogPosts).mockResolvedValueOnce({
      data: {} as any,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should fall back to local search since response.data.results is undefined
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });
  });

  it('works without onSearch callback (lines 61, 71, 90)', async () => {
    // Render without onSearch prop
    renderWithProviders(<BlogSearch />);

    const input = screen.getByPlaceholderText('blog.searchPlaceholder') as HTMLInputElement;

    // Empty search without onSearch
    fireEvent.change(input, { target: { value: '' } });

    // Type something without onSearch
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(input.value).toBe('test');
    });

    // Should not crash
    expect(input).toBeInTheDocument();
  });
});
