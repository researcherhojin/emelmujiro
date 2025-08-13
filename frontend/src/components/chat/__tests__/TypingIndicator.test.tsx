import React from 'react';
import { render, screen } from '@testing-library/react';
import TypingIndicator from '../TypingIndicator';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Bot: ({ className }: { className?: string }) => (
    <div data-testid="bot-icon" className={className}>
      Bot
    </div>
  ),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

describe('TypingIndicator', () => {
  it('renders typing indicator component', () => {
    render(<TypingIndicator />);

    // Check for typing text
    expect(screen.getByText('입력 중...')).toBeInTheDocument();
  });

  it('displays bot icon', () => {
    render(<TypingIndicator />);

    const botIcon = screen.getByTestId('bot-icon');
    expect(botIcon).toBeInTheDocument();
    expect(botIcon).toHaveClass('w-4 h-4');
  });

  it('renders three animated dots', () => {
    const { container } = render(<TypingIndicator />);

    // Find the dots container
    const dotsContainer = container.querySelector('.flex.space-x-1');
    expect(dotsContainer).toBeInTheDocument();

    // Check for three dots
    const dots = dotsContainer?.querySelectorAll('.w-2.h-2.bg-gray-500');
    expect(dots).toHaveLength(3);
  });

  it('has correct styling classes', () => {
    const { container } = render(<TypingIndicator />);

    // Check avatar styling
    const avatar = container.querySelector('.w-8.h-8.rounded-full.bg-blue-500');
    expect(avatar).toBeInTheDocument();

    // Check message bubble styling
    const bubble = container.querySelector('.bg-gray-200.dark\\:bg-gray-700.rounded-2xl');
    expect(bubble).toBeInTheDocument();
  });

  it('applies correct spacing between elements', () => {
    const { container } = render(<TypingIndicator />);

    // Check for space between avatar and bubble
    const wrapper = container.querySelector('.flex.items-center.space-x-3');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders with dark mode classes', () => {
    const { container } = render(<TypingIndicator />);

    // Check for dark mode classes
    const darkElements = container.querySelectorAll('[class*="dark:"]');
    expect(darkElements.length).toBeGreaterThan(0);
  });
});
