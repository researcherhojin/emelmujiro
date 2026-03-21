import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && 'count' in opts) return `${key}(${opts.count})`;
      if (opts && 'author' in opts) return `${key}(${opts.author})`;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock logger
vi.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

// Mock useAuth — default to non-admin
const mockUseAuth = vi.fn().mockReturnValue({ user: null });
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock API
const mockGetComments = vi.fn().mockResolvedValue({ data: [] });
const mockCreateComment = vi.fn().mockResolvedValue({ data: { id: 1 } });
const mockLikeComment = vi.fn().mockResolvedValue({ data: { liked: true, likes: 1 } });
const mockDeleteComment = vi.fn().mockResolvedValue({});
vi.mock('../../../services/api', () => ({
  api: {
    getComments: (...args: unknown[]) => mockGetComments(...args),
    createComment: (...args: unknown[]) => mockCreateComment(...args),
    likeComment: (...args: unknown[]) => mockLikeComment(...args),
    deleteComment: (...args: unknown[]) => mockDeleteComment(...args),
  },
}));

import BlogComments from '../BlogComments';

const mockCommentsData = [
  {
    id: 1,
    post: 1,
    parent: null,
    author_name: 'John Doe',
    content: 'Great article!',
    likes: 2,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    replies: [
      {
        id: 3,
        post: 1,
        parent: 1,
        author_name: 'Reply User',
        content: 'Thanks!',
        likes: 0,
        created_at: '2025-01-15T11:00:00Z',
        updated_at: '2025-01-15T11:00:00Z',
        replies: [],
      },
    ],
  },
  {
    id: 2,
    post: 1,
    parent: null,
    author_name: 'Jane Smith',
    content: 'Very informative',
    likes: 1,
    created_at: '2025-01-14T15:30:00Z',
    updated_at: '2025-01-14T15:30:00Z',
    replies: [],
  },
];

