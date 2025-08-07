import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogDetail from '../BlogDetail';
import { BlogProvider } from '../../../contexts/BlogContext';
import { BlogPost } from '../../../types';

const mockNavigate = jest.fn();
const mockFetchPostById = jest.fn();
const mockClearCurrentPost = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}));

jest.mock('../../../contexts/BlogContext', () => ({
  ...jest.requireActual('../../../contexts/BlogContext'),
  useBlog: () => ({
    currentPost: mockPost,
    loading: mockLoading,
    error: mockError,
    fetchPostById: mockFetchPostById,
    clearCurrentPost: mockClearCurrentPost,
    posts: [],
    fetchPosts: jest.fn(),
    totalPages: 1,
    currentPage: 1,
  }),
  BlogProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

let mockPost: BlogPost | null = null;
let mockLoading = false;
let mockError: string | null = null;

const testPost: BlogPost = {
  id: 1,
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  content: '# Test Content\n\nThis is **bold** text.',
  excerpt: 'Test excerpt',
  author: 'Test Author',
  created_at: '2024-01-01T12:00:00Z',
  updated_at: '2024-01-02T12:00:00Z',
  published: true,
  category: 'Technology',
  tags: ['test', 'react'],
  image_url: 'https://example.com/image.jpg',
  date: '2024-01-01',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <BlogProvider>{component}</BlogProvider>
    </BrowserRouter>
  );
};

describe('BlogDetail Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockFetchPostById.mockClear();
    mockClearCurrentPost.mockClear();
    // Reset mock values before each test
    mockPost = null;
    mockLoading = false;
    mockError = null;
  });

  it('renders loading state', () => {
    mockLoading = true;
    renderWithRouter(<BlogDetail />);
    expect(screen.getByText('블로그 포스트를 불러오는 중입니다...')).toBeInTheDocument();
  });

  it('renders error state for 404', () => {
    mockError = 'Error 404: Post not found';
    renderWithRouter(<BlogDetail />);
    expect(mockNavigate).toHaveBeenCalledWith('/404', { replace: true });
  });

  it('renders error state for other errors', () => {
    mockError = 'Network error';
    renderWithRouter(<BlogDetail />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('뒤로 가기')).toBeInTheDocument();
  });

  it('renders blog post details', () => {
    mockPost = testPost;
    renderWithRouter(<BlogDetail />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByText(/작성자: Test Author/)).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
  });

  it('handles back button click', () => {
    mockPost = testPost;
    renderWithRouter(<BlogDetail />);

    const backButton = screen.getByText('뒤로가기');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('calls fetchPostById on mount', () => {
    renderWithRouter(<BlogDetail />);
    expect(mockFetchPostById).toHaveBeenCalledWith('1');
  });

  it('calls clearCurrentPost on unmount', () => {
    const { unmount } = renderWithRouter(<BlogDetail />);
    unmount();
    expect(mockClearCurrentPost).toHaveBeenCalled();
  });
});
