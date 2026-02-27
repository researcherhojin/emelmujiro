import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PageLoading: React.FC = memo(() => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div
          className="inline-block animate-spin rounded-full h-16 w-16 border-4
                    border-solid border-gray-900 border-r-transparent mb-4"
        ></div>
        <p className="text-gray-600">{t('common.pageLoading')}</p>
      </motion.div>
    </div>
  );
});

PageLoading.displayName = 'PageLoading';

export default PageLoading;
