import React, { memo } from 'react';
import { motion } from 'framer-motion';

const PageLoading: React.FC = memo(() => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
            >
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 
                    border-solid border-gray-900 border-r-transparent mb-4"></div>
                <p className="text-gray-600">페이지를 불러오는 중...</p>
            </motion.div>
        </div>
    );
});

PageLoading.displayName = 'PageLoading';

export default PageLoading;