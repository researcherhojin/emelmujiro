import React from 'react';

const Card = ({ children, className = '', hover = true, padding = 'p-8', ...props }) => {
    const baseClasses = `
        bg-white 
        border-2 border-gray-200 
        rounded-2xl 
        transition-all 
        duration-300
        ${padding}
    `;
    
    const hoverClasses = hover ? `
        hover:border-gray-300 
        hover:shadow-xl 
        hover:-translate-y-1
        cursor-pointer
    ` : '';
    
    return (
        <div 
            className={`${baseClasses} ${hoverClasses} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;