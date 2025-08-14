import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  SkeletonHero,
  SkeletonServices,
  SkeletonBlogList,
  SkeletonForm,
  SkeletonCard,
} from './SkeletonLoader';

type LoadingType = 'spinner' | 'hero' | 'services' | 'blog' | 'form' | 'card';

interface LoadingProps {
  message?: string;
  isFullScreen?: boolean;
  type?: LoadingType;
  className?: string;
}

const Loading: React.FC<LoadingProps> = memo(
  ({
    message = 'Loading...',
    isFullScreen = false,
    type = 'spinner',
    className = '',
  }) => {
    // Render skeleton loaders based on type
    switch (type) {
      case 'hero':
        return <SkeletonHero className={className} />;
      case 'services':
        return <SkeletonServices className={className} />;
      case 'blog':
        return <SkeletonBlogList className={className} />;
      case 'form':
        return <SkeletonForm className={className} />;
      case 'card':
        return <SkeletonCard className={className} />;
      case 'spinner':
      default:
        return (
          <div
            className={`flex flex-col items-center justify-center ${isFullScreen ? 'min-h-screen' : ''} ${className}`}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
            />
            <p className="mt-4 text-gray-600">{message}</p>
          </div>
        );
    }
  }
);

Loading.displayName = 'Loading';

export default Loading;
