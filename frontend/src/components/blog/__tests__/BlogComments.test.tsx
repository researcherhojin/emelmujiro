import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && 'count' in opts) return `${key}(${opts.count})`;
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

// Mock API
const mockGetComments = vi.fn().mockResolvedValue({ data: [] });
const mockCreateComment = vi.fn().mockResolvedValue({ data: { id: 1 } });
const mockLikeComment = vi.fn().mockResolvedValue({ data: { liked: true, likes: 1 } });
vi.mock('../../../services/api', () => ({
  api: {
    getComments: (...args: unknown[]) => mockGetComments(...args),
    createComment: (...args: unknown[]) => mockCreateComment(...args),
    likeComment: (...args: unknown[]) => mockLikeComment(...args),
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
});
