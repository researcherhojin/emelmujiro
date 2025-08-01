import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    to, 
    href,
    onClick,
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'right',
    className = '',
    ...props 
}) => {
    // 스타일 변형
    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
        secondary: 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
        outline: 'bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600'
    };

    // 크기 변형
    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    // 기본 클래스
    const baseClasses = `
        inline-flex items-center justify-center
        font-semibold rounded-lg
        transition-all duration-200
        shadow-md hover:shadow-lg
        hover:scale-105 active:scale-100
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${fullWidth ? 'w-full' : ''}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
    `;

    // 아이콘 렌더링
    const renderIcon = () => {
        if (!icon) return null;
        return (
            <span className={iconPosition === 'left' ? 'mr-2' : 'ml-2'}>
                {icon}
            </span>
        );
    };

    // 콘텐츠 렌더링
    const content = (
        <>
            {iconPosition === 'left' && renderIcon()}
            {children}
            {iconPosition === 'right' && renderIcon()}
        </>
    );

    // Link 컴포넌트로 렌더링
    if (to) {
        return (
            <Link to={to} className={baseClasses} {...props}>
                {content}
            </Link>
        );
    }

    // 외부 링크로 렌더링
    if (href) {
        return (
            <a 
                href={href} 
                className={baseClasses} 
                target="_blank" 
                rel="noopener noreferrer"
                {...props}
            >
                {content}
            </a>
        );
    }

    // 일반 버튼으로 렌더링
    return (
        <button 
            className={baseClasses} 
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {content}
        </button>
    );
};

export default Button;