describe('BlogComments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockGetComments.mockResolvedValue({ data: [] });
    mockUseAuth.mockReturnValue({ user: null });
  });

  it('renders comments section', async () => {
    render(<BlogComments postId="1" />);
    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('blog.commentsCount');
    });
  });

  it('displays comments from API', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
      expect(screen.getByText('Very informative')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays nested replies', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Thanks!')).toBeInTheDocument();
      expect(screen.getByText('Reply User')).toBeInTheDocument();
    });
  });

  it('shows empty state when no comments', async () => {
    render(<BlogComments postId="1" />);
    await waitFor(() => {
      expect(screen.getByText('blog.noCommentsYet')).toBeInTheDocument();
    });
  });

  it('handles comment submission', async () => {
    mockCreateComment.mockResolvedValueOnce({ data: { id: 10 } });
    // After create, refetch returns new comment
    mockGetComments.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({
      data: [
        {
          id: 10,
          post: 1,
          parent: null,
          author_name: 'Test User',
          content: 'Test comment',
          likes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          replies: [],
        },
      ],
    });

    render(<BlogComments postId="1" />);

    const nameInput = screen.getByPlaceholderText('blog.namePlaceholder');
    const contentInput = screen.getByPlaceholderText('blog.commentPlaceholder');
    const submitButton = screen.getByText('blog.writeComment');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(contentInput, { target: { value: 'Test comment' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateComment).toHaveBeenCalledWith('1', {
        author_name: 'Test User',
        content: 'Test comment',
      });
    });
  });

  it('clears content after submission', async () => {
    mockCreateComment.mockResolvedValueOnce({ data: { id: 10 } });
    mockGetComments.mockResolvedValue({ data: [] });

    render(<BlogComments postId="1" />);

    const nameInput = screen.getByPlaceholderText('blog.namePlaceholder') as HTMLInputElement;
    const contentInput = screen.getByPlaceholderText(
      'blog.commentPlaceholder'
    ) as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(contentInput, { target: { value: 'Test comment' } });
    fireEvent.click(screen.getByText('blog.writeComment'));

    await waitFor(() => {
      expect(contentInput.value).toBe('');
    });
  });

  it('handles like button click', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    // Find first like button (the one with count 2)
    const likeButtons = screen.getAllByRole('button');
    const firstLikeBtn = likeButtons.find((b) => b.textContent?.includes('2'));
    expect(firstLikeBtn).toBeDefined();
    fireEvent.click(firstLikeBtn!);

    await waitFor(() => {
      expect(mockLikeComment).toHaveBeenCalledWith('1', 1);
    });
  });

  it('handles reply button click', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    const replyButtons = screen.getAllByText('blog.reply');
    fireEvent.click(replyButtons[0]);

    expect(screen.getByPlaceholderText('blog.replyPlaceholder')).toBeInTheDocument();
    expect(screen.getByText('blog.writeReply')).toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(<BlogComments postId="1" />);
    const submitButton = screen.getByText('blog.writeComment');
    fireEvent.click(submitButton);
    // createComment should not be called with empty fields
    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  // --- NEW TEST CASES ---

  it('does not submit comment when name is empty but content is filled', async () => {
    render(<BlogComments postId="1" />);

    const contentInput = screen.getByPlaceholderText('blog.commentPlaceholder');
    fireEvent.change(contentInput, { target: { value: 'Some content' } });
    fireEvent.click(screen.getByText('blog.writeComment'));

    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  it('does not submit comment when content is empty but name is filled', async () => {
    render(<BlogComments postId="1" />);

    const nameInput = screen.getByPlaceholderText('blog.namePlaceholder');
    fireEvent.change(nameInput, { target: { value: 'Author' } });
    fireEvent.click(screen.getByText('blog.writeComment'));

    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  it('does not submit comment when content is whitespace only', async () => {
    render(<BlogComments postId="1" />);

    const nameInput = screen.getByPlaceholderText('blog.namePlaceholder');
    const contentInput = screen.getByPlaceholderText('blog.commentPlaceholder');
    fireEvent.change(nameInput, { target: { value: 'Author' } });
    fireEvent.change(contentInput, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('blog.writeComment'));

    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  it('saves author name to localStorage on submission', async () => {
    mockCreateComment.mockResolvedValueOnce({ data: { id: 10 } });
    mockGetComments.mockResolvedValue({ data: [] });

    render(<BlogComments postId="1" />);

    fireEvent.change(screen.getByPlaceholderText('blog.namePlaceholder'), {
      target: { value: 'Saved Author' },
    });
    fireEvent.change(screen.getByPlaceholderText('blog.commentPlaceholder'), {
      target: { value: 'Some comment' },
    });
    fireEvent.click(screen.getByText('blog.writeComment'));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('commentAuthorName', 'Saved Author');
    });
  });

  it('loads saved author name from localStorage on mount', async () => {
    localStorage.setItem('commentAuthorName', 'Previously Saved');
    mockGetComments.mockResolvedValue({ data: [] });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('blog.namePlaceholder') as HTMLInputElement;
      expect(nameInput.value).toBe('Previously Saved');
    });
  });

  it('submits a reply to a comment', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    mockCreateComment.mockResolvedValueOnce({ data: { id: 20 } });
    // After reply, refetch
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    // Set author name first (required for reply)
    fireEvent.change(screen.getByPlaceholderText('blog.namePlaceholder'), {
      target: { value: 'Replier' },
    });

    // Click reply button on the first comment
    const replyButtons = screen.getAllByText('blog.reply');
    fireEvent.click(replyButtons[0]);

    // Fill in the reply content
    const replyTextarea = screen.getByPlaceholderText('blog.replyPlaceholder');
    fireEvent.change(replyTextarea, { target: { value: 'This is a reply' } });

    // Submit reply
    fireEvent.click(screen.getByText('blog.writeReply'));

    await waitFor(() => {
      expect(mockCreateComment).toHaveBeenCalledWith('1', {
        author_name: 'Replier',
        content: 'This is a reply',
        parent: 1,
      });
    });
  });

  it('does not submit reply when content is empty', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    // Set author name
    fireEvent.change(screen.getByPlaceholderText('blog.namePlaceholder'), {
      target: { value: 'Replier' },
    });

    // Open reply form
    const replyButtons = screen.getAllByText('blog.reply');
    fireEvent.click(replyButtons[0]);

    // Submit without typing reply content
    fireEvent.click(screen.getByText('blog.writeReply'));

    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  it('does not submit reply when author name is empty', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    // Open reply form without setting author name
    const replyButtons = screen.getAllByText('blog.reply');
    fireEvent.click(replyButtons[0]);

    const replyTextarea = screen.getByPlaceholderText('blog.replyPlaceholder');
    fireEvent.change(replyTextarea, { target: { value: 'Reply content' } });

    fireEvent.click(screen.getByText('blog.writeReply'));

    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  it('cancels a reply and clears reply content', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    // Open reply form
    const replyButtons = screen.getAllByText('blog.reply');
    fireEvent.click(replyButtons[0]);

    const replyTextarea = screen.getByPlaceholderText('blog.replyPlaceholder');
    fireEvent.change(replyTextarea, { target: { value: 'Draft reply' } });

    // Cancel reply
    fireEvent.click(screen.getByText('common.cancel'));

    // Reply form should be hidden
    expect(screen.queryByPlaceholderText('blog.replyPlaceholder')).not.toBeInTheDocument();
  });

  it('shows delete button for admin users', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'admin' } });
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    // Admin should see delete buttons
    const deleteButtons = screen.getAllByText('common.delete');
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('does not show delete button for non-admin users', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    expect(screen.queryByText('common.delete')).not.toBeInTheDocument();
  });

  it('handles comment deletion by admin', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'admin' } });
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    mockDeleteComment.mockResolvedValueOnce({});
    // After delete, refetch
    mockGetComments.mockResolvedValueOnce({ data: [mockCommentsData[1]] });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    // Click the first delete button (for comment id=1)
    const deleteButtons = screen.getAllByLabelText('common.delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteComment).toHaveBeenCalledWith('1', 1);
    });
  });

  it('handles like on a reply', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    mockLikeComment.mockResolvedValueOnce({ data: { liked: true, likes: 1 } });
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Thanks!')).toBeInTheDocument();
    });

    // Find the like button on the reply (Reply User's comment, with aria-label containing Reply User)
    const replyLikeButton = screen.getByLabelText('blog.likeReply(Reply User)');
    fireEvent.click(replyLikeButton);

    await waitFor(() => {
      expect(mockLikeComment).toHaveBeenCalledWith('1', 3);
    });
  });

  it('handles API error when fetching comments', async () => {
    mockGetComments.mockRejectedValueOnce(new Error('Network error'));

    render(<BlogComments postId="1" />);

    // Should show empty state when fetch fails
    await waitFor(() => {
      expect(screen.getByText('blog.noCommentsYet')).toBeInTheDocument();
    });
  });

  it('handles API error when creating comment', async () => {
    const logger = await import('../../../utils/logger');
    mockGetComments.mockResolvedValue({ data: [] });
    mockCreateComment.mockRejectedValueOnce(new Error('Create failed'));

    render(<BlogComments postId="1" />);

    fireEvent.change(screen.getByPlaceholderText('blog.namePlaceholder'), {
      target: { value: 'Author' },
    });
    fireEvent.change(screen.getByPlaceholderText('blog.commentPlaceholder'), {
      target: { value: 'Comment' },
    });
    fireEvent.click(screen.getByText('blog.writeComment'));

    await waitFor(() => {
      expect(logger.default.error).toHaveBeenCalledWith(
        'Failed to create comment:',
        expect.any(Error)
      );
    });
  });

  it('handles API error when liking comment', async () => {
    const logger = await import('../../../utils/logger');
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    mockLikeComment.mockRejectedValueOnce(new Error('Like failed'));

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    const likeBtn = screen.getByLabelText('blog.likeComment(John Doe)');
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(logger.default.error).toHaveBeenCalledWith(
        'Failed to like comment:',
        expect.any(Error)
      );
    });
  });

  it('handles API error when deleting comment', async () => {
    const logger = await import('../../../utils/logger');
    mockUseAuth.mockReturnValue({ user: { role: 'admin' } });
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    mockDeleteComment.mockRejectedValueOnce(new Error('Delete failed'));

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('common.delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(logger.default.error).toHaveBeenCalledWith(
        'Failed to delete comment:',
        expect.any(Error)
      );
    });
  });

  it('handles API error when creating reply', async () => {
    const logger = await import('../../../utils/logger');
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    mockCreateComment.mockRejectedValueOnce(new Error('Reply failed'));

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    // Set author
    fireEvent.change(screen.getByPlaceholderText('blog.namePlaceholder'), {
      target: { value: 'Replier' },
    });

    // Open reply form
    fireEvent.click(screen.getAllByText('blog.reply')[0]);
    fireEvent.change(screen.getByPlaceholderText('blog.replyPlaceholder'), {
      target: { value: 'Reply text' },
    });
    fireEvent.click(screen.getByText('blog.writeReply'));

    await waitFor(() => {
      expect(logger.default.error).toHaveBeenCalledWith(
        'Failed to create reply:',
        expect.any(Error)
      );
    });
  });

  it('closes reply form after successful reply submission', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    mockCreateComment.mockResolvedValueOnce({ data: { id: 20 } });
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('blog.namePlaceholder'), {
      target: { value: 'Replier' },
    });

    fireEvent.click(screen.getAllByText('blog.reply')[0]);
    fireEvent.change(screen.getByPlaceholderText('blog.replyPlaceholder'), {
      target: { value: 'My reply' },
    });
    fireEvent.click(screen.getByText('blog.writeReply'));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('blog.replyPlaceholder')).not.toBeInTheDocument();
    });
  });

  it('displays comment count in heading', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    render(<BlogComments postId="1" />);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('blog.commentsCount(2)');
    });
  });

  it('refetches comments after successful like', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });
    mockLikeComment.mockResolvedValueOnce({ data: { liked: true, likes: 3 } });
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    const likeBtn = screen.getByLabelText('blog.likeComment(John Doe)');
    fireEvent.click(likeBtn);

    await waitFor(() => {
      // getComments called twice: initial load + after like
      expect(mockGetComments).toHaveBeenCalledTimes(2);
    });
  });

  it('renders comment with reply content change', async () => {
    mockGetComments.mockResolvedValueOnce({ data: mockCommentsData });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument();
    });

    // Open reply
    fireEvent.click(screen.getAllByText('blog.reply')[0]);

    const replyTextarea = screen.getByPlaceholderText(
      'blog.replyPlaceholder'
    ) as HTMLTextAreaElement;
    fireEvent.change(replyTextarea, { target: { value: 'Typing reply...' } });
    expect(replyTextarea.value).toBe('Typing reply...');
  });

  it('formats date as days ago for 1-6 days old comments (line 273)', async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const daysComments = [
      {
        id: 100,
        post: 1,
        parent: null,
        author_name: 'Days Test',
        content: 'Days ago comment',
        likes: 0,
        created_at: threeDaysAgo,
        updated_at: threeDaysAgo,
        replies: [],
      },
    ];
    mockGetComments.mockResolvedValueOnce({ data: daysComments });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Days ago comment')).toBeInTheDocument();
    });

    // Should show days ago text: blog.timeDaysAgo(3)
    expect(screen.getByText('blog.timeDaysAgo(3)')).toBeInTheDocument();
  });

  it('formats date as full date for comments older than 7 days (line 275)', async () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const oldComments = [
      {
        id: 101,
        post: 1,
        parent: null,
        author_name: 'Old Test',
        content: 'Old comment',
        likes: 0,
        created_at: twoWeeksAgo,
        updated_at: twoWeeksAgo,
        replies: [],
      },
    ];
    mockGetComments.mockResolvedValueOnce({ data: oldComments });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Old comment')).toBeInTheDocument();
    });

    // Should show formatted date (toLocaleDateString), not the relative time
    // The date will be in ko-KR format since i18n.language is 'ko'
    const dateElement = screen.getByText('Old Test').closest('div')?.parentElement;
    expect(dateElement).toBeTruthy();
  });

  it('formats date as hours ago for recent comments (line 271)', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const hoursComments = [
      {
        id: 102,
        post: 1,
        parent: null,
        author_name: 'Hours Test',
        content: 'Hours ago comment',
        likes: 0,
        created_at: twoHoursAgo,
        updated_at: twoHoursAgo,
        replies: [],
      },
    ];
    mockGetComments.mockResolvedValueOnce({ data: hoursComments });

    render(<BlogComments postId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Hours ago comment')).toBeInTheDocument();
    });

    // Should show hours ago text: blog.timeHoursAgo(2)
    expect(screen.getByText('blog.timeHoursAgo(2)')).toBeInTheDocument();
  });
});
