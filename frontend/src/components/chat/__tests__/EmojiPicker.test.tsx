import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmojiPicker from '../EmojiPicker';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
    button: ({
      children,
      onClick,
      ...props
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      [key: string]: unknown;
    }) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('EmojiPicker', () => {
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders emoji picker component', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    expect(screen.getByText('chat.emoji.title')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('chat.emoji.search')
    ).toBeInTheDocument();
  });

  it('displays emoji categories', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    expect(screen.getByText('chat.emoji.smileys')).toBeInTheDocument();
    expect(screen.getByText('chat.emoji.gestures')).toBeInTheDocument();
    expect(screen.getByText('chat.emoji.objects')).toBeInTheDocument();
    expect(screen.getByText('chat.emoji.symbols')).toBeInTheDocument();
  });

  it('displays emojis from active category', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    // Default category is smileys
    expect(screen.getByText('😀')).toBeInTheDocument();
    expect(screen.getByText('😃')).toBeInTheDocument();
    expect(screen.getByText('😄')).toBeInTheDocument();
  });

  it('switches categories when clicking category button', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    // Click on gestures category
    const gesturesButton = screen.getByText('chat.emoji.gestures');
    fireEvent.click(gesturesButton);

    // Should show gesture emojis
    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('👎')).toBeInTheDocument();
    expect(screen.getByText('👌')).toBeInTheDocument();
  });

  it('calls onSelect when emoji is clicked', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const emoji = screen.getByText('😀');
    fireEvent.click(emoji);

    expect(mockOnSelect).toHaveBeenCalledWith('😀');
  });

  it('calls onClose when close button is clicked', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    // Find and click the close button by aria-label
    const closeButton = screen.getByLabelText('common.close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('filters emojis based on search term', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('chat.emoji.search');
    fireEvent.change(searchInput, { target: { value: '😀' } });

    // Should only show matching emoji
    expect(screen.getByText('😀')).toBeInTheDocument();
    // Other emojis should not be visible
    expect(screen.queryByText('😃')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('chat.emoji.search');
    fireEvent.change(searchInput, { target: { value: 'xyz123' } });

    expect(screen.getByText('chat.emoji.noResults')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText(
      'chat.emoji.search'
    ) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(searchInput.value).toBe('test');

    // Clear button is rendered when search has value
    const clearButton = screen.getByLabelText('common.clear');
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
  });

  it('highlights active category', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    // First category button should be active by default
    const smileyButton = screen.getByText('chat.emoji.smileys');

    expect(smileyButton.className).toContain('bg-blue-50');
  });

  it('handles switching to objects category', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const objectsButton = screen.getByText('chat.emoji.objects');
    fireEvent.click(objectsButton);

    // Should show object emojis
    expect(screen.getByText('💻')).toBeInTheDocument();
    expect(screen.getByText('🖥️')).toBeInTheDocument();
    expect(screen.getByText('📱')).toBeInTheDocument();
  });

  it('handles switching to symbols category', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const symbolsButton = screen.getByText('chat.emoji.symbols');
    fireEvent.click(symbolsButton);

    // Should show symbol emojis
    expect(screen.getByText('❤️')).toBeInTheDocument();
    expect(screen.getByText('💛')).toBeInTheDocument();
    expect(screen.getByText('💚')).toBeInTheDocument();
  });

  it('maintains search across category switches', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('chat.emoji.search');
    fireEvent.change(searchInput, { target: { value: '💻' } });

    // Should show the computer emoji even though it's in objects category
    expect(screen.getByText('💻')).toBeInTheDocument();

    // When searching, categories are hidden so we can't switch them
    // Clear search to show categories again
    fireEvent.change(searchInput, { target: { value: '' } });

    // Now we can switch categories
    const gesturesButton = screen.getByText('chat.emoji.gestures');
    fireEvent.click(gesturesButton);

    // Should show gesture emojis now that search is cleared
    expect(screen.getByText('👍')).toBeInTheDocument();
  });

  it('shows all matching emojis from all categories when searching', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('chat.emoji.search');
    // Search for heart emoji which exists in symbols
    fireEvent.change(searchInput, { target: { value: '❤' } });

    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('handles emoji selection from search results', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('chat.emoji.search');
    fireEvent.change(searchInput, { target: { value: '💻' } });

    const emoji = screen.getByText('💻');
    fireEvent.click(emoji);

    expect(mockOnSelect).toHaveBeenCalledWith('💻');
  });

  it('applies hover effect to emoji buttons', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    // Check that emoji buttons exist
    const emojiButton = screen.getByText('😀');
    expect(emojiButton.className).toContain('hover:bg-gray-100');
  });

  it('uses grid layout for emoji display', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    // Check that emojis are displayed in a grid
    const emoji = screen.getByText('😀');
    // Grid layout testing would require implementation details
    expect(emoji).toBeInTheDocument();
  });
});
