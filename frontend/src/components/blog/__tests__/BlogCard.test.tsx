import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogCard from '../BlogCard';
import { BlogPost } from '../../../types';

const mockPost: BlogPost = {
  id: 1,
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  content: 'Test content',
  excerpt: 'This is a test excerpt',
  author: 'Test Author',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  published: true,
  category: 'Technology',
  tags: ['test', 'react'],
  image_url: 'https://example.com/test.jpg',
  date: '2024-01-01',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('BlogCard Component', () => {
  it('renders blog post card', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });
    expect(screen.getByText('This is a test excerpt')).toBeInTheDocument();
    expect(screen.getByText(/Test Author/)).toBeInTheDocument();
  });

  it('displays category', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  it('renders link to blog detail', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const blogLink = links.find(link => link.getAttribute('href')?.includes('/blog/'));
      expect(blogLink).toBeInTheDocument();
    });
  });

  it('handles missing image gracefully', async () => {
    const postWithoutImage = { ...mockPost, image_url: undefined };
    renderWithRouter(<BlogCard post={postWithoutImage} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });
  });

  it('handles missing excerpt', async () => {
    const postWithoutExcerpt = { ...mockPost, excerpt: '' };
    renderWithRouter(<BlogCard post={postWithoutExcerpt} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });
  });
});
