import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ImageOptimizedProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  srcSet?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Optimized Image Component with WebP support and lazy loading
 */
export const ImageOptimized = memo<ImageOptimizedProps>(
  ({
    src,
    alt,
    width,
    height,
    className = '',
    loading = 'lazy',
    priority = false,
    placeholder = 'blur',
    blurDataURL,
    onLoad,
    onError,
    sizes,
    srcSet,
    objectFit = 'cover',
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate WebP source if not provided
    const webpSrc = useMemo(() => {
      if (src.endsWith('.webp')) return src;
      return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }, [src]);

    // Generate srcSet for responsive images
    const responsiveSrcSet = useMemo(() => {
      if (srcSet) return srcSet;

      const baseSrc = src.replace(/\.\w+$/, '');
      const ext = src.match(/\.\w+$/)?.[0] || '.jpg';

      return `
      ${baseSrc}-400w${ext} 400w,
      ${baseSrc}-800w${ext} 800w,
      ${baseSrc}-1200w${ext} 1200w,
      ${baseSrc}${ext} 1600w
    `.trim();
    }, [src, srcSet]);

    // Generate sizes attribute for responsive images
    const responsiveSizes = useMemo(() => {
      if (sizes) return sizes;

      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    }, [sizes]);

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (priority || loading === 'eager') {
        setIsInView(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.01,
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, [priority, loading]);

    const handleLoad = () => {
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      setIsLoaded(true);
      onError?.();
    };

    // Default blur placeholder
    const defaultBlurDataURL =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg==';

    const containerStyles = useMemo(
      () => ({
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        position: 'relative' as const,
        overflow: 'hidden',
      }),
      [width, height]
    );

    const imageClasses = useMemo(() => {
      return `
      ${className}
      ${!isLoaded ? 'opacity-0' : 'opacity-100'}
      transition-opacity duration-300
      ${objectFit === 'cover' ? 'object-cover' : ''}
      ${objectFit === 'contain' ? 'object-contain' : ''}
      ${objectFit === 'fill' ? 'object-fill' : ''}
      ${objectFit === 'none' ? 'object-none' : ''}
      ${objectFit === 'scale-down' ? 'object-scale-down' : ''}
    `.trim();
    }, [className, isLoaded, objectFit]);

    return (
      <div ref={containerRef} style={containerStyles} className="relative">
        {/* Placeholder */}
        {placeholder === 'blur' && !isLoaded && (
          <div
            className="absolute inset-0 bg-gray-200"
            style={{
              backgroundImage: `url(${blurDataURL || defaultBlurDataURL})`,
              backgroundSize: 'cover',
              filter: 'blur(20px)',
              transform: 'scale(1.1)',
            }}
          />
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500">Failed to load image</p>
            </div>
          </div>
        )}

        {/* Main image with picture element for WebP support */}
        {isInView && !hasError && (
          <picture>
            {/* WebP source */}
            <source
              type="image/webp"
              srcSet={webpSrc}
              sizes={responsiveSizes}
            />

            {/* Original format fallback */}
            <motion.img
              ref={imgRef}
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={imageClasses}
              loading={priority ? 'eager' : 'lazy'}
              onLoad={handleLoad}
              onError={handleError}
              sizes={responsiveSizes}
              srcSet={responsiveSrcSet}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </picture>
        )}

        {/* Loading skeleton */}
        {!isLoaded && !hasError && placeholder !== 'blur' && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }
);

ImageOptimized.displayName = 'ImageOptimized';

// Image Gallery Component with optimization
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: 1 | 2 | 3 | 4;
  gap?: number;
  className?: string;
}

export const ImageGallery = memo<ImageGalleryProps>(
  ({ images, columns = 3, gap = 4, className = '' }) => {
    const gridClasses = useMemo(() => {
      const columnClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      };

      return `grid ${columnClasses[columns]} gap-${gap} ${className}`;
    }, [columns, gap, className]);

    return (
      <div className={gridClasses}>
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative group overflow-hidden rounded-lg"
          >
            <ImageOptimized
              src={image.src}
              alt={image.alt}
              className="w-full h-full"
              objectFit="cover"
            />

            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  }
);

ImageGallery.displayName = 'ImageGallery';

// Background Image Component with optimization
interface BackgroundImageProps {
  src: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  parallax?: boolean;
}

export const BackgroundImage = memo<BackgroundImageProps>(
  ({
    src,
    alt = 'Background image',
    children,
    className = '',
    overlay = false,
    overlayOpacity = 0.5,
    parallax = false,
  }) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
      if (!parallax) return;

      const handleScroll = () => {
        setOffset(window.pageYOffset * 0.5);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [parallax]);

    const containerClasses = useMemo(() => {
      return `relative overflow-hidden ${className}`;
    }, [className]);

    const imageStyles = useMemo(
      () => ({
        transform: parallax ? `translateY(${offset}px)` : undefined,
      }),
      [parallax, offset]
    );

    return (
      <div className={containerClasses}>
        <div className="absolute inset-0" style={imageStyles}>
          <ImageOptimized
            src={src}
            alt={alt}
            className="w-full h-full"
            objectFit="cover"
            priority
          />
        </div>

        {overlay && (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        )}

        {children && <div className="relative z-10">{children}</div>}
      </div>
    );
  }
);

BackgroundImage.displayName = 'BackgroundImage';

export default ImageOptimized;
