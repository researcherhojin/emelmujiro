import React, { memo } from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerColor = 'gray' | 'white' | 'primary';

interface LoadingSpinnerProps {
    size?: SpinnerSize;
    color?: SpinnerColor;
    fullScreen?: boolean;
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ 
    size = 'md', 
    color = 'gray', 
    fullScreen = false,
    message = '로딩 중...'
}) => {
    const sizes: Record<SpinnerSize, string> = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    const colors: Record<SpinnerColor, string> = {
        gray: 'border-gray-900',
        white: 'border-white',
        primary: 'border-indigo-600'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center">
            <div className={`
                ${sizes[size]} 
                border-4 border-gray-200 
                ${colors[color]} 
                border-t-transparent 
                rounded-full 
                animate-spin
            `}></div>
            {message && (
                <p className={`mt-4 text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;