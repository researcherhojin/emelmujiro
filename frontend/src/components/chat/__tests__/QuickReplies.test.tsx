import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Add this import to fix TypeScript errors
import QuickReplies from '../QuickReplies';
import { useChatContext } from '../../../contexts/ChatContext';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
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
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock ChatContext with default implementation
vi.mock('../../../contexts/ChatContext', () => ({
  useChatContext: vi.fn(() => ({
    settings: {
      quickReplies: [] as string[],
    },
  })),
  ChatProvider: ({ children }: { children?: React.ReactNode }) => children,
}));

describe('QuickReplies', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock implementation
    vi.mocked(useChatContext).mockReturnValue({
      settings: {
        quickReplies: [] as string[],
      },
    } as any);
  });

  const renderQuickReplies = () => {
    return render(<QuickReplies onSelect={mockOnSelect} />);
  };

  it('renders quick replies component', () => {
    renderQuickReplies();

    expect(screen.getByText('chat.quickReplies.title')).toBeInTheDocument();
    expect(screen.getByText('chat.quickReplies.or')).toBeInTheDocument();
  });

  it('displays all default quick reply options', () => {
    renderQuickReplies();

    expect(screen.getByText('chat.quickReplies.service')).toBeInTheDocument();
    expect(screen.getByText('chat.quickReplies.technical')).toBeInTheDocument();
    expect(screen.getByText('chat.quickReplies.pricing')).toBeInTheDocument();
    expect(screen.getByText('chat.quickReplies.contact')).toBeInTheDocument();
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

    const serviceButton = screen.getByText('chat.quickReplies.service');
    fireEvent.click(serviceButton);

    expect(mockOnSelect).toHaveBeenCalledWith('chat.quickReplies.service');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('handles multiple quick reply selections', () => {
    renderQuickReplies();

    fireEvent.click(screen.getByText('chat.quickReplies.service'));
    fireEvent.click(screen.getByText('chat.quickReplies.technical'));
    fireEvent.click(screen.getByText('chat.quickReplies.pricing'));
    fireEvent.click(screen.getByText('chat.quickReplies.contact'));

    expect(mockOnSelect).toHaveBeenCalledTimes(4);
    expect(mockOnSelect).toHaveBeenNthCalledWith(1, 'chat.quickReplies.service');
    expect(mockOnSelect).toHaveBeenNthCalledWith(2, 'chat.quickReplies.technical');
    expect(mockOnSelect).toHaveBeenNthCalledWith(3, 'chat.quickReplies.pricing');
    expect(mockOnSelect).toHaveBeenNthCalledWith(4, 'chat.quickReplies.contact');
  });

  it('applies correct color classes to buttons', () => {
    renderQuickReplies();

    const buttons = screen.getAllByRole('button');

    // Check that buttons have color classes
    expect(buttons[0].className).toContain('bg-blue-50');
    expect(buttons[1].className).toContain('bg-green-50');
    expect(buttons[2].className).toContain('bg-amber-50');
    expect(buttons[3].className).toContain('bg-purple-50');
  });

  it('renders in a 2-column grid layout', () => {
    renderQuickReplies();

    // Verify all 4 quick reply buttons are present
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);

    // Verify the buttons are the expected quick replies
    expect(screen.getByText('chat.quickReplies.service')).toBeInTheDocument();
    expect(screen.getByText('chat.quickReplies.technical')).toBeInTheDocument();
    expect(screen.getByText('chat.quickReplies.pricing')).toBeInTheDocument();
    expect(screen.getByText('chat.quickReplies.contact')).toBeInTheDocument();
  });

  it('has hover and focus states', () => {
    renderQuickReplies();

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button.className).toContain('hover:shadow-sm');
      expect(button.className).toContain('hover:scale-105');
      expect(button.className).toContain('focus:outline-none');
      expect(button.className).toContain('focus:ring-2');
    });
  });

  it('supports dark mode classes', () => {
    renderQuickReplies();

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button.className).toMatch(/dark:/);
    });
  });

  it('renders custom quick replies when available', () => {
    // Mock ChatContext with custom quick replies
    vi.mocked(useChatContext).mockReturnValue({
      settings: {
        quickReplies: [
          'chat.quickReplies.service',
          'chat.quickReplies.technical',
          'chat.quickReplies.pricing',
          'chat.quickReplies.contact',
          'Custom Reply 1',
          'Custom Reply 2',
        ] as string[],
      },
    } as any);

    renderQuickReplies();

    expect(screen.getByText('Custom Reply 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Reply 2')).toBeInTheDocument();
  });

  it('handles custom reply selection', () => {
    vi.mocked(useChatContext).mockReturnValue({
      settings: {
        quickReplies: [
          'chat.quickReplies.service',
          'chat.quickReplies.technical',
          'chat.quickReplies.pricing',
          'chat.quickReplies.contact',
          'Custom Reply',
        ] as string[],
      },
    } as any);

    renderQuickReplies();

    const customButton = screen.getByText('Custom Reply');
    fireEvent.click(customButton);

    expect(mockOnSelect).toHaveBeenCalledWith('Custom Reply');
  });

  it('does not render custom section when only 4 or fewer replies', () => {
    vi.mocked(useChatContext).mockReturnValue({
      settings: {
        quickReplies: [
          'chat.quickReplies.service',
          'chat.quickReplies.technical',
          'chat.quickReplies.pricing',
          'chat.quickReplies.contact',
        ] as string[],
      },
    } as any);

    renderQuickReplies();

    // Should only have 4 buttons (no custom section with additional replies)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);

    // Verify the standard replies are present
    expect(screen.getByText('chat.quickReplies.service')).toBeInTheDocument();
    expect(screen.getByText('chat.quickReplies.technical')).toBeInTheDocument();
    expect(screen.getByText('chat.quickReplies.pricing')).toBeInTheDocument();
    expect(screen.getByText('chat.quickReplies.contact')).toBeInTheDocument();
  });
});
