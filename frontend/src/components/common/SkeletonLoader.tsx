import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
}

const Skeleton: React.FC<SkeletonProps & { 'data-testid'?: string }> = ({
  className = '',
  width,
  height,
  rounded = true,
  circle = false,
  'data-testid': dataTestId,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  const shapeClasses = circle ? 'rounded-full' : rounded ? 'rounded' : '';

  const styles: React.CSSProperties = {};
  if (width) styles.width = width;
  if (height) styles.height = height;

  return (
    <div
      className={`${baseClasses} ${shapeClasses} ${className}`}
      style={styles}
      data-testid={dataTestId}
    />
  );
};

// Card Skeleton for blog posts, services, etc.
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`space-y-4 p-6 bg-white rounded-lg border ${className}`}
    data-testid="skeleton-card"
  >
    <Skeleton height={200} className="w-full" />
    <div className="space-y-2">
      <Skeleton height={24} className="w-3/4" />
      <Skeleton height={16} className="w-1/2" />
    </div>
    <div className="space-y-2">
      <Skeleton height={14} className="w-full" />
      <Skeleton height={14} className="w-5/6" />
      <Skeleton height={14} className="w-4/6" />
    </div>
    <div className="flex justify-between items-center pt-4">
      <Skeleton height={20} width={80} />
      <Skeleton height={16} width={120} />
    </div>
  </div>
);

// Text Block Skeleton for articles, content
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`} data-testid="skeleton-text">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton key={index} height={16} className={index === lines - 1 ? 'w-3/4' : 'w-full'} />
    ))}
  </div>
);

// List Item Skeleton
export const SkeletonListItem: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center space-x-4 p-4 ${className}`} data-testid="skeleton-list-item">
    <Skeleton circle width={48} height={48} />
    <div className="flex-1 space-y-2">
      <Skeleton height={18} className="w-1/3" />
      <Skeleton height={14} className="w-3/4" />
    </div>
    <Skeleton height={32} width={80} />
  </div>
);

// Hero Section Skeleton
export const SkeletonHero: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`py-20 px-4 ${className}`} data-testid="skeleton-hero">
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <Skeleton height={48} className="w-3/4 mx-auto" />
        <Skeleton height={48} className="w-2/3 mx-auto" />
      </div>
      <div className="space-y-3">
        <Skeleton height={20} className="w-full max-w-2xl mx-auto" />
        <Skeleton height={20} className="w-5/6 max-w-2xl mx-auto" />
        <Skeleton height={20} className="w-4/6 max-w-2xl mx-auto" />
      </div>
      <div className="flex justify-center space-x-4">
        <Skeleton height={48} width={120} />
        <Skeleton height={48} width={140} />
      </div>
    </div>
  </div>
);

// Services Section Skeleton
export const SkeletonServices: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`py-16 ${className}`} data-testid="skeleton-services">
    <div className="max-w-6xl mx-auto px-4">
      {/* Title */}
      <div className="text-center mb-16 space-y-4">
        <Skeleton height={40} className="w-1/3 mx-auto" />
        <Skeleton height={24} className="w-1/2 mx-auto" />
      </div>

      {/* Service Cards Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-6 p-8 bg-white rounded-3xl border-2">
            <div className="space-y-4">
              <Skeleton width={48} height={48} />
              <Skeleton height={28} className="w-3/4" />
              <Skeleton height={4} width={48} />
            </div>
            <div className="space-y-3">
              <Skeleton height={20} className="w-full" />
              <Skeleton height={20} className="w-5/6" />
              <Skeleton height={20} className="w-4/6" />
            </div>
            <div className="space-y-2">
              <Skeleton height={16} className="w-full" />
              <Skeleton height={16} className="w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Blog List Skeleton
export const SkeletonBlogList: React.FC<{ count?: number; className?: string }> = ({
  count = 6,
  className = '',
}) => (
  <div
    className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}
    data-testid="skeleton-blog-list"
  >
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

// Navigation Skeleton
export const SkeletonNav: React.FC<{ className?: string }> = ({ className = '' }) => (
  <nav className={`flex items-center justify-between p-4 ${className}`} data-testid="skeleton-nav">
    <Skeleton width={120} height={32} />
    <div className="flex items-center space-x-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} width={80} height={20} />
      ))}
    </div>
    <Skeleton width={100} height={36} />
  </nav>
);

// Form Skeleton
export const SkeletonForm: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`} data-testid="skeleton-form">
    <div className="space-y-2">
      <Skeleton height={20} width={80} />
      <Skeleton height={44} className="w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton height={20} width={60} />
      <Skeleton height={44} className="w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton height={20} width={70} />
      <Skeleton height={120} className="w-full" />
    </div>
    <Skeleton height={48} width={120} />
  </div>
);

export default Skeleton;
