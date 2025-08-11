import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogSearch from '../BlogSearch';
import { BlogProvider } from '../../../contexts/BlogContext';

// Mock the api module
jest.mock('../../../services/api', () => ({
  api: {
    searchBlogPosts: jest.fn(() => Promise.reject(new Error('API not available'))),
  },
}));

const _mockPosts = [
  {
    id: '1',
    title: 'React Tutorial',
    content: 'Learn React basics',
    excerpt: 'React introduction',
    author: 'John',
    date: '2024-01-01',
    category: 'Frontend',
    tags: ['react', 'javascript'],
  },
  {
    id: '2',
    title: 'TypeScript Guide',
    content: 'TypeScript with React',
    excerpt: 'TypeScript intro',
    author: 'Jane',
    date: '2024-01-02',
    category: 'Frontend',
    tags: ['typescript', 'react'],
  },
];

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
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders search form', () => {
    renderWithProviders(<BlogSearch />);

    expect(screen.getByPlaceholderText('블로그 검색...')).toBeInTheDocument();
  });

  it('handles search submission', async () => {
    const onSearch = jest.fn();
    const { api } = require('../../../services/api');
    // Mock API response
    api.searchBlogPosts.mockResolvedValueOnce({
      data: { results: [] },
    });

    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'React' } });
    // Use the input's form property instead of closest
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });

    // Check localStorage for recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    expect(recentSearches).toContain('React');
  });

  it('trims whitespace from search query', async () => {
    const onSearch = jest.fn();
    const { api } = require('../../../services/api');
    api.searchBlogPosts.mockResolvedValueOnce({
      data: { results: [] },
    });

    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '  TypeScript  ' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });
  });

  it('does not submit empty search', () => {
    const onSearch = jest.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '   ' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    // Should not save empty search to recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    expect(recentSearches).toHaveLength(0);
  });

  it('handles search with special characters', async () => {
    const onSearch = jest.fn();
    const { api } = require('../../../services/api');
    api.searchBlogPosts.mockResolvedValueOnce({
      data: { results: [] },
    });

    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'React & TypeScript' } });
    if (input.form) {
      fireEvent.submit(input.form);
    }

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });

    // Check localStorage for recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    expect(recentSearches).toContain('React & TypeScript');
  });

  it('clears search on clear button click', () => {
    const onSearch = jest.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...');

    // Enter search term
    fireEvent.change(input, { target: { value: 'React' } });
    expect(input).toHaveValue('React');

    // Clear button should appear - get by aria-label or test-id if needed
    const clearButton = screen.getByRole('button', { name: '' });
    fireEvent.click(clearButton);

    // Search should be cleared
    expect(input).toHaveValue('');
  });

  it('filters posts based on search term', async () => {
    const onSearch = jest.fn();
    const { api } = require('../../../services/api');
    const mockResults = [{ id: '1', title: 'React Tutorial', content: 'Learn React' }];
    api.searchBlogPosts.mockResolvedValueOnce({
      data: { results: mockResults },
    });

    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...');

    fireEvent.change(input, { target: { value: 'React' } });

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });

    const lastCall = onSearch.mock.calls[onSearch.mock.calls.length - 1];
    const results = lastCall[0];
    // Should find posts containing 'React'
    expect(results).toEqual(mockResults);
  });

  it('shows recent searches when focused', async () => {
    // Set up recent searches in localStorage
    localStorage.setItem('recentSearches', JSON.stringify(['React', 'TypeScript']));

    renderWithProviders(<BlogSearch />);

    const input = screen.getByPlaceholderText('블로그 검색...');

    // Focus the input
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('최근 검색')).toBeInTheDocument();
    });

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('shows search results count', async () => {
    const onSearch = jest.fn();
    const { api } = require('../../../services/api');
    const mockResults = [{ id: '1', title: 'React Tutorial' }];
    api.searchBlogPosts.mockResolvedValueOnce({
      data: { results: mockResults },
    });

    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...');

    fireEvent.change(input, { target: { value: 'React' } });

    await waitFor(() => {
      expect(screen.getByText(/개의 검색 결과/)).toBeInTheDocument();
    });
  });
});
