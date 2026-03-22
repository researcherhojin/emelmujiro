import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

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

import BlogInteractions from '../BlogInteractions';
import { BlogPost } from '../../../types';

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

// Helper to open share menu (sets navigator.share to undefined so fallback menu appears)
const openShareMenu = () => {
  Object.defineProperty(navigator, 'share', {
    value: undefined,
    writable: true,
    configurable: true,
  });
  render(<BlogInteractions post={mockPost} />);
  fireEvent.click(screen.getByText('blog.share'));
};

// Helper to restore navigator.share
const restoreShare = () => {
  Object.defineProperty(navigator, 'share', {
    value: mockShare,
    writable: true,
    configurable: true,
  });
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

    // Ensure navigator.share is available by default
    restoreShare();
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

    it('displays zero likes when post has no likes', () => {
      const postWithNoLikes = { ...mockPost, likes: 0 };
      render(<BlogInteractions post={postWithNoLikes} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('0');
    });

    it('displays zero likes when likes is undefined', () => {
      const postWithUndefined = { ...mockPost, likes: undefined } as unknown as BlogPost;
      render(<BlogInteractions post={postWithUndefined} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('0');
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

    it('handles API error on like gracefully', async () => {
      const logger = await import('../../../utils/logger');
      mockLikeBlogPost.mockRejectedValueOnce(new Error('Network error'));

      render(<BlogInteractions post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      await waitFor(() => {
        expect(logger.default.error).toHaveBeenCalledWith(
          'Failed to toggle like:',
          expect.any(Error)
        );
      });
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

    it('stores bookmark with title and excerpt', () => {
      render(<BlogInteractions post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]);

      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      expect(bookmarks[0].title).toBe('Test Blog Post');
      expect(bookmarks[0].excerpt).toBe('Test excerpt');
      expect(bookmarks[0].savedAt).toBeDefined();
    });

    it('uses title as excerpt fallback when excerpt is missing', () => {
      const postNoExcerpt = { ...mockPost, excerpt: '' };
      render(<BlogInteractions post={postNoExcerpt} />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]);

      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      expect(bookmarks[0].excerpt).toBe('Test Blog Post');
    });

    it('handles corrupted localStorage bookmarks on mount', () => {
      localStorage.setItem('bookmarks', 'not-valid-json');

      // Should render without crashing
      render(<BlogInteractions post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[1]).toBeInTheDocument();
    });

    it('handles corrupted localStorage bookmarks on toggle', () => {
      // Render first, then corrupt localStorage
      render(<BlogInteractions post={mockPost} />);

      // Corrupt localStorage after render
      localStorage.setItem('bookmarks', '{invalid');

      const buttons = screen.getAllByRole('button');
      // Clicking bookmark should not crash even with corrupted data
      fireEvent.click(buttons[1]);

      // Component should still be present
      expect(buttons[1]).toBeInTheDocument();
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

    it('passes excerpt as text to navigator.share', async () => {
      mockShare.mockResolvedValueOnce(undefined);
      render(<BlogInteractions post={mockPost} />);

      fireEvent.click(screen.getByText('blog.share'));

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Test excerpt',
        })
      );
    });

    it('shows share menu when navigator.share not available', () => {
      openShareMenu();

      expect(screen.getByText('blog.facebook')).toBeInTheDocument();
      expect(screen.getByText('blog.twitter')).toBeInTheDocument();
      expect(screen.getByText('blog.linkedin')).toBeInTheDocument();
      expect(screen.getByText('blog.kakaoTalk')).toBeInTheDocument();

      restoreShare();
    });

    it('handles navigator.share rejection gracefully', async () => {
      mockShare.mockRejectedValueOnce(new Error('User cancelled'));

      render(<BlogInteractions post={mockPost} />);
      fireEvent.click(screen.getByText('blog.share'));

      // Should not throw or show share menu
      await waitFor(() => {
        expect(screen.queryByText('blog.facebook')).not.toBeInTheDocument();
      });
    });

    it('opens KakaoTalk share URL', () => {
      openShareMenu();
      fireEvent.click(screen.getByText('blog.kakaoTalk'));

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('story.kakao.com/share'),
        '_blank',
        expect.any(String)
      );
      restoreShare();
    });

    it('opens Facebook share URL', () => {
      openShareMenu();
      fireEvent.click(screen.getByText('blog.facebook'));

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com/sharer'),
        '_blank',
        expect.any(String)
      );
      restoreShare();
    });

    it('opens Twitter share URL', () => {
      openShareMenu();
      fireEvent.click(screen.getByText('blog.twitter'));

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        expect.any(String)
      );
      restoreShare();
    });

    it('opens LinkedIn share URL', () => {
      openShareMenu();
      fireEvent.click(screen.getByText('blog.linkedin'));

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com/sharing'),
        '_blank',
        expect.any(String)
      );
      restoreShare();
    });

    it('copies link to clipboard', async () => {
      openShareMenu();
      fireEvent.click(screen.getByText('blog.copyLink'));

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(expect.any(String));
      });
      restoreShare();
    });

    it('closes share menu when clicking overlay', () => {
      openShareMenu();

      expect(screen.getByText('blog.facebook')).toBeInTheDocument();

      const overlay = screen.getByLabelText('accessibility.closeShareMenu');
      fireEvent.click(overlay);

      expect(screen.queryByText('blog.facebook')).not.toBeInTheDocument();
      restoreShare();
    });

    it('closes share menu on Escape keydown', () => {
      openShareMenu();

      expect(screen.getByText('blog.facebook')).toBeInTheDocument();

      const overlay = screen.getByLabelText('accessibility.closeShareMenu');
      fireEvent.keyDown(overlay, { key: 'Escape' });

      expect(screen.queryByText('blog.facebook')).not.toBeInTheDocument();
      restoreShare();
    });

    it('closes share menu after clicking a share option', () => {
      openShareMenu();
      fireEvent.click(screen.getByText('blog.facebook'));

      // Share menu should close after clicking an option
      expect(screen.queryByText('blog.twitter')).not.toBeInTheDocument();
      restoreShare();
    });

    it('handles clipboard API not available', async () => {
      const logger = await import('../../../utils/logger');
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      mockWriteText.mockRejectedValueOnce(new Error('Not available'));

      render(<BlogInteractions post={mockPost} />);
      fireEvent.click(screen.getByText('blog.share'));
      fireEvent.click(screen.getByText('blog.copyLink'));

      await waitFor(() => {
        expect(logger.default.warn).toHaveBeenCalledWith('Clipboard API not available');
      });
      restoreShare();
    });

    it('shows copied state when share menu reopened after copy (line 233 copiedLink branch)', async () => {
      vi.useFakeTimers();
      openShareMenu();

      // Click copy link — triggers async copyLink() then sync setShowShareMenu(false)
      fireEvent.click(screen.getByText('blog.copyLink'));

      // Wait for clipboard promise to resolve and setCopiedLink(true)
      await vi.advanceTimersByTimeAsync(0);

      // Menu is closed now, reopen it — copiedLink is still true (timeout is 2000ms)
      fireEvent.click(screen.getByText('blog.share'));

      // Should show "blog.linkCopied" instead of "blog.copyLink"
      expect(screen.getByText('blog.linkCopied')).toBeInTheDocument();

      vi.useRealTimers();
      restoreShare();
    });

    it('does not close share menu on non-Escape keydown', () => {
      openShareMenu();

      const overlay = screen.getByLabelText('accessibility.closeShareMenu');
      fireEvent.keyDown(overlay, { key: 'Enter' });

      // Share menu should still be visible
      expect(screen.getByText('blog.facebook')).toBeInTheDocument();
      restoreShare();
    });
  });
});
