import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmojiPicker from '../EmojiPicker';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: ({ className }: any) => (
    <div data-testid="search-icon" className={className}>
      Search
    </div>
  ),
  X: ({ className }: any) => (
    <div data-testid="x-icon" className={className}>
      X
    </div>
  ),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

describe('EmojiPicker', () => {
  const mockOnSelect = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders emoji picker component', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    expect(screen.getByText('이모지 선택')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('검색...')).toBeInTheDocument();
  });

  it('displays emoji categories', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    expect(screen.getByText('표정')).toBeInTheDocument();
    expect(screen.getByText('제스처')).toBeInTheDocument();
    expect(screen.getByText('사물')).toBeInTheDocument();
    expect(screen.getByText('기호')).toBeInTheDocument();
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
    const gesturesButton = screen.getByText('제스처');
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

    const closeButton = screen.getByTestId('x-icon').parentElement;
    fireEvent.click(closeButton!);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('filters emojis based on search term', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('검색...');
    fireEvent.change(searchInput, { target: { value: '😀' } });

    // Should only show matching emoji
    expect(screen.getByText('😀')).toBeInTheDocument();
    // Other emojis should not be visible
    expect(screen.queryByText('😃')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('검색...');
    fireEvent.change(searchInput, { target: { value: 'xyz123' } });

    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('검색...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(searchInput.value).toBe('test');

    // Find and click the clear button (X icon in search)
    const clearButtons = screen.getAllByTestId('x-icon');
    const clearButton = clearButtons[0].parentElement; // First X is for search clear
    fireEvent.click(clearButton!);

    expect(searchInput.value).toBe('');
  });

  it('highlights active category', () => {
    const { container } = render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    // First category button should be active by default
    const categoryButtons = container.querySelectorAll('button');
    const smileyButton = Array.from(categoryButtons).find(btn => btn.textContent?.includes('표정'));

    expect(smileyButton?.className).toContain('bg-blue-100');
  });

  it('handles switching to objects category', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const objectsButton = screen.getByText('사물');
    fireEvent.click(objectsButton);

    // Should show object emojis
    expect(screen.getByText('💻')).toBeInTheDocument();
    expect(screen.getByText('🖥️')).toBeInTheDocument();
    expect(screen.getByText('📱')).toBeInTheDocument();
  });

  it('handles switching to symbols category', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const symbolsButton = screen.getByText('기호');
    fireEvent.click(symbolsButton);

    // Should show symbol emojis
    expect(screen.getByText('❤️')).toBeInTheDocument();
    expect(screen.getByText('💛')).toBeInTheDocument();
    expect(screen.getByText('💚')).toBeInTheDocument();
  });

  it('maintains search across category switches', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('검색...');
    fireEvent.change(searchInput, { target: { value: '💻' } });

    // Should show the computer emoji even though it's in objects category
    expect(screen.getByText('💻')).toBeInTheDocument();

    // Switch category shouldn't affect search results when search is active
    const gesturesButton = screen.getByText('제스처');
    fireEvent.click(gesturesButton);

    // Should still show search results, not gesture emojis
    expect(screen.getByText('💻')).toBeInTheDocument();
    expect(screen.queryByText('👍')).not.toBeInTheDocument();
  });

  it('shows all matching emojis from all categories when searching', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('검색...');
    // Search for heart emoji which exists in symbols
    fireEvent.change(searchInput, { target: { value: '❤' } });

    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('handles emoji selection from search results', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('검색...');
    fireEvent.change(searchInput, { target: { value: '💻' } });

    const emoji = screen.getByText('💻');
    fireEvent.click(emoji);

    expect(mockOnSelect).toHaveBeenCalledWith('💻');
  });

  it('applies hover effect to emoji buttons', () => {
    const { container } = render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const emojiButtons = container.querySelectorAll('.hover\\:bg-gray-100');
    expect(emojiButtons.length).toBeGreaterThan(0);
  });

  it('uses grid layout for emoji display', () => {
    const { container } = render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);

    const emojiGrid = container.querySelector('.grid.grid-cols-8');
    expect(emojiGrid).toBeInTheDocument();
  });
});
