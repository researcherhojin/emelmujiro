/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Skeleton, {
  SkeletonCard,
  SkeletonText,
  SkeletonListItem,
  SkeletonHero,
  SkeletonServices,
  SkeletonBlogList,
  SkeletonNav,
  SkeletonForm,
} from '../SkeletonLoader';

describe('Skeleton Component', () => {
  describe('Basic Skeleton', () => {
    it('renders with default props', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded');
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('custom-class', 'animate-pulse', 'bg-gray-200', 'rounded');
    });

    it('applies custom width and height', () => {
      const { container } = render(<Skeleton width="100px" height="50px" />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.width).toBe('100px');
      expect(skeleton.style.height).toBe('50px');
    });

    it('applies numeric width and height', () => {
      const { container } = render(<Skeleton width={200} height={100} />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.width).toBe('200px');
      expect(skeleton.style.height).toBe('100px');
    });

    it('renders as circle when circle prop is true', () => {
      const { container } = render(<Skeleton circle />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-full');
      expect(skeleton).not.toHaveClass('rounded');
    });

    it('renders without rounded corners when rounded is false', () => {
      const { container } = render(<Skeleton rounded={false} />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).not.toHaveClass('rounded');
      expect(skeleton).not.toHaveClass('rounded-full');
    });

    it('circle prop overrides rounded prop', () => {
      const { container } = render(<Skeleton circle rounded={false} />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-full');
      expect(skeleton).not.toHaveClass('rounded');
    });

    it('renders as div element', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild;
      expect(skeleton?.nodeName).toBe('DIV');
    });
  });

  describe('SkeletonCard Component', () => {
    it('renders card skeleton structure', () => {
      const { container } = render(<SkeletonCard />);

      const card = container.querySelector('.space-y-4.p-6.bg-white.rounded-lg.border');
      expect(card).toBeInTheDocument();
    });

    it('renders image placeholder', () => {
      const { container } = render(<SkeletonCard />);

      const imagePlaceholder = container.querySelector('.w-full[style*="height: 200px"]');
      expect(imagePlaceholder).toBeInTheDocument();
    });

    it('renders title and subtitle placeholders', () => {
      const { container } = render(<SkeletonCard />);

      const titlePlaceholder = container.querySelector('.w-3\\/4[style*="height: 24px"]');
      const subtitlePlaceholder = container.querySelector('.w-1\\/2[style*="height: 16px"]');

      expect(titlePlaceholder).toBeInTheDocument();
      expect(subtitlePlaceholder).toBeInTheDocument();
    });

    it('renders content text placeholders', () => {
      const { container } = render(<SkeletonCard />);

      const textPlaceholders = container.querySelectorAll('[style*="height: 14px"]');
      expect(textPlaceholders.length).toBeGreaterThanOrEqual(3);
    });

    it('renders footer elements', () => {
      const { container } = render(<SkeletonCard />);

      const footer = container.querySelector('.flex.justify-between.items-center.pt-4');
      expect(footer).toBeInTheDocument();

      const footerElements = footer?.children;
      expect(footerElements?.length).toBe(2);
    });

    it('applies custom className to card', () => {
      const { container } = render(<SkeletonCard className="custom-card" />);

      const card = container.querySelector('.custom-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('space-y-4', 'p-6', 'bg-white', 'rounded-lg', 'border');
    });
  });

  describe('SkeletonText Component', () => {
    it('renders default number of lines', () => {
      const { container } = render(<SkeletonText />);

      const textLines = container.querySelectorAll('[style*="height: 16px"]');
      expect(textLines.length).toBe(3);
    });

    it('renders custom number of lines', () => {
      const { container } = render(<SkeletonText lines={5} />);

      const textLines = container.querySelectorAll('[style*="height: 16px"]');
      expect(textLines.length).toBe(5);
    });

    it('renders single line correctly', () => {
      const { container } = render(<SkeletonText lines={1} />);

      const textLines = container.querySelectorAll('[style*="height: 16px"]');
      expect(textLines.length).toBe(1);
    });

    it('makes last line shorter', () => {
      const { container } = render(<SkeletonText lines={3} />);

      const textLines = container.querySelectorAll('[style*="height: 16px"]');
      const lastLine = textLines[textLines.length - 1];

      expect(lastLine).toHaveClass('w-3/4');
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonText className="custom-text" />);

      const textContainer = container.querySelector('.custom-text');
      expect(textContainer).toBeInTheDocument();
      expect(textContainer).toHaveClass('space-y-2');
    });

    it('handles zero lines gracefully', () => {
      const { container } = render(<SkeletonText lines={0} />);

      const textLines = container.querySelectorAll('[style*="height: 16px"]');
      expect(textLines.length).toBe(0);
    });
  });

  describe('SkeletonListItem Component', () => {
    it('renders list item structure', () => {
      const { container } = render(<SkeletonListItem />);

      const listItem = container.querySelector('.flex.items-center.space-x-4.p-4');
      expect(listItem).toBeInTheDocument();
    });

    it('renders circular avatar placeholder', () => {
      const { container } = render(<SkeletonListItem />);

      const avatar = container.querySelector(
        '.rounded-full[style*="width: 48px"][style*="height: 48px"]'
      );
      expect(avatar).toBeInTheDocument();
    });

    it('renders content area with text placeholders', () => {
      const { container } = render(<SkeletonListItem />);

      const contentArea = container.querySelector('.flex-1.space-y-2');
      expect(contentArea).toBeInTheDocument();

      const textPlaceholders = contentArea?.querySelectorAll('.animate-pulse.bg-gray-200');
      expect(textPlaceholders?.length).toBeGreaterThanOrEqual(2);
    });

    it('renders action button placeholder', () => {
      const { container } = render(<SkeletonListItem />);

      const actionButton = container.querySelector('[style*="height: 32px"][style*="width: 80px"]');
      expect(actionButton).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonListItem className="custom-item" />);

      const listItem = container.querySelector('.custom-item');
      expect(listItem).toBeInTheDocument();
    });
  });

  describe('SkeletonHero Component', () => {
    it('renders hero section structure', () => {
      const { container } = render(<SkeletonHero />);

      const hero = container.querySelector('.py-20.px-4');
      expect(hero).toBeInTheDocument();

      const heroContent = container.querySelector('.max-w-4xl.mx-auto.text-center.space-y-8');
      expect(heroContent).toBeInTheDocument();
    });

    it('renders title placeholders', () => {
      const { container } = render(<SkeletonHero />);

      const titleSection = container.querySelector('.space-y-4');
      expect(titleSection).toBeInTheDocument();

      const titleLines = titleSection?.querySelectorAll(
        '.animate-pulse.bg-gray-200.rounded[style*="height: 48px"]'
      );
      expect(titleLines?.length).toBe(2);
    });

    it('renders description placeholders', () => {
      const { container } = render(<SkeletonHero />);

      const descriptionLines = container.querySelectorAll('[style*="height: 20px"]');
      expect(descriptionLines.length).toBeGreaterThanOrEqual(3);
    });

    it('renders CTA button placeholders', () => {
      const { container } = render(<SkeletonHero />);

      const ctaContainer = container.querySelector('.flex.justify-center.space-x-4');
      expect(ctaContainer).toBeInTheDocument();

      const ctaButtons = ctaContainer?.querySelectorAll('[style*="height: 48px"]');
      expect(ctaButtons?.length).toBe(2);
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonHero className="custom-hero" />);

      const hero = container.querySelector('.custom-hero');
      expect(hero).toBeInTheDocument();
    });
  });

  describe('SkeletonServices Component', () => {
    it('renders services section structure', () => {
      const { container } = render(<SkeletonServices />);

      const services = container.querySelector('.py-16');
      expect(services).toBeInTheDocument();

      const servicesContent = container.querySelector('.max-w-6xl.mx-auto.px-4');
      expect(servicesContent).toBeInTheDocument();
    });

    it('renders section title placeholders', () => {
      const { container } = render(<SkeletonServices />);

      const titleSection = container.querySelector('.text-center.mb-16.space-y-4');
      expect(titleSection).toBeInTheDocument();

      const titlePlaceholder = container.querySelector('.w-1\\/3.mx-auto[style*="height: 40px"]');
      const subtitlePlaceholder = container.querySelector(
        '.w-1\\/2.mx-auto[style*="height: 24px"]'
      );

      expect(titlePlaceholder).toBeInTheDocument();
      expect(subtitlePlaceholder).toBeInTheDocument();
    });

    it('renders service cards grid', () => {
      const { container } = render(<SkeletonServices />);

      const grid = container.querySelector('.grid.lg\\:grid-cols-3.gap-8');
      expect(grid).toBeInTheDocument();

      const serviceCards = container.querySelectorAll(
        '.space-y-6.p-8.bg-white.rounded-3xl.border-2'
      );
      expect(serviceCards.length).toBe(3);
    });

    it('renders service card content', () => {
      const { container } = render(<SkeletonServices />);

      const serviceCards = container.querySelectorAll(
        '.space-y-6.p-8.bg-white.rounded-3xl.border-2'
      );

      serviceCards.forEach(card => {
        // Icon placeholder
        const icon = card.querySelector('[style*="width: 48px"][style*="height: 48px"]');
        expect(icon).toBeInTheDocument();

        // Title placeholder
        const title = card.querySelector('.w-3\\/4[style*="height: 28px"]');
        expect(title).toBeInTheDocument();

        // Divider
        const divider = card.querySelector('[style*="height: 4px"][style*="width: 48px"]');
        expect(divider).toBeInTheDocument();
      });
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonServices className="custom-services" />);

      const services = container.querySelector('.custom-services');
      expect(services).toBeInTheDocument();
    });
  });

  describe('SkeletonBlogList Component', () => {
    it('renders default number of blog cards', () => {
      const { container } = render(<SkeletonBlogList />);

      const grid = container.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-3.gap-8');
      expect(grid).toBeInTheDocument();

      const blogCards = container.querySelectorAll('.space-y-4.p-6.bg-white.rounded-lg.border');
      expect(blogCards.length).toBe(6);
    });

    it('renders custom number of blog cards', () => {
      const { container } = render(<SkeletonBlogList count={3} />);

      const blogCards = container.querySelectorAll('.space-y-4.p-6.bg-white.rounded-lg.border');
      expect(blogCards.length).toBe(3);
    });

    it('renders single blog card', () => {
      const { container } = render(<SkeletonBlogList count={1} />);

      const blogCards = container.querySelectorAll('.space-y-4.p-6.bg-white.rounded-lg.border');
      expect(blogCards.length).toBe(1);
    });

    it('handles zero count gracefully', () => {
      const { container } = render(<SkeletonBlogList count={0} />);

      const blogCards = container.querySelectorAll('.space-y-4.p-6.bg-white.rounded-lg.border');
      expect(blogCards.length).toBe(0);
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonBlogList className="custom-blog-list" />);

      const blogList = container.querySelector('.custom-blog-list');
      expect(blogList).toBeInTheDocument();
      expect(blogList).toHaveClass('grid', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-8');
    });
  });

  describe('SkeletonNav Component', () => {
    it('renders navigation structure', () => {
      const { container } = render(<SkeletonNav />);

      const nav = container.querySelector('nav.flex.items-center.justify-between.p-4');
      expect(nav).toBeInTheDocument();
    });

    it('renders logo placeholder', () => {
      const { container } = render(<SkeletonNav />);

      const logo = container.querySelector('[style*="width: 120px"][style*="height: 32px"]');
      expect(logo).toBeInTheDocument();
    });

    it('renders navigation menu items', () => {
      const { container } = render(<SkeletonNav />);

      const menuContainer = container.querySelector('.flex.items-center.space-x-6');
      expect(menuContainer).toBeInTheDocument();

      const menuItems = menuContainer?.querySelectorAll(
        '[style*="width: 80px"][style*="height: 20px"]'
      );
      expect(menuItems?.length).toBe(4);
    });

    it('renders action button placeholder', () => {
      const { container } = render(<SkeletonNav />);

      const actionButton = container.querySelector(
        '[style*="width: 100px"][style*="height: 36px"]'
      );
      expect(actionButton).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonNav className="custom-nav" />);

      const nav = container.querySelector('.custom-nav');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('flex', 'items-center', 'justify-between', 'p-4');
    });
  });

  describe('SkeletonForm Component', () => {
    it('renders form structure', () => {
      const { container } = render(<SkeletonForm />);

      const form = container.querySelector('.space-y-6');
      expect(form).toBeInTheDocument();
    });

    it('renders form fields with labels and inputs', () => {
      const { container } = render(<SkeletonForm />);

      const formGroups = container.querySelectorAll('.space-y-2');
      expect(formGroups.length).toBe(3);

      // Check each form group has label and input
      formGroups.forEach(group => {
        const label = group.querySelector('[style*="height: 20px"]');
        const input = group.querySelector('[style*="height: 44px"], [style*="height: 120px"]');

        expect(label).toBeInTheDocument();
        expect(input).toBeInTheDocument();
      });
    });

    it('renders textarea field with different height', () => {
      const { container } = render(<SkeletonForm />);

      const textarea = container.querySelector('[style*="height: 120px"]');
      expect(textarea).toBeInTheDocument();
    });

    it('renders submit button placeholder', () => {
      const { container } = render(<SkeletonForm />);

      const submitButton = container.querySelector(
        '[style*="height: 48px"][style*="width: 120px"]'
      );
      expect(submitButton).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonForm className="custom-form" />);

      const form = container.querySelector('.custom-form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('space-y-6');
    });
  });

  describe('Accessibility', () => {
    it('all skeleton elements have loading animation', () => {
      const { container } = render(
        <div>
          <Skeleton />
          <SkeletonCard />
          <SkeletonText />
          <SkeletonListItem />
        </div>
      );

      const skeletonElements = container.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(5);
    });

    it('skeleton components do not interfere with screen readers', () => {
      render(<SkeletonCard />);

      // Skeleton components should not contain any interactive elements
      const interactiveElements = screen.queryAllByRole('button');
      expect(interactiveElements.length).toBe(0);

      const links = screen.queryAllByRole('link');
      expect(links.length).toBe(0);
    });

    it('skeleton components use semantic HTML', () => {
      const { container } = render(<SkeletonNav />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with many skeleton elements', () => {
      const startTime = performance.now();

      render(
        <div>
          <SkeletonBlogList count={20} />
          <SkeletonServices />
          <SkeletonHero />
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render reasonably quickly (under 100ms typically)
      expect(renderTime).toBeLessThan(200);
    });

    it('handles rapid re-renders without issues', () => {
      const { rerender } = render(<SkeletonText lines={3} />);

      // Multiple re-renders
      for (let i = 1; i <= 10; i++) {
        rerender(<SkeletonText lines={i} />);
      }

      // Should render without errors
      const { container } = render(<SkeletonText lines={10} />);
      const textLines = container.querySelectorAll('[style*="height: 16px"]');
      expect(textLines.length).toBe(10);
    });
  });

  describe('Visual Consistency', () => {
    it('all skeleton components use consistent gray color', () => {
      const { container } = render(
        <div>
          <Skeleton />
          <SkeletonCard />
          <SkeletonText />
        </div>
      );

      const skeletonElements = container.querySelectorAll('.bg-gray-200');
      expect(skeletonElements.length).toBeGreaterThan(5);
    });

    it('skeleton components maintain layout structure', () => {
      const { container } = render(<SkeletonCard />);

      // Card should maintain expected structure and spacing
      const card = container.querySelector('.space-y-4.p-6');
      expect(card).toBeInTheDocument();

      const sections = card?.querySelectorAll('.space-y-2, .space-y-3, .space-y-4');
      expect(sections?.length).toBeGreaterThan(0);
    });

    it('skeleton components have proper border radius', () => {
      render(
        <div>
          <Skeleton />
          <Skeleton circle />
          <SkeletonCard />
        </div>
      );

      const roundedElements = document.querySelectorAll('.rounded, .rounded-lg, .rounded-3xl');
      expect(roundedElements.length).toBeGreaterThan(0);

      const circleElements = document.querySelectorAll('.rounded-full');
      expect(circleElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined props gracefully', () => {
      expect(() => {
        render(
          <div>
            <Skeleton width={undefined} height={undefined} />
            <SkeletonText lines={undefined} />
            <SkeletonBlogList count={undefined} />
          </div>
        );
      }).not.toThrow();
    });

    it('handles negative values gracefully', () => {
      expect(() => {
        render(
          <div>
            <SkeletonText lines={-1} />
            <SkeletonBlogList count={-1} />
          </div>
        );
      }).not.toThrow();
    });

    it('handles very large values', () => {
      expect(() => {
        render(
          <div>
            <SkeletonText lines={1000} />
            <Skeleton width={9999} height={9999} />
          </div>
        );
      }).not.toThrow();
    });
  });
});
