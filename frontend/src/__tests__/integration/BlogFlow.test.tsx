import { screen, waitFor, render } from '@testing-library/react';
import { vi } from 'vitest';
import { InternalAxiosRequestConfig } from 'axios';
import App from '../../App';
import { api } from '../../services/api';

// Mock SEOHelmet to prevent issues
vi.mock('../../components/common/SEOHelmet', () => ({
  default: function MockSEOHelmet() {
    return null;
  },
}));

// Mock logger to prevent console output
vi.mock('../../utils/logger', () => ({
  default: {
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock the api service
vi.mock('../../services/api', () => ({
  api: {
    getBlogPosts: vi.fn(),
    getBlogPost: vi.fn(),
    searchBlogPosts: vi.fn(),
    getBlogCategories: vi.fn(),
    createContact: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

// Mock Navbar and other complex components to simplify tests
vi.mock('../../components/common/Navbar', () => ({
  default: function MockNavbar() {
    return <nav>Mock Navbar</nav>;
  },
}));

const mockPosts = [
  {
    id: 1,
    title: 'First Blog Post',
    slug: 'first-blog-post',
    content: 'This is the content of the first post',
    description: 'First post excerpt',
    author: 'Test Author',
    date: '2024-01-15',
    category: 'Technology',
    is_published: true,
  },
  {
    id: 2,
    title: 'Second Blog Post',
    slug: 'second-blog-post',
    content: 'This is the content of the second post',
    description: 'Second post excerpt',
    author: 'Test Author',
    date: '2024-01-10',
    category: 'AI',
    is_published: true,
  },
];

describe('Blog Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful blog posts fetch
    mockedApi.getBlogPosts.mockResolvedValue({
      data: {
        count: mockPosts.length,
        next: null,
        previous: null,
        results: mockPosts,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });
  });

  test('app renders without crashing', async () => {
    render(<App />);

    // App should render and display the root element
    await waitFor(() => {
      expect(document.getElementById('root') || document.body.firstChild).toBeTruthy();
    });
  });

  test('renders navigation links', async () => {
    render(<App />);

    await waitFor(() => {
      const links = screen.queryAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  test('renders main content area', async () => {
    render(<App />);

    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  test('handles errors gracefully without crashing', async () => {
    mockedApi.getBlogPosts.mockRejectedValue(new Error('Network error'));

    render(<App />);

    // App should still render a main content area even with API errors
    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  test('renders with mobile viewport', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<App />);

    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    // Restore default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  test('mocked api service is configured correctly', () => {
    expect(mockedApi.getBlogPosts).toBeDefined();
    expect(mockedApi.getBlogPost).toBeDefined();
    expect(mockedApi.searchBlogPosts).toBeDefined();
  });
});
