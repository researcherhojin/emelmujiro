import React, { memo } from 'react';
import {
  SkeletonHero,
  SkeletonServices,
  SkeletonBlogList,
  SkeletonForm,
  SkeletonCard,
} from './SkeletonLoader';

// Unified loading variant type
export type LoadingVariant =
  | 'spinner'
  | 'page'
  | 'inline'
  | 'skeleton-hero'
  | 'skeleton-services'
  | 'skeleton-blog'
  | 'skeleton-form'
  | 'skeleton-card'
  | 'dots'
  | 'pulse';

interface UnifiedLoadingProps {
  variant?: LoadingVariant;
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

const UnifiedLoading: React.FC<UnifiedLoadingProps> = memo(
  ({
    variant = 'spinner',
    message,
    fullScreen = false,
    size = 'md',
    className = '',
    color = 'indigo',
  }) => {
    // Size mapping
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20',
    };

    // Color mapping
    const colorClasses = {
      indigo: 'border-indigo-600',
      blue: 'border-blue-600',
      gray: 'border-gray-600',
      green: 'border-green-600',
    };

    const bgColorClasses = {
      indigo: 'bg-indigo-600',
      blue: 'bg-blue-600',
      gray: 'bg-gray-600',
      green: 'bg-green-600',
    };

    // Full-screen wrapper
    const FullScreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      if (fullScreen || variant === 'page') {
        return (
          <div
            className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center"
            data-testid="fullscreen-wrapper"
          >
            {children}
          </div>
        );
      }
      return <>{children}</>;
    };

    // Skeleton loader rendering
    if (variant.startsWith('skeleton-')) {
      switch (variant) {
        case 'skeleton-hero':
          return <SkeletonHero className={className} />;
        case 'skeleton-services':
          return <SkeletonServices className={className} />;
        case 'skeleton-blog':
          return <SkeletonBlogList className={className} />;
        case 'skeleton-form':
          return <SkeletonForm className={className} />;
        case 'skeleton-card':
          return <SkeletonCard className={className} />;
      }
    }

    // Dots animation
    if (variant === 'dots') {
      return (
        <FullScreenWrapper>
          <div
            className={`flex items-center justify-center space-x-2 ${className}`}
            data-testid="loading-dots"
          >
            {[0, 1, 2].map((index) => (
              <div
                key={`dot-${index}`}
                className={`w-3 h-3 ${bgColorClasses[color as keyof typeof bgColorClasses] || bgColorClasses.indigo} rounded-full animate-dot-bounce`}
                style={{ animationDelay: `${index * 0.2}s` }}
              />
            ))}
            {message && <span className="ml-4 text-gray-600">{message}</span>}
          </div>
        </FullScreenWrapper>
      );
    }

    // Pulse animation
    if (variant === 'pulse') {
      return (
        <FullScreenWrapper>
          <div
            className={`flex flex-col items-center justify-center ${className}`}
            data-testid="loading-pulse"
          >
            <div
              className={`${sizeClasses[size]} ${bgColorClasses[color as keyof typeof bgColorClasses] || bgColorClasses.indigo} rounded-full animate-scale-pulse`}
              data-testid="pulse-element"
            />
            {message && <p className="mt-4 text-gray-600">{message}</p>}
          </div>
        </FullScreenWrapper>
      );
    }

    // Inline loading
    if (variant === 'inline') {
      return (
        <span className={`inline-flex items-center ${className}`} data-testid="loading-inline">
          <span
            className={`inline-block w-4 h-4 border-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo} border-t-transparent rounded-full animate-spin`}
            data-testid="inline-spinner"
          />
          {message && <span className="ml-2 text-sm text-gray-600">{message}</span>}
        </span>
      );
    }

    // Default spinner (spinner, page)
    return (
      <FullScreenWrapper>
        <div
          className={`flex flex-col items-center justify-center ${className}`}
          data-testid="loading-spinner"
        >
          <div
            className={`${sizeClasses[size]} border-4 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo} border-t-transparent rounded-full animate-spin`}
            data-testid="spinner-element"
          />
          {message && (
            <p className="mt-4 text-gray-600 opacity-0 animate-fade-up-delay">{message}</p>
          )}
        </div>
      </FullScreenWrapper>
    );
  }
);

UnifiedLoading.displayName = 'UnifiedLoading';

// Convenience preset components
export const PageLoading: React.FC<{ message?: string }> = ({ message }) => (
  <UnifiedLoading variant="page" message={message} />
);

/**
 * RouteFallback — in-flow Suspense fallback for lazy-loaded route components.
 *
 * Unlike PageLoading (which is position:fixed and takes 0 document-flow space),
 * this reserves `min-h-screen` and centers the spinner. Critical for CLS:
 * a fixed-position fallback leaves `<main>` empty during lazy chunk load, so
 * when the real content renders, `<main>` grows from ~viewport height to full
 * content height and the footer shifts down by hundreds of pixels (measured
 * as CLS 0.528 on /contact and /profile before this fix).
 */
export const RouteFallback: React.FC = memo(() => (
  <div className="min-h-screen flex items-center justify-center" data-testid="route-fallback">
    <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
  </div>
));
RouteFallback.displayName = 'RouteFallback';

export const InlineLoading: React.FC<{ message?: string }> = ({ message }) => (
  <UnifiedLoading variant="inline" message={message} size="sm" />
);

export const ButtonLoading: React.FC = () => (
  <UnifiedLoading variant="inline" size="sm" color="white" />
);

export default UnifiedLoading;
