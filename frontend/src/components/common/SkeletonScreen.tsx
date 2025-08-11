import React from 'react';

interface SkeletonScreenProps {
  variant?: 'blog' | 'card' | 'list' | 'profile' | 'hero' | 'custom';
  count?: number;
  className?: string;
  animate?: boolean;
}

interface SkeletonItemProps {
  className?: string;
  animate?: boolean;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ className = '', animate = true }) => (
  <div
    className={`bg-gray-200 dark:bg-gray-700 rounded ${
      animate ? 'animate-pulse' : ''
    } ${className}`}
  />
);

const BlogPostSkeleton: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
    <div className="space-y-4">
      {/* Title */}
      <SkeletonItem className="h-6 w-3/4" animate={animate} />

      {/* Meta info */}
      <div className="flex items-center space-x-4">
        <SkeletonItem className="h-4 w-20" animate={animate} />
        <SkeletonItem className="h-4 w-16" animate={animate} />
        <SkeletonItem className="h-4 w-12" animate={animate} />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <SkeletonItem className="h-4 w-full" animate={animate} />
        <SkeletonItem className="h-4 w-11/12" animate={animate} />
        <SkeletonItem className="h-4 w-4/5" animate={animate} />
      </div>

      {/* Tags */}
      <div className="flex space-x-2">
        <SkeletonItem className="h-6 w-16 rounded-full" animate={animate} />
        <SkeletonItem className="h-6 w-20 rounded-full" animate={animate} />
        <SkeletonItem className="h-6 w-14 rounded-full" animate={animate} />
      </div>
    </div>
  </div>
);

const CardSkeleton: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div className="space-y-4">
      {/* Image/Icon */}
      <SkeletonItem className="h-12 w-12 rounded-lg" animate={animate} />

      {/* Title */}
      <SkeletonItem className="h-5 w-2/3" animate={animate} />

      {/* Description */}
      <div className="space-y-2">
        <SkeletonItem className="h-4 w-full" animate={animate} />
        <SkeletonItem className="h-4 w-5/6" animate={animate} />
      </div>

      {/* Action button */}
      <SkeletonItem className="h-8 w-20 rounded" animate={animate} />
    </div>
  </div>
);

const ListItemSkeleton: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="flex items-center space-x-4 p-4">
    {/* Avatar/Icon */}
    <SkeletonItem className="h-10 w-10 rounded-full flex-shrink-0" animate={animate} />

    <div className="flex-1 space-y-2">
      {/* Title */}
      <SkeletonItem className="h-4 w-3/4" animate={animate} />

      {/* Subtitle */}
      <SkeletonItem className="h-3 w-1/2" animate={animate} />
    </div>

    {/* Action */}
    <SkeletonItem className="h-6 w-6 rounded" animate={animate} />
  </div>
);

const ProfileSkeleton: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
    <div className="text-center space-y-6">
      {/* Profile image */}
      <SkeletonItem className="h-32 w-32 rounded-full mx-auto" animate={animate} />

      {/* Name */}
      <SkeletonItem className="h-8 w-48 mx-auto" animate={animate} />

      {/* Title */}
      <SkeletonItem className="h-5 w-64 mx-auto" animate={animate} />

      {/* Bio */}
      <div className="space-y-3 max-w-md mx-auto">
        <SkeletonItem className="h-4 w-full" animate={animate} />
        <SkeletonItem className="h-4 w-5/6 mx-auto" animate={animate} />
        <SkeletonItem className="h-4 w-4/5 mx-auto" animate={animate} />
      </div>

      {/* Social links */}
      <div className="flex justify-center space-x-4">
        <SkeletonItem className="h-8 w-8 rounded" animate={animate} />
        <SkeletonItem className="h-8 w-8 rounded" animate={animate} />
        <SkeletonItem className="h-8 w-8 rounded" animate={animate} />
      </div>
    </div>
  </div>
);

const HeroSkeleton: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12">
    <div className="text-center space-y-8">
      {/* Main heading */}
      <div className="space-y-4">
        <SkeletonItem className="h-12 w-3/4 mx-auto" animate={animate} />
        <SkeletonItem className="h-12 w-1/2 mx-auto" animate={animate} />
      </div>

      {/* Subtitle */}
      <div className="space-y-3 max-w-2xl mx-auto">
        <SkeletonItem className="h-5 w-full" animate={animate} />
        <SkeletonItem className="h-5 w-4/5 mx-auto" animate={animate} />
      </div>

      {/* CTA buttons */}
      <div className="flex justify-center space-x-4">
        <SkeletonItem className="h-12 w-32 rounded-lg" animate={animate} />
        <SkeletonItem className="h-12 w-28 rounded-lg" animate={animate} />
      </div>

      {/* Stats or features */}
      <div className="flex justify-center space-x-12 mt-12">
        {[1, 2, 3].map(i => (
          <div key={i} className="text-center space-y-2">
            <SkeletonItem className="h-8 w-16 mx-auto" animate={animate} />
            <SkeletonItem className="h-4 w-20 mx-auto" animate={animate} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SkeletonScreen: React.FC<SkeletonScreenProps> = ({
  variant = 'card',
  count = 1,
  className = '',
  animate = true,
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'blog':
        return <BlogPostSkeleton animate={animate} />;
      case 'card':
        return <CardSkeleton animate={animate} />;
      case 'list':
        return <ListItemSkeleton animate={animate} />;
      case 'profile':
        return <ProfileSkeleton animate={animate} />;
      case 'hero':
        return <HeroSkeleton animate={animate} />;
      default:
        return <CardSkeleton animate={animate} />;
    }
  };

  return (
    <div className={`${className}`} role="status" aria-label="로딩 중...">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
      <span className="sr-only">콘텐츠를 불러오는 중입니다...</span>
    </div>
  );
};

export default SkeletonScreen;
