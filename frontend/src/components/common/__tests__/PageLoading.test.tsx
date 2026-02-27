import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PageLoading from '../PageLoading';
import React from 'react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      className?: string;
    }) => <div {...props}>{children}</div>,
  },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options?.returnObjects) return key;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: any) => children,
}));

describe('PageLoading', () => {
  it('renders loading message', () => {
    render(<PageLoading />);

    // Check if loading message is present
    const loadingMessage = screen.getByText('common.pageLoading');
    expect(loadingMessage).toBeInTheDocument();
  });

  it('has loading message with correct text', () => {
    render(<PageLoading />);

    // Verify the exact loading message text
    expect(screen.getByText('common.pageLoading')).toBeInTheDocument();
  });

  it('renders loading component structure', () => {
    render(<PageLoading />);

    // Check for loading message which confirms the component rendered correctly
    const loadingMessage = screen.getByText('common.pageLoading');
    expect(loadingMessage).toBeInTheDocument();

    // Verify it's rendered as a paragraph element
    expect(loadingMessage).toHaveClass('text-gray-600');
  });

  it('has accessible loading text', () => {
    render(<PageLoading />);

    // Check that loading text is accessible
    const loadingText = screen.getByText('common.pageLoading');
    expect(loadingText).toBeInTheDocument();
    expect(loadingText.tagName).toBe('P');
  });
});
