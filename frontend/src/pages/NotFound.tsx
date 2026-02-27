import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoBack = () => {
    navigate(-1);
  };

  const popularPages = [
    { name: t('common.home'), path: '/' },
    { name: t('common.about'), path: '/about' },
    { name: t('common.services'), path: '/services' },
    { name: t('common.blog'), path: '/blog' },
    { name: t('common.contact'), path: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* 404 숫자 애니메이션 */}
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="mb-8"
          >
            <h1 className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              404
            </h1>
          </motion.div>

          {/* 에러 메시지 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {t('notFound.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('notFound.description')}
            </p>
          </motion.div>

          {/* 액션 버튼들 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all hover:shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('notFound.goBack')}
            </button>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              {t('notFound.goHome')}
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all hover:shadow-lg"
            >
              <HelpCircle className="w-5 h-5" />
              {t('notFound.help')}
            </Link>
          </motion.div>

          {/* 인기 페이지 제안 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              {t('notFound.popularPages')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {popularPages.map((page, index) => (
                <motion.div
                  key={page.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Link
                    to={page.path}
                    className="block px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 transition-colors text-center"
                  >
                    {page.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 일러스트레이션 (선택적) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-gray-400"
          >
            <svg
              className="w-64 h-64 mx-auto"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
              <path
                d="M70 80 Q100 60 130 80"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="75" cy="90" r="5" fill="currentColor" />
              <circle cx="125" cy="90" r="5" fill="currentColor" />
              <path
                d="M80 130 Q100 115 120 130"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
