import React from 'react';

const Section = ({ 
    children, 
    title, 
    subtitle, 
    className = '', 
    containerClassName = '',
    titleClassName = '',
    subtitleClassName = '',
    centered = false,
    id,
    bgColor = 'white',
    padding = 'normal'
}) => {
    // 배경색 변형
    const bgColors = {
        white: 'bg-white',
        gray: 'bg-gray-50',
        dark: 'bg-gray-900 text-white',
        transparent: 'bg-transparent'
    };

    // 패딩 변형
    const paddings = {
        none: 'py-0',
        small: 'py-12 sm:py-16',
        normal: 'py-16 sm:py-20 lg:py-24',
        large: 'py-24 sm:py-32 lg:py-40'
    };

    return (
        <section 
            id={id}
            className={`
                ${bgColors[bgColor]} 
                ${paddings[padding]} 
                relative overflow-hidden
                ${className}
            `}
        >
            <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
                {(title || subtitle) && (
                    <div className={`mb-12 sm:mb-16 ${centered ? 'text-center' : ''}`}>
                        {subtitle && (
                            <span className={`
                                text-sm font-semibold tracking-wide uppercase mb-4 block
                                ${bgColor === 'dark' ? 'text-gray-300' : 'text-gray-500'}
                                ${subtitleClassName}
                            `}>
                                {subtitle}
                            </span>
                        )}
                        {title && (
                            <h2 className={`
                                text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 relative
                                ${bgColor === 'dark' ? 'text-white' : 'text-gray-900'}
                                ${titleClassName}
                            `}>
                                {title}
                                {centered && (
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gray-900 rounded-full"></div>
                                )}
                            </h2>
                        )}
                    </div>
                )}
                {children}
            </div>
        </section>
    );
};

export default Section;