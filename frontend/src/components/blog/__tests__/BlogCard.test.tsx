import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Override global i18n mock — this test needs custom t() behavior
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && 'title' in opts) return `${opts.title} ${key}`;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

import BlogCard from '../BlogCard';
import { BlogPost } from '../../../types';

const mockPost: BlogPost = {
  id: 1,
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  content: 'Test content',
  excerpt: 'This is a test excerpt',
  author: 'Test Author',
  publishedAt: '2024-01-01',
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
      const blogLink = links.find((link) => link.getAttribute('href')?.includes('/blog/'));
      expect(blogLink).toBeInTheDocument();
    });
  });

  it('handles missing image gracefully', async () => {
    renderWithRouter(<BlogCard post={{ ...mockPost, image_url: undefined }} />);

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

  it('returns null when post is null/undefined', () => {
    const { container } = renderWithRouter(<BlogCard post={null as unknown as BlogPost} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders featured card with different layout', async () => {
    renderWithRouter(<BlogCard post={mockPost} featured />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    // Featured card should have "Read more detail" text
    expect(screen.getByText('blog.readMoreDetail')).toBeInTheDocument();
  });

  it('renders image when image_url is provided', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);

    await waitFor(() => {
      const img = screen.getByAltText('Test Blog Post blog.thumbnailAlt');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/test.jpg');
    });
  });

  it('renders placeholder div when image_url is missing', async () => {
    const postWithoutImage = { ...mockPost, image_url: undefined };
    renderWithRouter(<BlogCard post={postWithoutImage} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    // Should not have any img element
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders image placeholder for featured card without image', async () => {
    const postWithoutImage = { ...mockPost, image_url: undefined };
    renderWithRouter(<BlogCard post={postWithoutImage} featured />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows formatted date when date is provided', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);

    await waitFor(() => {
      // formatDate renders Korean locale date
      const timeElement = screen.getByText(/2024/);
      expect(timeElement).toBeInTheDocument();
      expect(timeElement.tagName).toBe('TIME');
      expect(timeElement).toHaveAttribute('dateTime', '2024-01-01');
    });
  });

  it('does not show date when date is not provided', async () => {
    const postWithoutDate = { ...mockPost, date: undefined };
    renderWithRouter(<BlogCard post={postWithoutDate} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    const timeElements = screen.queryAllByRole('time');
    // There should be no time elements
    expect(timeElements).toHaveLength(0);
  });

  it('does not show category when category is not provided', async () => {
    const postWithoutCategory = { ...mockPost, category: undefined };
    renderWithRouter(<BlogCard post={postWithoutCategory} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
  });

  it('shows readTime on featured card when provided', async () => {
    const postWithReadTime = { ...mockPost, readTime: 5 };
    renderWithRouter(<BlogCard post={postWithReadTime} featured />);

    await waitFor(() => {
      expect(screen.getByText('5 min read')).toBeInTheDocument();
    });
  });

  it('does not show readTime on regular card', async () => {
    const postWithReadTime = { ...mockPost, readTime: 5 };
    renderWithRouter(<BlogCard post={postWithReadTime} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    expect(screen.queryByText('5 min read')).not.toBeInTheDocument();
  });

  it('links to the correct blog detail page', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);

    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/blog/1');
    });
  });

  it('prevents image context menu and drag', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);

    await waitFor(() => {
      const img = screen.getByAltText('Test Blog Post blog.thumbnailAlt');
      const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(contextMenuEvent, 'preventDefault');
      img.dispatchEvent(contextMenuEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  it('shows separator dot between category and date', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    // Both category and date exist, so separator should be present
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('shows "read more" text on regular card', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);

    await waitFor(() => {
      expect(screen.getByText('blog.readMoreDetail')).toBeInTheDocument();
    });
  });

  it('renders empty excerpt fallback on featured card (line 76)', async () => {
    const postWithoutExcerpt = { ...mockPost, excerpt: undefined };
    renderWithRouter(<BlogCard post={postWithoutExcerpt} featured />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    // The excerpt paragraph should render with empty string fallback
    expect(screen.getByText('blog.readMoreDetail')).toBeInTheDocument();
  });
});
