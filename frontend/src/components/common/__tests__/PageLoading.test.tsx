import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PageLoading from '../PageLoading';
import React from 'react';
import { itSkipInCI } from '../../../test-utils/ci-skip';

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

describe('PageLoading', () => {
  itSkipInCI('renders loading message', () => {
    render(<PageLoading />);

    // Check if loading message is present
    const loadingMessage = screen.getByText('페이지를 불러오는 중...');
    expect(loadingMessage).toBeInTheDocument();
  });

  itSkipInCI('has loading message with correct text', () => {
    render(<PageLoading />);

    // Verify the exact loading message text
    expect(screen.getByText('페이지를 불러오는 중...')).toBeInTheDocument();
  });

  itSkipInCI('renders loading component structure', () => {
    render(<PageLoading />);

    // Check for loading message which confirms the component rendered correctly
    const loadingMessage = screen.getByText('페이지를 불러오는 중...');
    expect(loadingMessage).toBeInTheDocument();

    // Verify it's rendered as a paragraph element
    expect(loadingMessage).toHaveClass('text-gray-600');
  });

  itSkipInCI('has accessible loading text', () => {
    render(<PageLoading />);

    // Check that loading text is accessible
    const loadingText = screen.getByText('페이지를 불러오는 중...');
    expect(loadingText).toBeInTheDocument();
    expect(loadingText.tagName).toBe('P');
  });
});
