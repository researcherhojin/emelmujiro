import React, { memo } from 'react';
import { motion } from 'framer-motion';
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
    const FullScreenWrapper: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => {
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
              <motion.div
                key={`dot-${index}`}
                className={`w-3 h-3 ${bgColorClasses[color as keyof typeof bgColorClasses] || bgColorClasses.indigo} rounded-full`}
                animate={{
                  y: [0, -10, 0],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                }}
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
            <motion.div
              className={`${sizeClasses[size]} ${bgColorClasses[color as keyof typeof bgColorClasses] || bgColorClasses.indigo} rounded-full`}
              data-testid="pulse-element"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {message && <p className="mt-4 text-gray-600">{message}</p>}
          </div>
        </FullScreenWrapper>
      );
    }

    // Inline loading
    if (variant === 'inline') {
      return (
        <span
          className={`inline-flex items-center ${className}`}
          data-testid="loading-inline"
        >
          <motion.span
            className={`inline-block w-4 h-4 border-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo} border-t-transparent rounded-full`}
            data-testid="inline-spinner"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          {message && (
            <span className="ml-2 text-sm text-gray-600">{message}</span>
          )}
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
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
            className={`${sizeClasses[size]} border-4 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo} border-t-transparent rounded-full`}
            data-testid="spinner-element"
          />
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-gray-600"
            >
              {message}
            </motion.p>
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

export const InlineLoading: React.FC<{ message?: string }> = ({ message }) => (
  <UnifiedLoading variant="inline" message={message} size="sm" />
);

export const ButtonLoading: React.FC = () => (
  <UnifiedLoading variant="inline" size="sm" color="white" />
);

export default UnifiedLoading;
