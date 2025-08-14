import React from 'react';

// Type definitions
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  circle?: boolean;
  rounded?: boolean;
  'data-testid'?: string;
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

interface SkeletonBlogListProps {
  count?: number;
  className?: string;
}

interface ComponentProps {
  className?: string;
}

// Base Skeleton component
const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className = '',
  circle = false,
  rounded = true,
  'data-testid': dataTestId,
}) => {
  const widthStyle = width
    ? typeof width === 'number'
      ? `${width}px`
      : width
    : undefined;
  const heightStyle = height
    ? typeof height === 'number'
      ? `${height}px`
      : height
    : undefined;

  const roundedClass = circle ? 'rounded-full' : rounded ? 'rounded' : '';

  return (
    <div
      data-testid={dataTestId}
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${roundedClass} ${className}`}
      style={{
        width: widthStyle,
        height: heightStyle,
      }}
    />
  );
};

// Skeleton Card component
export const SkeletonCard: React.FC<ComponentProps> = ({ className = '' }) => (
  <div
    data-testid="skeleton-card"
    className={`space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
  >
    {/* Image */}
    <Skeleton height={200} />
    {/* Title */}
    <Skeleton height={24} width="75%" />
    {/* Subtitle */}
    <Skeleton height={16} width="50%" />
    {/* Content lines */}
    <div className="space-y-2">
      <Skeleton height={14} />
      <Skeleton height={14} />
      <Skeleton height={14} width="90%" />
    </div>
    {/* Footer */}
    <div className="flex justify-between items-center pt-2">
      <Skeleton height={20} width={80} />
      <Skeleton height={16} width={120} />
    </div>
  </div>
);

// Skeleton Text component
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
}) => (
  <div data-testid="skeleton-text" className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        height={16}
        className={i === lines - 1 ? 'w-3/4' : 'w-full'}
      />
    ))}
  </div>
);

// Skeleton List Item component
export const SkeletonListItem: React.FC<ComponentProps> = ({
  className = '',
}) => (
  <div
    data-testid="skeleton-list-item"
    className={`flex items-center space-x-4 p-4 ${className}`}
  >
    {/* Avatar */}
    <Skeleton width={48} height={48} circle />
    {/* Content */}
    <div className="flex-1 space-y-2">
      <Skeleton height={20} width="60%" />
      <Skeleton height={16} width="40%" />
    </div>
    {/* Action button */}
    <Skeleton height={32} width={80} />
  </div>
);

// Skeleton Hero component
export const SkeletonHero: React.FC<ComponentProps> = ({ className = '' }) => (
  <div data-testid="skeleton-hero" className={`py-20 px-4 ${className}`}>
    <div className="max-w-4xl mx-auto text-center space-y-8">
      {/* Title lines */}
      <div className="space-y-4">
        <Skeleton height={48} className="w-3/4 mx-auto" />
        <Skeleton height={48} className="w-2/3 mx-auto" />
      </div>
      {/* Description lines */}
      <div className="space-y-2">
        <Skeleton height={20} className="w-full mx-auto" />
        <Skeleton height={20} className="w-5/6 mx-auto" />
        <Skeleton height={20} className="w-4/5 mx-auto" />
      </div>
      {/* CTA buttons */}
      <div className="flex justify-center space-x-4">
        <Skeleton height={48} width={120} />
        <Skeleton height={48} width={140} />
      </div>
    </div>
  </div>
);

// Skeleton Services component
export const SkeletonServices: React.FC<ComponentProps> = ({
  className = '',
}) => (
  <div data-testid="skeleton-services" className={`py-16 ${className}`}>
    <div className="max-w-6xl mx-auto px-4">
      {/* Section header */}
      <div className="text-center mb-12 space-y-4">
        <Skeleton height={40} className="w-1/3 mx-auto" />
        <Skeleton height={24} className="w-1/2 mx-auto" />
      </div>
      {/* Service cards grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            {/* Icon */}
            <Skeleton width={48} height={48} className="mb-4" />
            {/* Title */}
            <Skeleton height={28} className="mb-2" />
            {/* Divider */}
            <Skeleton height={4} width={48} className="mb-4" />
            {/* Description lines */}
            <div className="space-y-2">
              <Skeleton height={16} />
              <Skeleton height={16} />
              <Skeleton height={16} width="80%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton Blog List component
export const SkeletonBlogList: React.FC<SkeletonBlogListProps> = ({
  count = 6,
  className = '',
}) => (
  <div
    data-testid="skeleton-blog-list"
    className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}
  >
    {Array.from({ length: Math.max(0, count) }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Skeleton Navigation component
export const SkeletonNav: React.FC<ComponentProps> = ({ className = '' }) => (
  <nav
    data-testid="skeleton-nav"
    className={`flex items-center justify-between p-4 ${className}`}
  >
    {/* Logo */}
    <Skeleton width={120} height={32} />
    {/* Menu items */}
    <div className="hidden md:flex space-x-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} width={80} height={20} />
      ))}
    </div>
    {/* Action button */}
    <Skeleton width={100} height={36} />
  </nav>
);

// Skeleton Form component
export const SkeletonForm: React.FC<ComponentProps> = ({ className = '' }) => (
  <div data-testid="skeleton-form" className={`space-y-6 ${className}`}>
    {/* Form fields */}
    <div className="space-y-2">
      <Skeleton height={20} width="30%" />
      <Skeleton height={44} />
    </div>
    <div className="space-y-2">
      <Skeleton height={20} width="25%" />
      <Skeleton height={44} />
    </div>
    <div className="space-y-2">
      <Skeleton height={20} width="35%" />
      <Skeleton height={120} />
    </div>
    {/* Submit button */}
    <Skeleton height={48} width={120} />
  </div>
);

// Default export
export default Skeleton;
