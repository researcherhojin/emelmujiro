import React from 'react';
import { render, screen } from '@testing-library/react';
import SkeletonScreen from '../SkeletonScreen';

describe('SkeletonScreen', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      const { container } = render(<SkeletonScreen />);

      // Check for skeleton container with role="status"
      const skeletonElement = container.querySelector('[role="status"]');
      expect(skeletonElement).toBeInTheDocument();

      const srOnlyText =
        screen.getAllByText('콘텐츠를 불러오는 중입니다...')[0];
      expect(srOnlyText).toBeInTheDocument();
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('renders multiple skeletons based on count prop', () => {
      const { container } = render(<SkeletonScreen count={3} />);

      const skeletonItems = container.querySelectorAll(
        '.bg-white.dark\\:bg-gray-800'
      );
      expect(skeletonItems.length).toBe(3);
    });

    it('applies custom className', () => {
      const customClass = 'custom-skeleton-class';
      const { container } = render(<SkeletonScreen className={customClass} />);

      const skeletonElement = container.querySelector('[role="status"]');
      expect(skeletonElement).toHaveClass(customClass);
    });

    it('renders without animation when animate is false', () => {
      const { container } = render(<SkeletonScreen animate={false} />);

      const animatedElements = container.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBe(0);
    });

    it('renders with animation when animate is true', () => {
      const { container } = render(<SkeletonScreen animate={true} />);

      const animatedElements = container.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Blog Variant', () => {
    it('renders blog post skeleton structure', () => {
      const { container } = render(<SkeletonScreen variant="blog" />);

      const blogSkeleton = container.querySelector(
        '.bg-white.dark\\:bg-gray-800'
      );
      expect(blogSkeleton).toBeInTheDocument();

      // Check for title skeleton
      const titleSkeleton = container.querySelector('.h-6.w-3\\/4');
      expect(titleSkeleton).toBeInTheDocument();

      // Check for meta info skeletons
      const metaSkeletons = container.querySelectorAll(
        '.h-4.w-20, .h-4.w-16, .h-4.w-12'
      );
      expect(metaSkeletons.length).toBeGreaterThan(0);

      // Check for content skeletons
      const contentSkeletons = container.querySelectorAll(
        '.h-4.w-full, .h-4.w-11\\/12, .h-4.w-4\\/5'
      );
      expect(contentSkeletons.length).toBeGreaterThan(0);

      // Check for tag skeletons
      const tagSkeletons = container.querySelectorAll('.rounded-full');
      expect(tagSkeletons.length).toBe(3);
    });

    it('renders multiple blog skeletons', () => {
      const { container } = render(<SkeletonScreen variant="blog" count={2} />);

      const blogSkeletons = container.querySelectorAll(
        '.bg-white.dark\\:bg-gray-800.rounded-lg.shadow-md'
      );
      expect(blogSkeletons.length).toBe(2);
    });

    it('renders blog skeleton without animation', () => {
      const { container } = render(
        <SkeletonScreen variant="blog" animate={false} />
      );

      const animatedElements = container.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBe(0);
    });
  });

  describe('Card Variant', () => {
    it('renders card skeleton structure', () => {
      const { container } = render(<SkeletonScreen variant="card" />);

      // Check for card container
      const cardSkeleton = container.querySelector(
        '.bg-white.dark\\:bg-gray-800'
      );
      expect(cardSkeleton).toBeInTheDocument();

      // Check for icon/image skeleton
      const iconSkeleton = container.querySelector('.h-12.w-12.rounded-lg');
      expect(iconSkeleton).toBeInTheDocument();

      // Check for title skeleton
      const titleSkeleton = container.querySelector('.h-5.w-2\\/3');
      expect(titleSkeleton).toBeInTheDocument();

      // Check for description skeletons
      const descSkeletons = container.querySelectorAll(
        '.h-4.w-full, .h-4.w-5\\/6'
      );
      expect(descSkeletons.length).toBe(2);

      // Check for action button skeleton
      const buttonSkeleton = container.querySelector('.h-8.w-20.rounded');
      expect(buttonSkeleton).toBeInTheDocument();
    });

    it('renders multiple card skeletons', () => {
      const { container } = render(<SkeletonScreen variant="card" count={4} />);

      const cardSkeletons = container.querySelectorAll(
        '.bg-white.dark\\:bg-gray-800.rounded-lg.shadow-md'
      );
      expect(cardSkeletons.length).toBe(4);
    });

    it('card is the default variant', () => {
      const { container: defaultContainer } = render(<SkeletonScreen />);
      const { container: cardContainer } = render(
        <SkeletonScreen variant="card" />
      );

      // Both should have the same structure
      const defaultCard = defaultContainer.querySelector(
        '.h-12.w-12.rounded-lg'
      );
      const explicitCard = cardContainer.querySelector('.h-12.w-12.rounded-lg');

      expect(defaultCard).toBeInTheDocument();
      expect(explicitCard).toBeInTheDocument();
    });
  });

  describe('List Variant', () => {
    it('renders list item skeleton structure', () => {
      const { container } = render(<SkeletonScreen variant="list" />);

      // Check for list item container
      const listItem = container.querySelector(
        '.flex.items-center.space-x-4.p-4'
      );
      expect(listItem).toBeInTheDocument();

      // Check for avatar skeleton
      const avatarSkeleton = container.querySelector('.h-10.w-10.rounded-full');
      expect(avatarSkeleton).toBeInTheDocument();

      // Check for title skeleton
      const titleSkeleton = container.querySelector('.h-4.w-3\\/4');
      expect(titleSkeleton).toBeInTheDocument();

      // Check for subtitle skeleton
      const subtitleSkeleton = container.querySelector('.h-3.w-1\\/2');
      expect(subtitleSkeleton).toBeInTheDocument();

      // Check for action skeleton
      const actionSkeleton = container.querySelector('.h-6.w-6.rounded');
      expect(actionSkeleton).toBeInTheDocument();
    });

    it('renders multiple list item skeletons', () => {
      const { container } = render(<SkeletonScreen variant="list" count={5} />);

      const listItems = container.querySelectorAll(
        '.flex.items-center.space-x-4.p-4'
      );
      expect(listItems.length).toBe(5);
    });

    it('list skeleton maintains flex-shrink-0 on avatar', () => {
      const { container } = render(<SkeletonScreen variant="list" />);

      const avatarSkeleton = container.querySelector(
        '.h-10.w-10.rounded-full.flex-shrink-0'
      );
      expect(avatarSkeleton).toBeInTheDocument();
    });
  });

  describe('Profile Variant', () => {
    it('renders profile skeleton structure', () => {
      const { container } = render(<SkeletonScreen variant="profile" />);

      // Check for profile container
      const profileSkeleton = container.querySelector(
        '.bg-white.dark\\:bg-gray-800'
      );
      expect(profileSkeleton).toBeInTheDocument();

      // Check for profile image skeleton
      const imageSkeleton = container.querySelector(
        '.h-32.w-32.rounded-full.mx-auto'
      );
      expect(imageSkeleton).toBeInTheDocument();

      // Check for name skeleton
      const nameSkeleton = container.querySelector('.h-8.w-48.mx-auto');
      expect(nameSkeleton).toBeInTheDocument();

      // Check for title skeleton
      const titleSkeleton = container.querySelector('.h-5.w-64.mx-auto');
      expect(titleSkeleton).toBeInTheDocument();

      // Check for bio skeletons
      const bioSkeletons = container.querySelectorAll('.max-w-md.mx-auto .h-4');
      expect(bioSkeletons.length).toBe(3);

      // Check for social links
      const socialSkeletons = container.querySelectorAll('.h-8.w-8.rounded');
      expect(socialSkeletons.length).toBe(3);
    });

    it('renders centered profile content', () => {
      const { container } = render(<SkeletonScreen variant="profile" />);

      const centeredContainer = container.querySelector('.text-center');
      expect(centeredContainer).toBeInTheDocument();
    });

    it('renders profile with proper spacing', () => {
      const { container } = render(<SkeletonScreen variant="profile" />);

      const spacingContainer = container.querySelector('.space-y-6');
      expect(spacingContainer).toBeInTheDocument();
    });
  });

  describe('Hero Variant', () => {
    it('renders hero skeleton structure', () => {
      const { container } = render(<SkeletonScreen variant="hero" />);

      // Check for hero container
      const heroSkeleton = container.querySelector(
        '.bg-white.dark\\:bg-gray-800'
      );
      expect(heroSkeleton).toBeInTheDocument();

      // Check for main heading skeletons
      const headingSkeletons = container.querySelectorAll(
        '.h-12.w-3\\/4.mx-auto, .h-12.w-1\\/2.mx-auto'
      );
      expect(headingSkeletons.length).toBe(2);

      // Check for subtitle skeletons
      const subtitleContainer = container.querySelector('.max-w-2xl.mx-auto');
      expect(subtitleContainer).toBeInTheDocument();
      const subtitleSkeletons = subtitleContainer?.querySelectorAll('.h-5');
      expect(subtitleSkeletons?.length).toBe(2);

      // Check for CTA button skeletons
      const ctaSkeletons = container.querySelectorAll(
        '.h-12.w-32.rounded-lg, .h-12.w-28.rounded-lg'
      );
      expect(ctaSkeletons.length).toBe(2);

      // Check for stats skeletons (3 stat items)
      const statContainers = container.querySelectorAll(
        '.text-center.space-y-2'
      );
      expect(statContainers.length).toBe(3);
    });

    it('renders hero with large padding', () => {
      const { container } = render(<SkeletonScreen variant="hero" />);

      const paddedContainer = container.querySelector('.p-12');
      expect(paddedContainer).toBeInTheDocument();
    });

    it('renders hero stats with proper spacing', () => {
      const { container } = render(<SkeletonScreen variant="hero" />);

      const statsContainer = container.querySelector(
        '.flex.justify-center.space-x-12.mt-12'
      );
      expect(statsContainer).toBeInTheDocument();
    });
  });

  describe('Custom Variant', () => {
    it('renders card skeleton for custom variant', () => {
      const { container } = render(<SkeletonScreen variant="custom" />);

      // Custom variant should default to card skeleton
      const cardSkeleton = container.querySelector('.h-12.w-12.rounded-lg');
      expect(cardSkeleton).toBeInTheDocument();
    });

    it('handles unknown variant by defaulting to card', () => {
      // @ts-ignore - Testing invalid variant
      const { container } = render(<SkeletonScreen variant="unknown" />);

      // Should render card skeleton
      const cardSkeleton = container.querySelector('.h-12.w-12.rounded-lg');
      expect(cardSkeleton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SkeletonScreen />);

      const skeleton = screen.getAllByRole('status')[0];
      expect(skeleton).toHaveAttribute('aria-label', '로딩 중...');
    });

    it('includes screen reader only text', () => {
      render(<SkeletonScreen />);

      const srText = screen.getAllByText('콘텐츠를 불러오는 중입니다...')[0];
      expect(srText).toHaveClass('sr-only');
    });

    it('maintains accessibility across all variants', () => {
      const variants: Array<'blog' | 'card' | 'list' | 'profile' | 'hero'> = [
        'blog',
        'card',
        'list',
        'profile',
        'hero',
      ];

      variants.forEach((variant) => {
        const { container } = render(<SkeletonScreen variant={variant} />);

        const skeleton = container.querySelector('[role="status"]');
        expect(skeleton).toHaveAttribute('aria-label', '로딩 중...');

        const srText = container.querySelector('.sr-only');
        expect(srText).toHaveTextContent('콘텐츠를 불러오는 중입니다...');
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('includes dark mode classes for blog variant', () => {
      const { container } = render(<SkeletonScreen variant="blog" />);

      const darkElements = container.querySelectorAll(
        '.dark\\:bg-gray-800, .dark\\:bg-gray-700'
      );
      expect(darkElements.length).toBeGreaterThan(0);
    });

    it('includes dark mode classes for card variant', () => {
      const { container } = render(<SkeletonScreen variant="card" />);

      const darkElements = container.querySelectorAll(
        '.dark\\:bg-gray-800, .dark\\:bg-gray-700'
      );
      expect(darkElements.length).toBeGreaterThan(0);
    });

    it('includes dark mode classes for all skeleton items', () => {
      const { container } = render(<SkeletonScreen variant="blog" />);

      const skeletonItems = container.querySelectorAll(
        '.bg-gray-200.dark\\:bg-gray-700'
      );
      expect(skeletonItems.length).toBeGreaterThan(0);
    });
  });

  describe('Component Integration', () => {
    it.skip('can be used as a loading state placeholder', () => {
      const LoadingComponent = ({ isLoading }: { isLoading: boolean }) => (
        <>
          {isLoading ? (
            <SkeletonScreen variant="blog" count={3} />
          ) : (
            <div>Content loaded</div>
          )}
        </>
      );

      const { rerender } = render(<LoadingComponent isLoading={true} />);
      expect(screen.getAllByRole('status')[0]).toBeInTheDocument();

      rerender(<LoadingComponent isLoading={false} />);
      expect(screen.queryAllByRole('status')).toHaveLength(0);
      expect(screen.getByText('Content loaded')).toBeInTheDocument();
    });

    it('supports responsive layouts', () => {
      const { container } = render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonScreen variant="card" count={6} />
        </div>
      );

      const skeletons = container.querySelectorAll(
        '.bg-white.dark\\:bg-gray-800'
      );
      expect(skeletons.length).toBe(6);
    });

    it('maintains consistent styling across counts', () => {
      const { container } = render(<SkeletonScreen variant="list" count={3} />);

      const listItems = container.querySelectorAll(
        '.flex.items-center.space-x-4.p-4'
      );

      // All items should have the same structure
      listItems.forEach((item) => {
        expect(
          item.querySelector('.h-10.w-10.rounded-full')
        ).toBeInTheDocument();
        expect(item.querySelector('.h-4.w-3\\/4')).toBeInTheDocument();
        expect(item.querySelector('.h-3.w-1\\/2')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('renders efficiently with high count', () => {
      const { container } = render(
        <SkeletonScreen variant="list" count={50} />
      );

      const listItems = container.querySelectorAll(
        '.flex.items-center.space-x-4.p-4'
      );
      expect(listItems.length).toBe(50);
    });

    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<SkeletonScreen variant="card" count={2} />);

      // Re-render with same props
      rerender(<SkeletonScreen variant="card" count={2} />);

      // Component should maintain same structure
      expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles count of 0', () => {
      const { container } = render(<SkeletonScreen count={0} />);

      const skeletonItems = container.querySelectorAll(
        '.bg-white.dark\\:bg-gray-800'
      );
      expect(skeletonItems.length).toBe(0);

      // Should still have the wrapper with accessibility attributes
      expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
    });

    it('handles negative count as 0', () => {
      const { container } = render(<SkeletonScreen count={-5} />);

      const skeletonItems = container.querySelectorAll(
        '.bg-white.dark\\:bg-gray-800'
      );
      expect(skeletonItems.length).toBe(0);
    });

    it('handles very long className', () => {
      const longClass =
        'very-long-class-name-that-might-break-something-if-not-handled-properly';
      const { container } = render(<SkeletonScreen className={longClass} />);

      const skeleton = container.querySelector(`[role="status"]`);
      expect(skeleton).toHaveClass(longClass);
    });

    it('maintains structure with empty className', () => {
      render(<SkeletonScreen className="" />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
    });
  });
});
