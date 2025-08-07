import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  SkeletonHero,
  SkeletonServices,
  SkeletonBlogList,
  SkeletonForm,
  SkeletonCard,
} from './SkeletonLoader';

// 통합된 로딩 타입
export type LoadingVariant =
  | 'spinner' // 기본 스피너
  | 'page' // 페이지 로딩 (전체 화면)
  | 'inline' // 인라인 로딩 (작은 크기)
  | 'skeleton-hero' // Hero 스켈레톤
  | 'skeleton-services' // Services 스켈레톤
  | 'skeleton-blog' // Blog 스켈레톤
  | 'skeleton-form' // Form 스켈레톤
  | 'skeleton-card' // Card 스켈레톤
  | 'dots' // 점 애니메이션
  | 'pulse'; // 펄스 애니메이션

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
    // 크기 매핑
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20',
    };

    // 색상 매핑
    const colorClasses = {
      indigo: 'border-indigo-600',
      blue: 'border-blue-600',
      gray: 'border-gray-600',
      green: 'border-green-600',
    };

    // 전체 화면 래퍼
    const FullScreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      if (fullScreen || variant === 'page') {
        return (
          <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
            {children}
          </div>
        );
      }
      return <>{children}</>;
    };

    // 스켈레톤 로더 렌더링
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

    // 점 애니메이션
    if (variant === 'dots') {
      return (
        <FullScreenWrapper>
          <div className={`flex items-center justify-center space-x-2 ${className}`}>
            {[0, 1, 2].map(index => (
              <motion.div
                key={index}
                className={`w-3 h-3 bg-${color}-600 rounded-full`}
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

    // 펄스 애니메이션
    if (variant === 'pulse') {
      return (
        <FullScreenWrapper>
          <div className={`flex flex-col items-center justify-center ${className}`}>
            <motion.div
              className={`${sizeClasses[size]} bg-${color}-600 rounded-full`}
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

    // 인라인 로딩
    if (variant === 'inline') {
      return (
        <span className={`inline-flex items-center ${className}`}>
          <motion.span
            className={`inline-block w-4 h-4 border-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo} border-t-transparent rounded-full`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          {message && <span className="ml-2 text-sm text-gray-600">{message}</span>}
        </span>
      );
    }

    // 기본 스피너 (spinner, page)
    return (
      <FullScreenWrapper>
        <div className={`flex flex-col items-center justify-center ${className}`}>
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

// 편의를 위한 프리셋 컴포넌트들
export const PageLoading: React.FC<{ message?: string }> = ({
  message = '페이지를 불러오는 중...',
}) => <UnifiedLoading variant="page" message={message} />;

export const InlineLoading: React.FC<{ message?: string }> = ({ message }) => (
  <UnifiedLoading variant="inline" message={message} size="sm" />
);

export const ButtonLoading: React.FC = () => (
  <UnifiedLoading variant="inline" size="sm" color="white" />
);

export default UnifiedLoading;
