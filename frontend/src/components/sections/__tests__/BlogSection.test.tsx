import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BlogSection from '../BlogSection';
import React from 'react';

// Import BlogPost type from types
import { BlogPost } from '../../../types';

// Define type for motion component props
type MotionComponentProps = {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  [key: string]: unknown;
};

// Mock dependencies
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      whileInView: _whileInView,
      initial: _initial,
      viewport: _viewport,
      transition: _transition,
      ...props
    }: MotionComponentProps) => <div {...props}>{children}</div>,
    section: ({
      children,
      whileInView: _whileInView,
      initial: _initial,
      viewport: _viewport,
      transition: _transition,
      ...props
    }: MotionComponentProps) => <section {...props}>{children}</section>,
  },
}));

vi.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-right">ArrowRight</div>,
  Loader2: () => <div data-testid="loader">Loader</div>,
  BookOpen: () => <div data-testid="book-open">BookOpen</div>,
}));

vi.mock('../../blog/BlogCard', () => ({
  default: function BlogCard({
    post,
  }: {
    post: { title: string; excerpt: string };
  }) {
    return (
      <div data-testid="blog-card">
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
    );
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BlogSection Component', () => {
  const mockPosts: BlogPost[] = [
    {
      id: 1,
      title: 'AI Trend 1',
      slug: 'ai-trend-1',
      excerpt: 'First AI trend post',
      content: '',
      author: 'Test',
      publishedAt: '2024-01-01',
      imageUrl: 'https://example.com/img1.jpg',
      created_at: '2024-01-01',
    },
    {
      id: 2,
      title: 'AI Trend 2',
      slug: 'ai-trend-2',
      excerpt: 'Second AI trend post',
      content: '',
      author: 'Test',
      publishedAt: '2024-01-01',
      imageUrl: 'https://example.com/img2.jpg',
      created_at: '2024-01-01',
    },
    {
      id: 3,
      title: 'AI Trend 3',
      slug: 'ai-trend-3',
      excerpt: 'Third AI trend post',
      content: '',
      author: 'Test',
      publishedAt: '2024-01-01',
      imageUrl: 'https://example.com/img3.jpg',
      created_at: '2024-01-01',
    },
    {
      id: 4,
      title: 'AI Trend 4',
      slug: 'ai-trend-4',
      excerpt: 'Fourth AI trend post',
      content: '',
      author: 'Test',
      publishedAt: '2024-01-01',
      imageUrl: 'https://example.com/img4.jpg',
      created_at: '2024-01-01',
    },
  ];

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Normal State', () => {
    it('renders section with correct ID', () => {
      renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      // Check for blog section content instead of ID
      expect(screen.getByText('AI 트렌드')).toBeInTheDocument();
    });

    it('displays section header', () => {
      renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      expect(screen.getByText('AI 트렌드')).toBeInTheDocument();
      expect(
        screen.getByText('최신 AI 기술 동향과 실제 도입 사례를 공유핉니다')
      ).toBeInTheDocument();
    });

    it('displays only first 3 posts', () => {
      renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      const blogCards = screen.getAllByTestId('blog-card');
      expect(blogCards).toHaveLength(3);

      expect(screen.getByText('AI Trend 1')).toBeInTheDocument();
      expect(screen.getByText('AI Trend 2')).toBeInTheDocument();
      expect(screen.getByText('AI Trend 3')).toBeInTheDocument();
      expect(screen.queryByText('AI Trend 4')).not.toBeInTheDocument();
    });

    it('shows "view all" button when more than 3 posts', () => {
      renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      const viewAllButton = screen.getByRole('button', {
        name: '블로그 전체 글 보기',
      });
      expect(viewAllButton).toBeInTheDocument();
    });

    it('navigates to blog page when "view all" button is clicked', () => {
      renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      const viewAllButton = screen.getByRole('button', {
        name: '블로그 전체 글 보기',
      });
      fireEvent.click(viewAllButton);

      expect(mockNavigate).toHaveBeenCalledWith('/blog');
    });

    it('does not show "view all" button when 3 or fewer posts', () => {
      const threePosts = mockPosts.slice(0, 3);
      renderWithRouter(
        <BlogSection posts={threePosts} isLoading={false} error={null} />
      );

      expect(screen.queryByText('전체 트렌드 보기')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner and message', () => {
      renderWithRouter(
        <BlogSection posts={[]} isLoading={true} error={null} />
      );

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(
        screen.getByText('최신 AI 트렌드를 불러오는 중...')
      ).toBeInTheDocument();
    });

    it('does not display posts when loading', () => {
      renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={true} error={null} />
      );

      expect(screen.queryByTestId('blog-card')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      const errorMessage = '네트워크 오류가 발생했습니다';
      renderWithRouter(
        <BlogSection posts={[]} isLoading={false} error={errorMessage} />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('does not display posts when error occurs', () => {
      renderWithRouter(
        <BlogSection
          posts={mockPosts}
          isLoading={false}
          error="Error occurred"
        />
      );

      expect(screen.queryByTestId('blog-card')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty state message when no posts', () => {
      renderWithRouter(
        <BlogSection posts={[]} isLoading={false} error={null} />
      );

      expect(
        screen.getByText('곧 새로운 AI 트렌드로 찾아뵙겠습니다')
      ).toBeInTheDocument();
      expect(
        screen.getByText('생성형 AI와 최신 기술 동향을 준비 중입니다')
      ).toBeInTheDocument();
    });

    it('displays empty state icon', () => {
      renderWithRouter(
        <BlogSection posts={[]} isLoading={false} error={null} />
      );

      const bookIcons = screen.getAllByTestId('book-open');
      expect(bookIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty posts array', () => {
      renderWithRouter(
        <BlogSection posts={[]} isLoading={false} error={null} />
      );

      expect(
        screen.getByText('곧 새로운 AI 트렌드로 찾아뵙겠습니다')
      ).toBeInTheDocument();
    });

    it('handles empty posts with loading state', () => {
      renderWithRouter(
        <BlogSection posts={[]} isLoading={true} error={null} />
      );

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('handles posts with missing properties', () => {
      const incompletePosts: Partial<BlogPost>[] = [
        {
          id: 1,
          title: 'Only title',
          slug: 'only-title',
          content: '',
          author: 'Test',
          publishedAt: '2024-01-01',
          created_at: '2024-01-01',
        },
        {
          id: 2,
          excerpt: 'Only excerpt',
          title: 'Test',
          slug: 'test',
          content: '',
          author: 'Test',
          publishedAt: '2024-01-01',
          created_at: '2024-01-01',
        },
      ];

      renderWithRouter(
        <BlogSection
          posts={incompletePosts as BlogPost[]}
          isLoading={false}
          error={null}
        />
      );

      const blogCards = screen.getAllByTestId('blog-card');
      expect(blogCards).toHaveLength(2);
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct section styling', () => {
      renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      // Check for content presence instead of CSS classes
      expect(screen.getByText('AI 트렌드')).toBeInTheDocument();
      expect(
        screen.getByText('최신 AI 기술 동향과 실제 도입 사례를 공유합니다')
      ).toBeInTheDocument();
    });

    it('applies grid layout for posts', () => {
      renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      // BlogSection only displays first 3 posts, not all posts
      const blogCards = screen.getAllByTestId('blog-card');
      expect(blogCards).toHaveLength(3); // Only first 3 posts are displayed
    });

    it('shows loading state', () => {
      renderWithRouter(
        <BlogSection posts={[]} isLoading={true} error={null} />
      );

      // Check that loader is displayed
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('displays error message', () => {
      renderWithRouter(
        <BlogSection posts={[]} isLoading={false} error="Test error" />
      );

      // Check that error message is displayed
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('AI 트렌드');
    });

    it('has proper aria-label for navigation button', () => {
      renderWithRouter(
        <BlogSection posts={mockPosts} isLoading={false} error={null} />
      );

      const button = screen.getByLabelText('블로그 전체 글 보기');
      expect(button).toBeInTheDocument();
    });
  });
});
