import React from 'react';

// Simple skeleton components for loading states
export const SkeletonHero: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
  </div>
);

export const SkeletonServices: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
  </div>
);

export const SkeletonBlogList: React.FC = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    ))}
  </div>
);

export const SkeletonForm: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
  </div>
);
