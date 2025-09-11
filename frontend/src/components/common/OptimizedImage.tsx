import React, { useState, useEffect } from 'react';
import LazyImage from './LazyImage';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  srcSet?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  sizes,
  srcSet,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isWebPSupported, setIsWebPSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check WebP support
    const checkWebPSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const isSupported =
          canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
        setIsWebPSupported(isSupported);
      } catch {
        // If canvas operations fail, default to no WebP support
        setIsWebPSupported(false);
      }
    };

    checkWebPSupport();
  }, []);

  useEffect(() => {
    // Generate optimized image URL based on device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    let optimizedSrc = src;

    // If the image is from a CDN that supports image optimization
    if (src.includes('unsplash.com') || src.includes('pexels.com')) {
      const quality = devicePixelRatio > 1 ? 85 : 90;
      const format = isWebPSupported ? 'webp' : 'auto';

      // Add optimization parameters for common image CDNs
      if (src.includes('unsplash.com')) {
        optimizedSrc = `${src}&q=${quality}&fm=${format}`;
        if (width) optimizedSrc += `&w=${width * devicePixelRatio}`;
        if (height) optimizedSrc += `&h=${height * devicePixelRatio}`;
      }
    }

    setImageSrc(optimizedSrc);
  }, [src, width, height, isWebPSupported]);

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (srcSet) return srcSet;

    if (!width || !src.includes('unsplash.com')) return undefined;

    const widths = [320, 640, 768, 1024, 1280, 1536];
    return widths
      .filter((w) => w <= width * 2)
      .map((w) => `${src}&w=${w} ${w}w`)
      .join(', ');
  };

  // Generate sizes attribute for responsive images
  const generateSizes = () => {
    if (sizes) return sizes;

    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  // Don't render if src is empty
  if (!imageSrc) {
    return null;
  }

  if (loading === 'lazy') {
    return (
      <LazyImage
        src={imageSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        srcSet={generateSrcSet()}
        sizes={generateSizes()}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      srcSet={generateSrcSet()}
      sizes={generateSizes()}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

export default OptimizedImage;
