import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowRight } from 'lucide-react';
import SEOHelmet from '../common/SEOHelmet';

const BlogListPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <SEOHelmet
        title={t('blog.seo.title')}
        description={t('blog.seo.description')}
        url="https://researcherhojin.github.io/emelmujiro/blog"
      />

      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Construction className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 animate-pulse" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6">
            {t('blog.preparing')}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            {t('blog.preparingSubtitle')}
          </p>

          <p className="text-base text-gray-500 dark:text-gray-500 mb-12">
            {t('blog.preparingDescription')}
          </p>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-8 py-4 text-base font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-xl"
          >
            {t('blog.backToMain')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </>
  );
});

BlogListPage.displayName = 'BlogListPage';

export default BlogListPage;
