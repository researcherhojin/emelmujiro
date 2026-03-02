import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UnderConstructionProps {
  featureKey?: 'blog' | 'contact' | 'chat';
}

const UnderConstruction: React.FC<UnderConstructionProps> = memo(
  ({ featureKey }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleGoHome = useCallback(() => {
      navigate('/');
    }, [navigate]);

    const handleGoBack = useCallback(() => {
      window.history.back();
    }, []);

    const featureDescription = featureKey
      ? t(`underConstruction.features.${featureKey}`)
      : t('underConstruction.description');

    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8 pt-20">
        {/* Icon */}
        <div className="text-center mb-8">
          <Construction
            size={80}
            className="text-gray-900 dark:text-white mx-auto mb-4"
            aria-hidden="true"
          />
          <div className="w-24 h-1 bg-gray-900 dark:bg-white mx-auto mb-8 rounded-full"></div>
        </div>

        {/* Message */}
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('underConstruction.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {featureDescription}
          </p>
          <p className="text-base text-gray-500 dark:text-gray-400">
            {t('underConstruction.comingSoon')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGoHome}
            className="group flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 hover:scale-105"
            aria-label={t('underConstruction.goHome')}
          >
            <Home size={20} />
            {t('underConstruction.goHome')}
          </button>

          <button
            onClick={handleGoBack}
            className="group flex items-center gap-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300 hover:scale-105"
            aria-label={t('underConstruction.goBack')}
          >
            <ArrowLeft size={20} />
            {t('underConstruction.goBack')}
          </button>
        </div>
      </main>
    );
  }
);

UnderConstruction.displayName = 'UnderConstruction';

export default UnderConstruction;
