import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BlogInteractions from '../BlogInteractions';
import { BlogPost } from '../../../types';

// Mock logger
jest.mock('../../../utils/logger', () => {
  return {
    __esModule: true,
    default: {
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    },
  };
});

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

// Mock navigator.share
const mockShare = jest.fn();
Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true,
  configurable: true,
});

// Mock navigator.clipboard
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
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
};

describe('BlogInteractions Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockOpen.mockClear();
    mockShare.mockClear();
    mockWriteText.mockClear();
    jest.clearAllMocks();

    // Mock window.location.href to include blog path
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/#/blog/1'),
      writable: true,
      configurable: true,
    });
  });

  describe('Rendering', () => {
    it('renders all interaction buttons', () => {
      render(<BlogInteractions post={mockPost} />);

      // Find buttons by their text content or structure
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3); // At least like, bookmark, and share buttons

      // Check for share button with text
      expect(screen.getByText('공유')).toBeInTheDocument();
    });

    it('displays initial like count as 0', () => {
      render(<BlogInteractions post={mockPost} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Like Functionality', () => {
    it('increments likes when like button is clicked', () => {
      render(<BlogInteractions post={mockPost} />);

      // Find the like button (first button with a number)
      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0]; // First button is the like button
      fireEvent.click(likeButton);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('toggles like state', () => {
      render(<BlogInteractions post={mockPost} />);

      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0];

      // Like
      fireEvent.click(likeButton);
      expect(screen.getByText('1')).toBeInTheDocument();

      // Unlike
      fireEvent.click(likeButton);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('persists likes in localStorage', () => {
      render(<BlogInteractions post={mockPost} />);

      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0];
      fireEvent.click(likeButton);

      const likesData = JSON.parse(localStorage.getItem('postLikes') || '{}');
      expect(likesData[mockPost.id].count).toBe(1);
      expect(likesData[mockPost.id].users).toHaveLength(1);
    });

    it('generates and stores unique user ID', () => {
      render(<BlogInteractions post={mockPost} />);

      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0];
      fireEvent.click(likeButton);

      const userId = localStorage.getItem('userId');
      expect(userId).toBeTruthy();
      expect(userId).toMatch(/^user_\d+_[a-z0-9]+$/);
    });

    it('loads existing likes on mount', () => {
      const existingLikes = {
        [mockPost.id]: { count: 5, users: ['user1', 'user2'] },
      };
      localStorage.setItem('postLikes', JSON.stringify(existingLikes));

      render(<BlogInteractions post={mockPost} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('prevents duplicate likes from same user', () => {
      const userId = 'user_123';
      localStorage.setItem('userId', userId);

      const existingLikes = {
        [mockPost.id]: { count: 1, users: [userId] },
      };
      localStorage.setItem('postLikes', JSON.stringify(existingLikes));

      render(<BlogInteractions post={mockPost} />);

      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0];

      // Should be already liked
      expect(screen.getByText('1')).toBeInTheDocument();

      // Click to unlike
      fireEvent.click(likeButton);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Bookmark Functionality', () => {
    it('toggles bookmark state', () => {
      render(<BlogInteractions post={mockPost} />);

      const buttons = screen.getAllByRole('button');
      const bookmarkButton = buttons[1]; // Second button is bookmark

      // Add bookmark
      fireEvent.click(bookmarkButton);

      let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].id).toBe(mockPost.id);

      // Remove bookmark
      fireEvent.click(bookmarkButton);

      bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      expect(bookmarks).toHaveLength(0);
    });

    it('loads existing bookmarks on mount', () => {
      const existingBookmarks = [{ id: mockPost.id, title: mockPost.title }];
      localStorage.setItem('bookmarks', JSON.stringify(existingBookmarks));

      render(<BlogInteractions post={mockPost} />);

      // Bookmark should be active (check by clicking to toggle)
      const buttons = screen.getAllByRole('button');
      const bookmarkButton = buttons[1]; // Second button is bookmark
      fireEvent.click(bookmarkButton);

      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      expect(bookmarks).toHaveLength(0); // Should remove existing bookmark
    });

    it('stores bookmark with post metadata', () => {
      render(<BlogInteractions post={mockPost} />);

      const buttons = screen.getAllByRole('button');
      const bookmarkButton = buttons[1]; // Second button is bookmark
      fireEvent.click(bookmarkButton);

      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      expect(bookmarks[0]).toEqual({
        id: mockPost.id,
        title: mockPost.title,
        excerpt: mockPost.excerpt,
        date: expect.stringMatching(/^\\d{4}-\\d{2}-\\d{2}$/),
        savedAt: expect.stringMatching(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}/),
      });
    });
  });

  describe('Share Functionality', () => {
    it('shows share menu when share button is clicked', () => {
      // Mock navigator.share as not available to trigger share menu
      const originalShare = navigator.share;
      delete (navigator as unknown as { share?: typeof navigator.share }).share;

      render(<BlogInteractions post={mockPost} />);

      const shareButton = screen.getByRole('button', { name: /공유/ });
      fireEvent.click(shareButton);

      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText(/링크 복사/)).toBeInTheDocument();

      // Restore
      Object.defineProperty(navigator, 'share', {
        value: originalShare,
        writable: true,
        configurable: true,
      });
    });

    it('shows and hides share menu', () => {
      // Mock navigator.share as not available
      const originalShare = navigator.share;
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(<BlogInteractions post={mockPost} />);

      const shareButton = screen.getByRole('button', { name: /공유/ });

      // Click to show menu
      fireEvent.click(shareButton);
      expect(screen.getByText('Facebook')).toBeInTheDocument();

      // Click again to hide menu
      fireEvent.click(shareButton);
      expect(screen.queryByText('Facebook')).not.toBeInTheDocument();

      // Restore
      Object.defineProperty(navigator, 'share', {
        value: originalShare,
        writable: true,
        configurable: true,
      });
    });

    it('shares to Facebook', () => {
      // Mock navigator.share as not available
      const originalShare = navigator.share;
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(<BlogInteractions post={mockPost} />);

      const shareButton = screen.getByRole('button', { name: /공유/ });
      fireEvent.click(shareButton);

      const facebookButton = screen.getByText('Facebook');
      fireEvent.click(facebookButton);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com/sharer'),
        '_blank',
        'width=500,height=600'
      );

      // Restore
      Object.defineProperty(navigator, 'share', {
        value: originalShare,
        writable: true,
        configurable: true,
      });
    });

    it('shares to Twitter', () => {
      // Mock navigator.share as not available
      const originalShare = navigator.share;
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(<BlogInteractions post={mockPost} />);

      const shareButton = screen.getByRole('button', { name: /공유/ });
      fireEvent.click(shareButton);

      const twitterButton = screen.getByText('Twitter');
      fireEvent.click(twitterButton);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        'width=500,height=600'
      );

      // Restore
      Object.defineProperty(navigator, 'share', {
        value: originalShare,
        writable: true,
        configurable: true,
      });
    });

    it('shares to LinkedIn', () => {
      // Mock navigator.share as not available
      const originalShare = navigator.share;
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(<BlogInteractions post={mockPost} />);

      const shareButton = screen.getByRole('button', { name: /공유/ });
      fireEvent.click(shareButton);

      const linkedinButton = screen.getByText('LinkedIn');
      fireEvent.click(linkedinButton);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com/sharing'),
        '_blank',
        'width=500,height=600'
      );

      // Restore
      Object.defineProperty(navigator, 'share', {
        value: originalShare,
        writable: true,
        configurable: true,
      });
    });

    it('copies link to clipboard', async () => {
      // Mock navigator.share as not available
      const originalShare = navigator.share;
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      mockWriteText.mockResolvedValue(undefined);

      render(<BlogInteractions post={mockPost} />);

      const shareButton = screen.getByRole('button', { name: /공유/ });
      fireEvent.click(shareButton);

      const copyButton = screen.getByText('링크 복사');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('/blog/1'));
      });

      await waitFor(() => {
        expect(screen.getByText('링크 복사됨!')).toBeInTheDocument();
      });

      // Should revert back after timeout
      await waitFor(
        () => {
          expect(screen.getByText('링크 복사')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Restore
      Object.defineProperty(navigator, 'share', {
        value: originalShare,
        writable: true,
        configurable: true,
      });
    });

    it('uses native share API on mobile when available', async () => {
      // Mock as mobile device
      const originalCanShare = navigator.canShare;
      Object.defineProperty(navigator, 'canShare', {
        value: () => true,
        writable: true,
        configurable: true,
      });
      mockShare.mockResolvedValue(undefined);

      render(<BlogInteractions post={mockPost} />);

      const shareButton = screen.getByRole('button', { name: /공유/ });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: mockPost.title,
          text: mockPost.excerpt,
          url: expect.stringContaining('/blog/1'),
        });
      });

      // Restore
      Object.defineProperty(navigator, 'canShare', {
        value: originalCanShare,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      const mockError = new Error('Storage error');
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw mockError;
      });

      render(<BlogInteractions post={mockPost} />);

      // Should render with default values
      expect(screen.getByText('0')).toBeInTheDocument();
      // Check for first button (like button)
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toBeInTheDocument();

      // Restore
      Storage.prototype.getItem = originalGetItem;
    });

    it('handles invalid JSON in localStorage', () => {
      localStorage.setItem('postLikes', 'invalid json');

      render(<BlogInteractions post={mockPost} />);

      // Should render with default values
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles clipboard API failure', async () => {
      // Mock navigator.share as not available
      const originalShare = navigator.share;
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      // Mock clipboard failure and provide fallback
      mockWriteText.mockRejectedValue(new Error('Clipboard error'));
      const mockExecCommand = jest.fn(() => true);
      document.execCommand = mockExecCommand;

      render(<BlogInteractions post={mockPost} />);

      const shareButton = screen.getByRole('button', { name: /공유/ });
      fireEvent.click(shareButton);

      const copyButton = screen.getByText(/링크 복사/);
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
      });

      // Restore
      Object.defineProperty(navigator, 'share', {
        value: originalShare,
        writable: true,
        configurable: true,
      });
    });
  });
});
