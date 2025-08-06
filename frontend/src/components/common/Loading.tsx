import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
    message?: string;
    isFullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = memo(({ message = 'Loading...', isFullScreen = false }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${isFullScreen ? 'min-h-screen' : ''}`}>
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
            />
            <p className="mt-4 text-gray-600">{message}</p>
        </div>
    );
});

Loading.displayName = 'Loading';

export default Loading;