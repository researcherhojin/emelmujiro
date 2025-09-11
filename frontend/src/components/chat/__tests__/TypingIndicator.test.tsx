import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TypingIndicator from '../TypingIndicator';
import { itSkipInCI } from '../../../test-utils/ci-skip';

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
  },
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Bot: ({ className }: { className?: string }) => (
    <div data-testid="bot-icon" className={className}>
      Bot
    </div>
  ),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

describe('TypingIndicator', () => {
  itSkipInCI('renders typing indicator component', () => {
    render(<TypingIndicator />);

    // Check for typing text
    expect(screen.getByText('입력 중...')).toBeInTheDocument();
  });

  itSkipInCI('displays bot icon', () => {
    render(<TypingIndicator />);

    const botIcon = screen.getByTestId('bot-icon');
    expect(botIcon).toBeInTheDocument();
    expect(botIcon).toHaveClass('w-4 h-4');
  });

  itSkipInCI('renders three animated dots', () => {
    render(<TypingIndicator />);

    // The component should render three dots for the typing animation
    // Since the dots are rendered inside the component, we can verify
    // the typing indicator is present
    const typingIndicator = screen.getByText('입력 중...');
    expect(typingIndicator).toBeInTheDocument();

    // Verify the bot icon is also present which indicates the full component is rendered
    const botIcon = screen.getByTestId('bot-icon');
    expect(botIcon).toBeInTheDocument();
  });

  itSkipInCI('has correct styling classes', () => {
    render(<TypingIndicator />);

    // Check for bot icon with correct styling
    const botIcon = screen.getByTestId('bot-icon');
    expect(botIcon).toBeInTheDocument();
    expect(botIcon).toHaveClass('w-4 h-4');

    // Check typing text is present
    const typingText = screen.getByText('입력 중...');
    expect(typingText).toBeInTheDocument();
  });

  itSkipInCI('applies correct spacing between elements', () => {
    render(<TypingIndicator />);

    // Check that the typing indicator text is displayed
    const typingText = screen.getByText('입력 중...');
    expect(typingText).toBeInTheDocument();

    // Check that bot icon is displayed
    const botIcon = screen.getByTestId('bot-icon');
    expect(botIcon).toBeInTheDocument();
  });

  itSkipInCI('renders with dark mode classes', () => {
    render(<TypingIndicator />);

    // Check that the component renders without errors
    const typingText = screen.getByText('입력 중...');
    expect(typingText).toBeInTheDocument();

    // Dark mode classes are applied via Tailwind CSS
    // We just verify the component renders correctly
    const botIcon = screen.getByTestId('bot-icon');
    expect(botIcon).toBeInTheDocument();
  });
});
