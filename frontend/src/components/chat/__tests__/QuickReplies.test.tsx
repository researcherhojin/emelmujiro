import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickReplies from '../QuickReplies';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      onClick,
      className,
      ...props
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      className?: string;
      [key: string]: unknown;
    }) => (
      <button onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  MessageSquare: ({ className }: { className?: string }) => (
    <div data-testid="message-icon" className={className}>
      Message
    </div>
  ),
  Phone: ({ className }: { className?: string }) => (
    <div data-testid="phone-icon" className={className}>
      Phone
    </div>
  ),
  HelpCircle: ({ className }: { className?: string }) => (
    <div data-testid="help-icon" className={className}>
      Help
    </div>
  ),
  Settings: ({ className }: { className?: string }) => (
    <div data-testid="settings-icon" className={className}>
      Settings
    </div>
  ),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

// Mock ChatContext
jest.mock('../../../contexts/ChatContext', () => ({
  useChatContext: () => ({
    settings: {
      quickReplies: [],
    },
  }),
  ChatProvider: ({ children }: { children?: React.ReactNode }) => children,
}));

describe('QuickReplies', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderQuickReplies = () => {
    return render(<QuickReplies onSelect={mockOnSelect} />);
  };

  it('renders quick replies component', () => {
    renderQuickReplies();

    expect(screen.getByText('빠른 답변을 선택하세요')).toBeInTheDocument();
    expect(screen.getByText('또는 직접 메시지를 입력하세요')).toBeInTheDocument();
  });

  it('displays all default quick reply options', () => {
    renderQuickReplies();

    expect(screen.getByText('서비스 문의')).toBeInTheDocument();
    expect(screen.getByText('기술 지원')).toBeInTheDocument();
    expect(screen.getByText('요금 문의')).toBeInTheDocument();
    expect(screen.getByText('연락처 문의')).toBeInTheDocument();
  });

  it('renders icons for each quick reply', () => {
    renderQuickReplies();

    expect(screen.getByTestId('message-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    expect(screen.getByTestId('help-icon')).toBeInTheDocument();
    expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
  });

  it('calls onSelect when a quick reply is clicked', () => {
    renderQuickReplies();

    const serviceButton = screen.getByText('서비스 문의');
    fireEvent.click(serviceButton);

    expect(mockOnSelect).toHaveBeenCalledWith('서비스 문의');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('handles multiple quick reply selections', () => {
    renderQuickReplies();

    fireEvent.click(screen.getByText('서비스 문의'));
    fireEvent.click(screen.getByText('기술 지원'));
    fireEvent.click(screen.getByText('요금 문의'));
    fireEvent.click(screen.getByText('연락처 문의'));

    expect(mockOnSelect).toHaveBeenCalledTimes(4);
    expect(mockOnSelect).toHaveBeenNthCalledWith(1, '서비스 문의');
    expect(mockOnSelect).toHaveBeenNthCalledWith(2, '기술 지원');
    expect(mockOnSelect).toHaveBeenNthCalledWith(3, '요금 문의');
    expect(mockOnSelect).toHaveBeenNthCalledWith(4, '연락처 문의');
  });

  it('applies correct color classes to buttons', () => {
    const { container } = renderQuickReplies();

    const buttons = container.querySelectorAll('button');

    // Check that buttons have color classes
    expect(buttons[0].className).toContain('bg-blue-50');
    expect(buttons[1].className).toContain('bg-green-50');
    expect(buttons[2].className).toContain('bg-amber-50');
    expect(buttons[3].className).toContain('bg-purple-50');
  });

  it('renders in a 2-column grid layout', () => {
    const { container } = renderQuickReplies();

    const grid = container.querySelector('.grid.grid-cols-2');
    expect(grid).toBeInTheDocument();
    expect(grid?.children).toHaveLength(4);
  });

  it('has hover and focus states', () => {
    const { container } = renderQuickReplies();

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.className).toContain('hover:shadow-sm');
      expect(button.className).toContain('hover:scale-105');
      expect(button.className).toContain('focus:outline-none');
      expect(button.className).toContain('focus:ring-2');
    });
  });

  it('supports dark mode classes', () => {
    const { container } = renderQuickReplies();

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.className).toMatch(/dark:/);
    });
  });

  it('renders custom quick replies when available', () => {
    // Mock ChatContext with custom quick replies
    const mockUseChatContext = jest.spyOn(
      require('../../../contexts/ChatContext'),
      'useChatContext'
    );
    mockUseChatContext.mockReturnValue({
      settings: {
        quickReplies: [
          '서비스 문의',
          '기술 지원',
          '요금 문의',
          '연락처 문의',
          'Custom Reply 1',
          'Custom Reply 2',
        ],
      },
    });

    renderQuickReplies();

    expect(screen.getByText('Custom Reply 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Reply 2')).toBeInTheDocument();
  });

  it('handles custom reply selection', () => {
    const mockUseChatContext = jest.spyOn(
      require('../../../contexts/ChatContext'),
      'useChatContext'
    );
    mockUseChatContext.mockReturnValue({
      settings: {
        quickReplies: ['서비스 문의', '기술 지원', '요금 문의', '연락처 문의', 'Custom Reply'],
      },
    });

    renderQuickReplies();

    const customButton = screen.getByText('Custom Reply');
    fireEvent.click(customButton);

    expect(mockOnSelect).toHaveBeenCalledWith('Custom Reply');
  });

  it('does not render custom section when only 4 or fewer replies', () => {
    const mockUseChatContext = jest.spyOn(
      require('../../../contexts/ChatContext'),
      'useChatContext'
    );
    mockUseChatContext.mockReturnValue({
      settings: {
        quickReplies: ['Reply 1', 'Reply 2', 'Reply 3', 'Reply 4'],
      },
    });

    const { container } = renderQuickReplies();

    // Should not have the custom replies section
    const customSection = container.querySelector('.mt-3.space-y-1');
    expect(customSection).not.toBeInTheDocument();
  });
});
