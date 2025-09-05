import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BlogComments from '../BlogComments';

// Mock localStorage comments
const mockComments = {
  '1': [
    {
      id: 'comment_1',
      postId: '1',
      author: 'John Doe',
      content: 'Great article!',
      date: '2025-01-15T10:00:00Z',
      likes: 2,
      likedBy: ['user_1', 'user_2'],
    },
    {
      id: 'comment_2',
      postId: '1',
      author: 'Jane Smith',
      content: 'Very informative',
      date: '2025-01-14T15:30:00Z',
      likes: 1,
      likedBy: ['user_3'],
    },
  ],
};

describe('BlogComments', () => {
  const defaultProps = {
    postId: '1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('renders comments section', () => {
    render(<BlogComments {...defaultProps} />);

    // BlogComments가 h3로 렌더링하는지 확인
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('댓글');
  });

  it('displays comments from localStorage', () => {
    // Set up localStorage with mock comments
    localStorage.setItem('blogComments', JSON.stringify(mockComments));

    render(<BlogComments {...defaultProps} />);

    // Check if comments are displayed
    expect(screen.getByText('Great article!')).toBeInTheDocument();
    expect(screen.getByText('Very informative')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows empty state when no comments', () => {
    render(<BlogComments {...defaultProps} />);

    const emptyMessage = screen.getByText(/첫 번째 댓글을 작성해보세요/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  it('handles comment submission', () => {
    render(<BlogComments {...defaultProps} />);

    // Find form inputs - 실제 placeholder 텍스트에 맞게 수정
    const nameInput = screen.getByPlaceholderText('이름');
    const contentInput = screen.getByPlaceholderText('댓글을 작성해주세요...');
    const submitButton = screen.getByText(/댓글 작성/i);

    // Fill and submit form
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(contentInput, {
      target: { value: 'Test comment content' },
    });
    fireEvent.click(submitButton);

    // Check if new comment appears
    expect(screen.getByText('Test comment content')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it.skip('validates required fields', () => {
    render(<BlogComments {...defaultProps} />);

    const submitButton = screen.getByText(/작성/i);
    const initialCommentCount = screen.queryAllByTestId('comment-item').length;

    // Try to submit empty form
    fireEvent.click(submitButton);

    // Check that no new comment was added
    const afterSubmitCount = screen.queryAllByTestId('comment-item').length;
    expect(afterSubmitCount).toBe(initialCommentCount);
  });

  it('clears form after successful submission', () => {
    render(<BlogComments {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText('이름') as HTMLInputElement;
    const contentInput = screen.getByPlaceholderText(
      '댓글을 작성해주세요...'
    ) as HTMLTextAreaElement;
    const submitButton = screen.getByText(/댓글 작성/i);

    // Fill form
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(contentInput, { target: { value: 'Test comment' } });

    // Submit
    fireEvent.click(submitButton);

    // Check if form is cleared (comment field is cleared, name might be retained)
    expect(contentInput.value).toBe('');
  });

  it('handles localStorage parsing error gracefully', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('blogComments', 'invalid json');

    // Should render without crashing
    render(<BlogComments {...defaultProps} />);

    // Should show empty state
    const emptyMessage = screen.getByText(/첫 번째 댓글을 작성해보세요/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  it('handles like button click', () => {
    localStorage.setItem('blogComments', JSON.stringify(mockComments));
    render(<BlogComments {...defaultProps} />);

    // Like 버튼은 ThumbsUp 아이콘과 숫자로 구성됨
    // 첫 번째 댓글의 likes는 2
    const likeButtons = screen.getAllByRole('button');
    // Find the button that contains the likes count
    const firstLikeButton = likeButtons.find((button) =>
      button.textContent?.includes('2')
    );

    // Click like button
    expect(firstLikeButton).toBeDefined();
    fireEvent.click(firstLikeButton!);

    // Likes count should change (increase or decrease based on user's previous action)
    // Since it's a new user, it should increase to 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('handles reply button click', () => {
    localStorage.setItem('blogComments', JSON.stringify(mockComments));
    render(<BlogComments {...defaultProps} />);

    // Find and click reply button
    const replyButtons = screen.getAllByText('답글');
    fireEvent.click(replyButtons[0]);

    // Reply form should be visible with correct placeholder
    const replyInput = screen.getByPlaceholderText('답글을 작성해주세요...');
    expect(replyInput).toBeInTheDocument();

    // Reply submit button should be visible
    expect(screen.getByText(/답글 작성/i)).toBeInTheDocument();
  });
});
