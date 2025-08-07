import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogDetail from '../BlogDetail';
import { BlogPost } from '../../../types';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockPost: BlogPost = {
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
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('BlogDetail Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders loading state', () => {
    renderWithRouter(<BlogDetail post={null} loading={true} />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('renders not found state', () => {
    renderWithRouter(<BlogDetail post={null} loading={false} />);
    expect(screen.getByText('포스트를 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('renders blog post details', () => {
    renderWithRouter(<BlogDetail post={mockPost} loading={false} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('handles back button click', () => {
    renderWithRouter(<BlogDetail post={mockPost} loading={false} />);

    const backButton = screen.getByText('← 목록으로');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders markdown content', () => {
    renderWithRouter(<BlogDetail post={mockPost} loading={false} />);

    // Markdown should be rendered
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
