import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    placeholderClassName?: string;
    onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    threshold?: number;
    rootMargin?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
    src, 
    alt, 
    className = '', 
    placeholderClassName = '',
    onLoad,
    onError,
    threshold = 0.1,
    rootMargin = '50px',
    ...props 
}) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const imageElement = imgRef.current;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setImageSrc(src);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold,
                rootMargin
            }
        );

        if (imageElement) {
            observer.observe(imageElement);
        }

        return () => {
            if (imageElement) {
                observer.unobserve(imageElement);
            }
        };
    }, [src, threshold, rootMargin]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setImageLoaded(true);
        if (onLoad) onLoad(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setHasError(true);
        if (onError) onError(e);
    };

    return (
        <div ref={imgRef} className="relative">
            {/* Placeholder */}
            {!imageLoaded && !hasError && (
                <div 
                    className={`absolute inset-0 bg-gray-100 animate-pulse ${placeholderClassName}`}
                    aria-hidden="true"
                />
            )}
            
            {/* Error state */}
            {hasError && (
                <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                    </svg>
                </div>
            )}
            
            {/* Actual image */}
            {imageSrc && !hasError && (
                <img
                    src={imageSrc}
                    alt={alt}
                    className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                    {...props}
                />
            )}
        </div>
    );
};

export default LazyImage;