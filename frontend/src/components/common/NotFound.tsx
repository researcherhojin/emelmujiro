import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHelmet from './SEOHelmet';
import StructuredData from './StructuredData';

const NotFound: React.FC = memo(() => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleGoBack = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <>
      <SEOHelmet
        title={t('notFound.title')}
        description={t('notFound.description')}
        url="https://researcherhojin.github.io/emelmujiro/404"
        type="website"
      />
      <StructuredData type="Website" />

      <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
        {/* Error Code */}
        <div className="text-center mb-8">
          <h1 className="text-8xl sm:text-9xl font-black text-gray-900 mb-4 tracking-tight">
            404
          </h1>
          <div className="w-24 h-1 bg-gray-900 mx-auto mb-8 rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-12 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {t('notFound.title')}
          </h2>
          <p className="text-lg text-gray-600 whitespace-pre-line">
            {t('notFound.description')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button
            onClick={handleGoHome}
            className="group flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105"
            aria-label={t('notFound.goHome')}
          >
            <Home size={20} />
            {t('notFound.goHome')}
          </button>

          <button
            onClick={handleGoBack}
            className="group flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:scale-105"
            aria-label={t('notFound.goBack')}
          >
            <ArrowLeft size={20} />
            {t('notFound.goBack')}
          </button>
        </div>

        {/* Helpful Links */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('notFound.popularPages')}
          </h3>
          <nav
            className="flex flex-wrap justify-center gap-4"
            aria-label={t('notFound.popularPages')}
          >
            <button
              onClick={() => navigate('/about')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {t('common.about')}
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {t('common.representativeProfile')}
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate('/contact')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {t('common.contact')}
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate('/blog')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {t('common.blog')}
            </button>
          </nav>
        </div>

        {/* Decorative Element */}
        <div
          className="absolute top-0 left-0 w-1/3 h-full bg-gray-50 -z-10"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gray-50 -z-10"
          aria-hidden="true"
        ></div>
      </main>
    </>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
