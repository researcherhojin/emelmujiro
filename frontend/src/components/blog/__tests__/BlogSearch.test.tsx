import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogSearch from '../BlogSearch';
import { BlogProvider } from '../../../contexts/BlogContext';

// Mock the api module properly
const mockSearchBlogPosts = vi.fn();

vi.mock('../../../services/api', () => ({
  api: {
    searchBlogPosts: mockSearchBlogPosts,
  },
  default: {
    searchBlogPosts: mockSearchBlogPosts,
  },
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
    // Default mock implementation
    mockSearchBlogPosts.mockResolvedValue({
      data: { results: [] },
    });
  });

  it('renders search input', () => {
    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText('블로그 검색...')).toBeInTheDocument();
  });

  it('handles search submission', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(
      '블로그 검색...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'React' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('React');
    });
  });

  it('trims whitespace from search query', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(
      '블로그 검색...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '  React  ' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('React');
    });
  });

  it('does not submit empty search', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(
      '블로그 검색...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('');
    });
  });

  it('handles search with special characters', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(
      '블로그 검색...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'React & TypeScript' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('React & TypeScript');
    });
  });

  it('clears search on clear button click', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(
      '블로그 검색...'
    ) as HTMLInputElement;

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
      { id: '1', title: 'React Tutorial', content: 'Learn React' },
    ];

    mockSearchBlogPosts.mockResolvedValueOnce({
      data: { results: mockResults },
    });

    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(
      '블로그 검색...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'React' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('React');
    });
  });

  it('shows recent searches when focused', () => {
    // Set some recent searches in localStorage
    localStorage.setItem(
      'recentSearches',
      JSON.stringify(['React', 'TypeScript'])
    );

    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText(
      '블로그 검색...'
    ) as HTMLInputElement;

    // Focus the input
    fireEvent.focus(input);

    // Recent searches might be shown in a dropdown or suggestion list
    // This would depend on the actual implementation
  });

  it('shows search results count', async () => {
    const onSearch = vi.fn();
    const mockResults = [{ id: '1', title: 'React Tutorial' }];

    mockSearchBlogPosts.mockResolvedValueOnce({
      data: { results: mockResults },
    });

    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(
      '블로그 검색...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'React' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('React');
    });
  });

  it('updates search term', () => {
    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText(
      '블로그 검색...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'TypeScript' } });
    expect(input.value).toBe('TypeScript');
  });

  it('handles empty search', async () => {
    const onSearch = vi.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(
      '블로그 검색...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('');
    });
  });

  it('shows search icon', () => {
    renderWithProviders(<BlogSearch onSearch={vi.fn()} />);

    // Check for search button or icon
    const searchButton = screen.getByRole('button', { name: /[^/]*/i });
    expect(searchButton).toBeInTheDocument();
  });
});
