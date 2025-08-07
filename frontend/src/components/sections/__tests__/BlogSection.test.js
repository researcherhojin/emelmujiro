import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogSection from '../BlogSection';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
  },
}));

jest.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-right">ArrowRight</div>,
  Loader2: () => <div data-testid="loader">Loader</div>,
  BookOpen: () => <div data-testid="book-open">BookOpen</div>,
}));

jest.mock('../../blog/BlogCard', () => {
  return function BlogCard({ post }) {
    return (
      <div data-testid="blog-card">
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
    );
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('BlogSection Component', () => {
  const mockPosts = [
    { id: 1, title: 'AI Trend 1', excerpt: 'First AI trend post' },
    { id: 2, title: 'AI Trend 2', excerpt: 'Second AI trend post' },
    { id: 3, title: 'AI Trend 3', excerpt: 'Third AI trend post' },
    { id: 4, title: 'AI Trend 4', excerpt: 'Fourth AI trend post' },
  ];

  const renderWithRouter = component => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal State', () => {
    it('renders section with correct ID', () => {
      const { container } = renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      const section = container.querySelector('#blog');
      expect(section).toBeInTheDocument();
    });

    it('displays section header', () => {
      renderWithRouter(<BlogSection posts={mockPosts} isLoading={false} error={null} />);

      expect(screen.getByText('AI 트렌드')).toBeInTheDocument();
      expect(
        screen.getByText('최신 AI 기술 동향과 실제 도입 사례를 공유합니다')
      ).toBeInTheDocument();
    });

    it('displays only first 3 posts', () => {
      renderWithRouter(<BlogSection posts={mockPosts} isLoading={false} error={null} />);

      const blogCards = screen.getAllByTestId('blog-card');
      expect(blogCards).toHaveLength(3);

      expect(screen.getByText('AI Trend 1')).toBeInTheDocument();
      expect(screen.getByText('AI Trend 2')).toBeInTheDocument();
      expect(screen.getByText('AI Trend 3')).toBeInTheDocument();
      expect(screen.queryByText('AI Trend 4')).not.toBeInTheDocument();
    });

    it('shows "view all" button when more than 3 posts', () => {
      renderWithRouter(<BlogSection posts={mockPosts} isLoading={false} error={null} />);

      const viewAllButton = screen.getByRole('button', { name: '블로그 전체 글 보기' });
      expect(viewAllButton).toBeInTheDocument();
    });

    it('navigates to blog page when "view all" button is clicked', () => {
      renderWithRouter(<BlogSection posts={mockPosts} isLoading={false} error={null} />);

      const viewAllButton = screen.getByRole('button', { name: '블로그 전체 글 보기' });
      fireEvent.click(viewAllButton);

      expect(mockNavigate).toHaveBeenCalledWith('/blog');
    });

    it('does not show "view all" button when 3 or fewer posts', () => {
      const threePosts = mockPosts.slice(0, 3);
      renderWithRouter(<BlogSection posts={threePosts} isLoading={false} error={null} />);

      expect(screen.queryByText('전체 트렌드 보기')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner and message', () => {
      renderWithRouter(<BlogSection posts={[]} isLoading={true} error={null} />);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.getByText('최신 AI 트렌드를 불러오는 중...')).toBeInTheDocument();
    });

    it('does not display posts when loading', () => {
      renderWithRouter(<BlogSection posts={mockPosts} isLoading={true} error={null} />);

      expect(screen.queryByTestId('blog-card')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      const errorMessage = '네트워크 오류가 발생했습니다';
      renderWithRouter(<BlogSection posts={[]} isLoading={false} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('does not display posts when error occurs', () => {
      renderWithRouter(<BlogSection posts={mockPosts} isLoading={false} error="Error occurred" />);

      expect(screen.queryByTestId('blog-card')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty state message when no posts', () => {
      renderWithRouter(<BlogSection posts={[]} isLoading={false} error={null} />);

      expect(screen.getByText('곧 새로운 AI 트렌드로 찾아뵙겠습니다')).toBeInTheDocument();
      expect(screen.getByText('생성형 AI와 최신 기술 동향을 준비 중입니다')).toBeInTheDocument();
    });

    it('displays empty state icon', () => {
      renderWithRouter(<BlogSection posts={[]} isLoading={false} error={null} />);

      const bookIcons = screen.getAllByTestId('book-open');
      expect(bookIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles non-array posts gracefully', () => {
      renderWithRouter(<BlogSection posts={null} isLoading={false} error={null} />);

      expect(screen.getByText('곧 새로운 AI 트렌드로 찾아뵙겠습니다')).toBeInTheDocument();
    });

    it('handles undefined posts', () => {
      renderWithRouter(<BlogSection posts={undefined} isLoading={false} error={null} />);

      expect(screen.getByText('곧 새로운 AI 트렌드로 찾아뵙겠습니다')).toBeInTheDocument();
    });

    it('handles posts with missing properties', () => {
      const incompletePosts = [
        { id: 1, title: 'Only title' },
        { id: 2, excerpt: 'Only excerpt' },
      ];

      renderWithRouter(<BlogSection posts={incompletePosts} isLoading={false} error={null} />);

      const blogCards = screen.getAllByTestId('blog-card');
      expect(blogCards).toHaveLength(2);
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct section styling', () => {
      const { container } = renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-24', 'bg-white');
    });

    it('applies grid layout for posts', () => {
      renderWithRouter(<BlogSection posts={mockPosts} isLoading={false} error={null} />);

      const grid = screen.getByText('AI Trend 1').closest('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3', 'gap-8');
    });

    it('centers loading content', () => {
      renderWithRouter(<BlogSection posts={[]} isLoading={true} error={null} />);

      const loadingContainer = screen.getByTestId('loader').closest('.flex');
      expect(loadingContainer).toHaveClass('items-center', 'justify-center');
    });

    it('styles error message properly', () => {
      renderWithRouter(<BlogSection posts={[]} isLoading={false} error="Test error" />);

      const errorContainer = screen.getByText('Test error').closest('.bg-red-50');
      expect(errorContainer).toHaveClass('text-red-600', 'p-6', 'rounded-lg');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithRouter(<BlogSection posts={mockPosts} isLoading={false} error={null} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('AI 트렌드');
    });

    it('has proper aria-label for navigation button', () => {
      renderWithRouter(<BlogSection posts={mockPosts} isLoading={false} error={null} />);

      const button = screen.getByLabelText('블로그 전체 글 보기');
      expect(button).toBeInTheDocument();
    });
  });
});
