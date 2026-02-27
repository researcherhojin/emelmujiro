import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock SkeletonLoader components
vi.mock('../SkeletonLoader', () => ({
  SkeletonHero: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-hero" className={className}>
      SkeletonHero
    </div>
  ),
  SkeletonServices: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-services" className={className}>
      SkeletonServices
    </div>
  ),
  SkeletonBlogList: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-blog-list" className={className}>
      SkeletonBlogList
    </div>
  ),
  SkeletonForm: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-form" className={className}>
      SkeletonForm
    </div>
  ),
  SkeletonCard: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-card" className={className}>
      SkeletonCard
    </div>
  ),
}));

import Loading from '../Loading';

describe('Loading', () => {
  it('renders spinner type by default with default message', () => {
    render(<Loading />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders a custom message', () => {
    render(<Loading message="Please wait..." />);

    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('applies min-h-screen class when isFullScreen is true', () => {
    render(<Loading isFullScreen />);

    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('min-h-screen');
  });

  it('does not apply min-h-screen class by default', () => {
    render(<Loading />);

    const container = screen.getByText('Loading...').parentElement;
    expect(container).not.toHaveClass('min-h-screen');
  });

  it('renders SkeletonHero when type is hero', () => {
    render(<Loading type="hero" />);

    expect(screen.getByTestId('skeleton-hero')).toBeInTheDocument();
  });

  it('renders SkeletonServices when type is services', () => {
    render(<Loading type="services" />);

    expect(screen.getByTestId('skeleton-services')).toBeInTheDocument();
  });

  it('renders SkeletonBlogList when type is blog', () => {
    render(<Loading type="blog" />);

    expect(screen.getByTestId('skeleton-blog-list')).toBeInTheDocument();
  });

  it('renders SkeletonForm when type is form', () => {
    render(<Loading type="form" />);

    expect(screen.getByTestId('skeleton-form')).toBeInTheDocument();
  });

  it('renders SkeletonCard when type is card', () => {
    render(<Loading type="card" />);

    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
  });

  it('passes className to skeleton loaders', () => {
    render(<Loading type="hero" className="extra-class" />);

    expect(screen.getByTestId('skeleton-hero')).toHaveClass('extra-class');
  });

  it('has displayName set to Loading', () => {
    expect(Loading.displayName).toBe('Loading');
  });
});
