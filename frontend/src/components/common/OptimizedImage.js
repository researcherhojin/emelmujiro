import React, { useState } from 'react';
import { motion } from 'framer-motion';

const OptimizedImage = ({ 
    src, 
    alt, 
    className = '', 
    loading = 'lazy',
    sizes = '100vw',
    onLoad,
    onError,
    placeholder = '/placeholder.jpg'
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = (e) => {
        setIsLoading(false);
        if (onLoad) onLoad(e);
    };

    const handleError = (e) => {
        setHasError(true);
        setIsLoading(false);
        if (onError) onError(e);
    };

    // Generate srcSet for responsive images
    const generateSrcSet = () => {
        if (!src) return '';
        
        // For demo purposes, we're assuming the server can handle different sizes
        // In production, you'd want to use a proper image CDN
        const baseName = src.substring(0, src.lastIndexOf('.'));
        const extension = src.substring(src.lastIndexOf('.'));
        
        return `
            ${baseName}-400w${extension} 400w,
            ${baseName}-800w${extension} 800w,
            ${baseName}-1200w${extension} 1200w
        `;
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-200 animate-pulse"
                />
            )}
            
            <motion.img
                src={hasError ? placeholder : src}
                alt={alt}
                className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} 
                    transition-opacity duration-300`}
                loading={loading}
                sizes={sizes}
                srcSet={!hasError ? generateSrcSet() : ''}
                onLoad={handleLoad}
                onError={handleError}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.3 }}
            />
        </div>
    );
};

export default React.memo(OptimizedImage);