import React, { useState, useEffect } from 'react';

const ScrollProgress = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            setScrollProgress((currentScroll / totalScroll) * 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-50">
            <div
                className="h-full bg-indigo-600 transition-all duration-200"
                style={{ width: `${scrollProgress}%` }}
                role="progressbar"
                aria-valuenow={scrollProgress}
                aria-valuemin="0"
                aria-valuemax="100"
            />
        </div>
    );
};

export default ScrollProgress;
