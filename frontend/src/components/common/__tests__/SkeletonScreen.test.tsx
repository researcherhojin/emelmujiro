import React from 'react';
import { render, screen } from '@testing-library/react';
import SkeletonScreen from '../SkeletonScreen';
import { renderWithProviders } from '../../../test-utils';

describe('SkeletonScreen', () => {
  it('renders default skeleton screen', () => {
    renderWithProviders(<SkeletonScreen />);
    
    // Check for the skeleton container with role="status"
    const skeleton = screen.getByRole('status', { name: /로딩 중/i });
    expect(skeleton).toBeInTheDocument();
    
    // Check for screen reader text
    expect(screen.getByText('콘텐츠를 불러오는 중입니다...')).toBeInTheDocument();
  });

  it('renders blog skeleton when variant is blog', () => {
    renderWithProviders(<SkeletonScreen variant="blog" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Check for blog-specific elements (title, meta, content, tags)
    const animatedElements = skeleton.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(5); // Blog has multiple skeleton items
  });

  it('renders profile skeleton when variant is profile', () => {
    renderWithProviders(<SkeletonScreen variant="profile" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Profile has a rounded-full element for avatar
    const avatarElement = skeleton.querySelector('.rounded-full');
    expect(avatarElement).toBeInTheDocument();
  });

  it('renders card skeleton when variant is card', () => {
    renderWithProviders(<SkeletonScreen variant="card" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Card has multiple animated elements
    const animatedElements = skeleton.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it('renders list skeleton when variant is list', () => {
    renderWithProviders(<SkeletonScreen variant="list" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // List has avatar (rounded-full) and content sections
    const avatarElement = skeleton.querySelector('.rounded-full');
    expect(avatarElement).toBeInTheDocument();
  });

  it('renders hero skeleton when variant is hero', () => {
    renderWithProviders(<SkeletonScreen variant="hero" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Hero has large heading elements and CTA buttons
    const animatedElements = skeleton.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(8); // Hero has many elements
  });

  it('renders custom count of skeletons', () => {
    renderWithProviders(<SkeletonScreen variant="card" count={5} />);
    
    const skeleton = screen.getByRole('status');
    const wrapperDivs = skeleton.querySelectorAll(':scope > div');
    // 5 skeleton items + 1 span for screen reader
    expect(wrapperDivs.length).toBe(5);
  });

  it('applies custom className', () => {
    const customClass = 'custom-skeleton-class';
    renderWithProviders(<SkeletonScreen className={customClass} />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass(customClass);
  });

  it('renders with animation by default', () => {
    renderWithProviders(<SkeletonScreen />);
    
    const skeleton = screen.getByRole('status');
    const animatedElements = skeleton.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it('renders without animation when animate is false', () => {
    renderWithProviders(<SkeletonScreen animate={false} />);
    
    const skeleton = screen.getByRole('status');
    const animatedElements = skeleton.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBe(0);
  });

  it('handles invalid variant gracefully', () => {
    // @ts-ignore - Testing invalid variant
    renderWithProviders(<SkeletonScreen variant="invalid-type" />);
    
    // Should render default (card) skeleton
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders multiple blog skeletons', () => {
    renderWithProviders(<SkeletonScreen variant="blog" count={3} />);
    
    const skeleton = screen.getByRole('status');
    const blogPosts = skeleton.querySelectorAll('.shadow-md');
    expect(blogPosts.length).toBe(3);
  });

  it('renders multiple list items', () => {
    renderWithProviders(<SkeletonScreen variant="list" count={4} />);
    
    const skeleton = screen.getByRole('status');
    const listItems = skeleton.querySelectorAll('.flex.items-center');
    expect(listItems.length).toBe(4);
  });

  it('has proper dark mode support', () => {
    renderWithProviders(<SkeletonScreen />);
    
    const skeleton = screen.getByRole('status');
    const darkElements = skeleton.querySelectorAll('[class*="dark:"]');
    expect(darkElements.length).toBeGreaterThan(0);
  });

  it('renders profile with centered content', () => {
    renderWithProviders(<SkeletonScreen variant="profile" />);
    
    const skeleton = screen.getByRole('status');
    const centeredElement = skeleton.querySelector('.text-center');
    expect(centeredElement).toBeInTheDocument();
  });

  it('renders hero with multiple sections', () => {
    renderWithProviders(<SkeletonScreen variant="hero" />);
    
    const skeleton = screen.getByRole('status');
    
    // Hero has stats/features section with 3 items
    const statsItems = skeleton.querySelectorAll('.flex.justify-center.space-x-12 > div');
    expect(statsItems.length).toBeGreaterThanOrEqual(3);
  });

  it('has accessible loading label', () => {
    renderWithProviders(<SkeletonScreen />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-label', '로딩 중...');
  });

  it('renders with proper spacing between multiple items', () => {
    renderWithProviders(<SkeletonScreen variant="card" count={2} />);
    
    const skeleton = screen.getByRole('status');
    const items = skeleton.querySelectorAll(':scope > div');
    expect(items.length).toBe(2);
    
    // Each item should be in its own wrapper div
    items.forEach(item => {
      expect(item.children.length).toBeGreaterThan(0);
    });
  });

  it('renders custom variant as default card', () => {
    renderWithProviders(<SkeletonScreen variant="custom" />);
    
    const skeleton = screen.getByRole('status');
    // Should fall back to card skeleton
    expect(skeleton).toBeInTheDocument();
    const animatedElements = skeleton.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });
});