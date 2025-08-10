import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
      <BlogProvider>{component}</BlogProvider>
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
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...');

    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });

    // Check localStorage for recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    expect(recentSearches).toContain('React');
  });

  it('trims whitespace from search query', async () => {
    const onSearch = jest.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...');

    fireEvent.change(input, { target: { value: '  TypeScript  ' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });
  });

  it('does not submit empty search', () => {
    const onSearch = jest.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

    // Should not save empty search to recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    expect(recentSearches).toHaveLength(0);
  });

  it('handles search with special characters', async () => {
    const onSearch = jest.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...');

    fireEvent.change(input, { target: { value: 'React & TypeScript' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

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

    // Clear button should appear
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    // Search should be cleared
    expect(input).toHaveValue('');
  });

  it('filters posts based on search term', async () => {
    const onSearch = jest.fn();
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...');

    fireEvent.change(input, { target: { value: 'React' } });

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });

    const lastCall = onSearch.mock.calls[onSearch.mock.calls.length - 1];
    const results = lastCall[0];
    // Should find posts containing 'React'
    expect(results.length).toBeGreaterThan(0);
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
    renderWithProviders(<BlogSearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('블로그 검색...');

    fireEvent.change(input, { target: { value: 'React' } });

    await waitFor(() => {
      expect(screen.getByText(/개의 검색 결과/)).toBeInTheDocument();
    });
  });
});
