import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BlogInteractions from '../BlogInteractions';
import { BlogPost } from '../../../types';

// Mock logger
vi.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

// Mock API
const mockLikeBlogPost = vi.fn().mockResolvedValue({ data: { liked: true, likes: 1 } });
vi.mock('../../../services/api', () => ({
  api: {
    likeBlogPost: (...args: unknown[]) => mockLikeBlogPost(...args),
  },
}));

// Mock window.open
const mockOpen = vi.fn();
window.open = mockOpen;

// Mock navigator.share
const mockShare = vi.fn();
Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true,
  configurable: true,
});

// Mock navigator.clipboard
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
});

const mockPost: BlogPost = {
  id: 1,
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  content: 'Test content',
  excerpt: 'Test excerpt',
  author: 'Test Author',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  published: true,
  category: 'Technology',
  tags: ['test'],
  image_url: 'https://example.com/test.jpg',
  date: '2024-01-01',
  publishedAt: '2024-01-01',
  likes: 5,
};

describe('BlogInteractions Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockOpen.mockClear();
    mockShare.mockClear();
    mockWriteText.mockClear();
    mockLikeBlogPost.mockClear();
    vi.clearAllMocks();

    mockLikeBlogPost.mockResolvedValue({ data: { liked: true, likes: 6 } });

    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/blog/1'),
      writable: true,
      configurable: true,
    });
  });

  describe('Rendering', () => {
    it('renders all interaction buttons', () => {
      render(<BlogInteractions post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3);
      expect(screen.getByText('blog.share')).toBeInTheDocument();
    });

    it('displays initial like count from post', () => {
      render(<BlogInteractions post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0];
      expect(likeButton).toHaveTextContent('5');
    });
  });

  describe('Like Functionality', () => {
    it('calls API when like button is clicked', async () => {
      render(<BlogInteractions post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0];

      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(mockLikeBlogPost).toHaveBeenCalledWith(1);
      });
    });

    it('updates like count from API response', async () => {
      mockLikeBlogPost.mockResolvedValueOnce({ data: { liked: true, likes: 6 } });
      render(<BlogInteractions post={mockPost} />);

      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0];
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(likeButton).toHaveTextContent('6');
      });
    });

    it('toggles like state from API response', async () => {
      mockLikeBlogPost
        .mockResolvedValueOnce({ data: { liked: true, likes: 6 } })
        .mockResolvedValueOnce({ data: { liked: false, likes: 5 } });

      render(<BlogInteractions post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0];

      // Like
      fireEvent.click(likeButton);
      await waitFor(() => expect(likeButton).toHaveTextContent('6'));

      // Unlike
      fireEvent.click(likeButton);
      await waitFor(() => expect(likeButton).toHaveTextContent('5'));
    });
  });

  describe('Bookmark Functionality', () => {
    it('toggles bookmark state', () => {
      render(<BlogInteractions post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      const bookmarkButton = buttons[1];

      fireEvent.click(bookmarkButton);

      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].id).toBe(mockPost.id);
    });

    it('removes bookmark on second click', () => {
      render(<BlogInteractions post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      const bookmarkButton = buttons[1];

      fireEvent.click(bookmarkButton); // Add
      fireEvent.click(bookmarkButton); // Remove

      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      expect(bookmarks).toHaveLength(0);
    });

    it('loads existing bookmarks on mount', () => {
      localStorage.setItem('bookmarks', JSON.stringify([{ id: mockPost.id, title: 'Test' }]));

      render(<BlogInteractions post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      const bookmarkButton = buttons[1];
      // Should have fill-current class when bookmarked
      const svg = bookmarkButton.querySelector('svg');
      expect(svg?.classList.toString()).toContain('fill-current');
    });
  });

  describe('Share Functionality', () => {
    it('calls navigator.share when available', async () => {
      mockShare.mockResolvedValueOnce(undefined);
      render(<BlogInteractions post={mockPost} />);

      const shareButton = screen.getByText('blog.share');
      fireEvent.click(shareButton);

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Blog Post',
          url: expect.any(String),
        })
      );
    });

    it('shows share menu when navigator.share not available', () => {
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(<BlogInteractions post={mockPost} />);
      const shareButton = screen.getByText('blog.share');
      fireEvent.click(shareButton);

      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();

      // Restore
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
        configurable: true,
      });
    });
  });
});
