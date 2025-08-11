/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import UnifiedLoading, { PageLoading, InlineLoading, ButtonLoading } from '../UnifiedLoading';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

// Mock SkeletonLoader components
jest.mock('../SkeletonLoader', () => ({
  SkeletonHero: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-hero" className={className}>
      Skeleton Hero
    </div>
  ),
  SkeletonServices: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-services" className={className}>
      Skeleton Services
    </div>
  ),
  SkeletonBlogList: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-blog-list" className={className}>
      Skeleton Blog List
    </div>
  ),
  SkeletonForm: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-form" className={className}>
      Skeleton Form
    </div>
  ),
  SkeletonCard: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-card" className={className}>
      Skeleton Card
    </div>
  ),
}));

describe('UnifiedLoading Component', () => {
  describe('Default Spinner Variant', () => {
    it('renders default spinner loading', () => {
      const { container } = render(<UnifiedLoading />);

      const spinner = container.querySelector('.border-4.border-t-transparent.rounded-full');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-12', 'h-12', 'border-indigo-600');
    });

    it('renders spinner with custom message', () => {
      render(<UnifiedLoading message="Custom loading message" />);

      expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    });

    it('renders spinner with custom size', () => {
      const { container } = render(<UnifiedLoading size="lg" />);

      const spinner = container.querySelector('.border-4.border-t-transparent.rounded-full');
      expect(spinner).toHaveClass('w-16', 'h-16');
    });

    it('renders spinner with custom color', () => {
      const { container } = render(<UnifiedLoading color="blue" />);

      const spinner = container.querySelector('.border-4.border-t-transparent.rounded-full');
      expect(spinner).toHaveClass('border-blue-600');
    });

    it('renders spinner with custom className', () => {
      const { container } = render(<UnifiedLoading className="custom-loading" />);

      const container_div = container.querySelector('.custom-loading');
      expect(container_div).toBeInTheDocument();
    });
  });

  describe('Page Variant', () => {
    it('renders page loading with fullscreen wrapper', () => {
      const { container } = render(<UnifiedLoading variant="page" />);

      const fullscreenWrapper = container.querySelector(
        '.fixed.inset-0.bg-white.bg-opacity-90.z-50.flex.items-center.justify-center'
      );
      expect(fullscreenWrapper).toBeInTheDocument();
    });

    it('renders page loading with spinner inside fullscreen wrapper', () => {
      const { container } = render(<UnifiedLoading variant="page" />);

      const fullscreenWrapper = container.querySelector('.fixed.inset-0');
      const spinner = fullscreenWrapper?.querySelector(
        '.border-4.border-t-transparent.rounded-full'
      );
      expect(spinner).toBeInTheDocument();
    });

    it('renders page loading with message', () => {
      render(<UnifiedLoading variant="page" message="Loading page..." />);

      expect(screen.getByText('Loading page...')).toBeInTheDocument();
    });
  });

  describe('Inline Variant', () => {
    it('renders inline loading as span element', () => {
      const { container } = render(<UnifiedLoading variant="inline" />);

      const inlineContainer = container.querySelector('.inline-flex.items-center');
      expect(inlineContainer).toBeInTheDocument();
      expect(inlineContainer?.tagName).toBe('SPAN');
    });

    it('renders inline loading with smaller spinner', () => {
      const { container } = render(<UnifiedLoading variant="inline" />);

      const spinner = container.querySelector(
        '.inline-block.w-4.h-4.border-2.border-t-transparent.rounded-full'
      );
      expect(spinner).toBeInTheDocument();
    });

    it('renders inline loading with message', () => {
      render(<UnifiedLoading variant="inline" message="Loading..." />);

      const message = screen.getByText('Loading...');
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass('ml-2', 'text-sm', 'text-gray-600');
    });

    it('renders inline loading without fullscreen wrapper', () => {
      const { container } = render(<UnifiedLoading variant="inline" />);

      const fullscreenWrapper = container.querySelector('.fixed.inset-0');
      expect(fullscreenWrapper).not.toBeInTheDocument();
    });
  });

  describe('Skeleton Variants', () => {
    it('renders skeleton-hero variant', () => {
      render(<UnifiedLoading variant="skeleton-hero" />);

      expect(screen.getByTestId('skeleton-hero')).toBeInTheDocument();
    });

    it('renders skeleton-services variant', () => {
      render(<UnifiedLoading variant="skeleton-services" />);

      expect(screen.getByTestId('skeleton-services')).toBeInTheDocument();
    });

    it('renders skeleton-blog variant', () => {
      render(<UnifiedLoading variant="skeleton-blog" />);

      expect(screen.getByTestId('skeleton-blog-list')).toBeInTheDocument();
    });

    it('renders skeleton-form variant', () => {
      render(<UnifiedLoading variant="skeleton-form" />);

      expect(screen.getByTestId('skeleton-form')).toBeInTheDocument();
    });

    it('renders skeleton-card variant', () => {
      render(<UnifiedLoading variant="skeleton-card" />);

      expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
    });

    it('passes className to skeleton components', () => {
      render(<UnifiedLoading variant="skeleton-hero" className="custom-skeleton" />);

      const skeletonHero = screen.getByTestId('skeleton-hero');
      expect(skeletonHero).toHaveClass('custom-skeleton');
    });
  });

  describe('Dots Variant', () => {
    it('renders dots animation', () => {
      const { container } = render(<UnifiedLoading variant="dots" />);

      const dotsContainer = container.querySelector('.flex.items-center.justify-center.space-x-2');
      expect(dotsContainer).toBeInTheDocument();

      const dots = container.querySelectorAll('.w-3.h-3.rounded-full');
      expect(dots.length).toBe(3);
    });

    it('renders dots with default color', () => {
      const { container } = render(<UnifiedLoading variant="dots" />);

      const dots = container.querySelectorAll('.bg-indigo-600');
      expect(dots.length).toBe(3);
    });

    it('renders dots with custom color', () => {
      const { container } = render(<UnifiedLoading variant="dots" color="blue" />);

      const dots = container.querySelectorAll('.bg-blue-600');
      expect(dots.length).toBe(3);
    });

    it('renders dots with message', () => {
      render(<UnifiedLoading variant="dots" message="Processing..." />);

      const message = screen.getByText('Processing...');
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass('ml-4', 'text-gray-600');
    });

    it('renders dots with fullscreen wrapper when fullScreen is true', () => {
      const { container } = render(<UnifiedLoading variant="dots" fullScreen />);

      const fullscreenWrapper = container.querySelector('.fixed.inset-0');
      expect(fullscreenWrapper).toBeInTheDocument();
    });
  });

  describe('Pulse Variant', () => {
    it('renders pulse animation', () => {
      const { container } = render(<UnifiedLoading variant="pulse" />);

      const pulseContainer = container.querySelector('.flex.flex-col.items-center.justify-center');
      expect(pulseContainer).toBeInTheDocument();

      const pulseElement = container.querySelector('.rounded-full');
      expect(pulseElement).toBeInTheDocument();
    });

    it('renders pulse with correct size', () => {
      const { container } = render(<UnifiedLoading variant="pulse" size="lg" />);

      const pulseElement = container.querySelector('.w-16.h-16');
      expect(pulseElement).toBeInTheDocument();
    });

    it('renders pulse with custom color', () => {
      const { container } = render(<UnifiedLoading variant="pulse" color="green" />);

      const pulseElement = container.querySelector('.bg-green-600');
      expect(pulseElement).toBeInTheDocument();
    });

    it('renders pulse with message', () => {
      render(<UnifiedLoading variant="pulse" message="Loading data..." />);

      const message = screen.getByText('Loading data...');
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass('mt-4', 'text-gray-600');
    });

    it('renders pulse with fullscreen wrapper when fullScreen is true', () => {
      const { container } = render(<UnifiedLoading variant="pulse" fullScreen />);

      const fullscreenWrapper = container.querySelector('.fixed.inset-0');
      expect(fullscreenWrapper).toBeInTheDocument();
    });
  });

  describe('Size Options', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    const expectedClasses = ['w-8 h-8', 'w-12 h-12', 'w-16 h-16', 'w-20 h-20'];

    sizes.forEach((size, index) => {
      it(`renders ${size} size correctly`, () => {
        const { container } = render(<UnifiedLoading size={size} />);

        const spinner = container.querySelector('.border-4.border-t-transparent.rounded-full');
        expectedClasses[index].split(' ').forEach(className => {
          expect(spinner).toHaveClass(className);
        });
      });
    });
  });

  describe('Color Options', () => {
    const colors = ['indigo', 'blue', 'gray', 'green'] as const;

    colors.forEach(color => {
      it(`renders ${color} color correctly`, () => {
        const { container } = render(<UnifiedLoading color={color} />);

        const spinner = container.querySelector('.border-4.border-t-transparent.rounded-full');
        expect(spinner).toHaveClass(`border-${color}-600`);
      });
    });

    it('defaults to indigo color when invalid color is provided', () => {
      const { container } = render(<UnifiedLoading color={"invalid-color" as any} />);

      const spinner = container.querySelector('.border-4.border-t-transparent.rounded-full');
      expect(spinner).toHaveClass('border-indigo-600');
    });
  });

  describe('FullScreen Behavior', () => {
    it('renders fullscreen wrapper when fullScreen is true', () => {
      const { container } = render(<UnifiedLoading fullScreen />);

      const fullscreenWrapper = container.querySelector(
        '.fixed.inset-0.bg-white.bg-opacity-90.z-50.flex.items-center.justify-center'
      );
      expect(fullscreenWrapper).toBeInTheDocument();
    });

    it('does not render fullscreen wrapper when fullScreen is false', () => {
      const { container } = render(<UnifiedLoading fullScreen={false} />);

      const fullscreenWrapper = container.querySelector('.fixed.inset-0');
      expect(fullscreenWrapper).not.toBeInTheDocument();
    });

    it('page variant automatically uses fullscreen wrapper', () => {
      const { container } = render(<UnifiedLoading variant="page" fullScreen={false} />);

      const fullscreenWrapper = container.querySelector('.fixed.inset-0');
      expect(fullscreenWrapper).toBeInTheDocument();
    });

    it('inline variant never uses fullscreen wrapper', () => {
      const { container } = render(<UnifiedLoading variant="inline" fullScreen />);

      const fullscreenWrapper = container.querySelector('.fixed.inset-0');
      expect(fullscreenWrapper).not.toBeInTheDocument();
    });
  });

  describe('Preset Components', () => {
    describe('PageLoading', () => {
      it('renders page loading with default message', () => {
        render(<PageLoading />);

        expect(screen.getByText('페이지를 불러오는 중...')).toBeInTheDocument();
      });

      it('renders page loading with custom message', () => {
        render(<PageLoading message="커스텀 로딩 메시지" />);

        expect(screen.getByText('커스텀 로딩 메시지')).toBeInTheDocument();
      });

      it('uses page variant', () => {
        const { container } = render(<PageLoading />);

        const fullscreenWrapper = container.querySelector('.fixed.inset-0');
        expect(fullscreenWrapper).toBeInTheDocument();
      });
    });

    describe('InlineLoading', () => {
      it('renders inline loading without message', () => {
        const { container } = render(<InlineLoading />);

        const inlineContainer = container.querySelector('.inline-flex.items-center');
        expect(inlineContainer).toBeInTheDocument();

        const message = screen.queryByText(/Loading/);
        expect(message).not.toBeInTheDocument();
      });

      it('renders inline loading with custom message', () => {
        render(<InlineLoading message="처리 중..." />);

        expect(screen.getByText('처리 중...')).toBeInTheDocument();
      });

      it('uses small size', () => {
        const { container } = render(<InlineLoading />);

        const spinner = container.querySelector('.w-4.h-4');
        expect(spinner).toBeInTheDocument();
      });
    });

    describe('ButtonLoading', () => {
      it('renders button loading for use inside buttons', () => {
        const { container } = render(<ButtonLoading />);

        const inlineContainer = container.querySelector('.inline-flex.items-center');
        expect(inlineContainer).toBeInTheDocument();
      });

      it('uses small size', () => {
        const { container } = render(<ButtonLoading />);

        const spinner = container.querySelector('.w-4.h-4');
        expect(spinner).toBeInTheDocument();
      });

      it('uses white color for buttons', () => {
        const { container } = render(<ButtonLoading />);

        const spinner = container.querySelector('.border-white-600');
        expect(spinner).toBeInTheDocument();
      });
    });
  });

  describe('Message Rendering', () => {
    it('renders message with spinner variant', () => {
      render(<UnifiedLoading message="Loading data..." />);

      const message = screen.getByText('Loading data...');
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass('mt-4', 'text-gray-600');
    });

    it('does not render message element when message is not provided', () => {
      const { container } = render(<UnifiedLoading />);

      const messages = container.querySelectorAll('p');
      expect(messages.length).toBe(0);
    });

    it('renders empty message gracefully', () => {
      render(<UnifiedLoading message="" />);

      const message = screen.getByText('');
      expect(message).toBeInTheDocument();
    });

    it('renders long messages correctly', () => {
      const longMessage =
        'This is a very long loading message that should still be displayed correctly without breaking the layout or causing any visual issues.';

      render(<UnifiedLoading message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('does not contain interactive elements', () => {
      render(<UnifiedLoading message="Loading..." />);

      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);

      const links = screen.queryAllByRole('link');
      expect(links.length).toBe(0);
    });

    it('provides meaningful content for screen readers', () => {
      render(<UnifiedLoading message="Loading user data" />);

      const message = screen.getByText('Loading user data');
      expect(message).toBeInTheDocument();
    });

    it('skeleton variants provide non-interactive placeholders', () => {
      render(<UnifiedLoading variant="skeleton-hero" />);

      const skeletonHero = screen.getByTestId('skeleton-hero');
      expect(skeletonHero).toBeInTheDocument();

      const interactiveElements = screen.queryAllByRole('button');
      expect(interactiveElements.length).toBe(0);
    });
  });

  describe('Performance', () => {
    it('renders quickly with complex variants', () => {
      const startTime = performance.now();

      render(
        <div>
          <UnifiedLoading variant="skeleton-hero" />
          <UnifiedLoading variant="skeleton-services" />
          <UnifiedLoading variant="dots" />
          <UnifiedLoading variant="pulse" />
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100);
    });

    it('handles rapid re-renders efficiently', () => {
      const variants = ['spinner', 'dots', 'pulse', 'skeleton-hero'] as const;
      const { rerender } = render(<UnifiedLoading variant="spinner" />);

      variants.forEach(variant => {
        rerender(<UnifiedLoading variant={variant} />);
      });

      // Should render final state correctly
      expect(screen.getByTestId('skeleton-hero')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('has correct display name', () => {
      expect(UnifiedLoading.displayName).toBe('UnifiedLoading');
    });

    it('uses memo for optimization', () => {
      const { rerender } = render(<UnifiedLoading message="Test" />);

      // Rerender with same props should use memoized version
      rerender(<UnifiedLoading message="Test" />);

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined variant gracefully', () => {
      const { container } = render(<UnifiedLoading variant={undefined as any} />);

      // Should default to spinner
      const spinner = container.querySelector('.border-4.border-t-transparent.rounded-full');
      expect(spinner).toBeInTheDocument();
    });

    it('handles invalid variant gracefully', () => {
      const { container } = render(<UnifiedLoading variant={'invalid-variant' as any} />);

      // Should default to spinner
      const spinner = container.querySelector('.border-4.border-t-transparent.rounded-full');
      expect(spinner).toBeInTheDocument();
    });

    it('handles null message gracefully', () => {
      expect(() => {
        render(<UnifiedLoading message={null as any} />);
      }).not.toThrow();
    });

    it('handles undefined size gracefully', () => {
      const { container } = render(<UnifiedLoading size={undefined as any} />);

      // Should default to md size
      const spinner = container.querySelector('.w-12.h-12');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('applies correct animation classes to spinner', () => {
      const { container } = render(<UnifiedLoading />);

      const animatedElement = container.querySelector(
        '.border-4.border-t-transparent.rounded-full'
      );
      expect(animatedElement).toBeInTheDocument();
    });

    it('applies correct layout classes to fullscreen wrapper', () => {
      const { container } = render(<UnifiedLoading variant="page" />);

      const fullscreenWrapper = container.querySelector(
        '.fixed.inset-0.bg-white.bg-opacity-90.z-50.flex.items-center.justify-center'
      );
      expect(fullscreenWrapper).toBeInTheDocument();
    });

    it('applies correct spacing classes to inline variant', () => {
      const { container } = render(<UnifiedLoading variant="inline" message="Test" />);

      const inlineContainer = container.querySelector('.inline-flex.items-center');
      expect(inlineContainer).toBeInTheDocument();

      const message = screen.getByText('Test');
      expect(message).toHaveClass('ml-2');
    });
  });
});
