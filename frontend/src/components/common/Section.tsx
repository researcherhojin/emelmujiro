import React, { memo, ReactNode } from 'react';

type BgColor = 'white' | 'gray' | 'dark' | 'transparent';
type Padding = 'none' | 'small' | 'normal' | 'large';

interface SectionProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    containerClassName?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    centered?: boolean;
    id?: string;
    bgColor?: BgColor;
    padding?: Padding;
}

const Section: React.FC<SectionProps> = memo(({ 
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
    const bgColors: Record<BgColor, string> = {
        white: 'bg-white',
        gray: 'bg-gray-50',
        dark: 'bg-gray-900 text-white',
        transparent: 'bg-transparent'
    };

    const paddings: Record<Padding, string> = {
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
});

Section.displayName = 'Section';

export default Section;