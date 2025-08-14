import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SEOHelmet from './SEOHelmet';
import StructuredData from './StructuredData';

const NotFound: React.FC = memo(() => {
  const navigate = useNavigate();

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleGoBack = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <>
      <SEOHelmet
        title="페이지를 찾을 수 없습니다"
        description="요청하신 페이지를 찾을 수 없습니다. 에멜무지로 홈페이지로 돌아가시거나 다른 페이지를 탐색해보세요."
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
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            죄송합니다. 요청하신 페이지가 존재하지 않거나 이동되었을 수
            있습니다.
          </p>
          <p className="text-base text-gray-500">
            URL을 다시 확인하시거나, 아래 버튼을 통해 다른 페이지로
            이동해보세요.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button
            onClick={handleGoHome}
            className="group flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105"
            aria-label="홈페이지로 이동"
          >
            <Home size={20} />
            홈페이지로 이동
          </button>

          <button
            onClick={handleGoBack}
            className="group flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:scale-105"
            aria-label="이전 페이지로 돌아가기"
          >
            <ArrowLeft size={20} />
            이전 페이지로
          </button>
        </div>

        {/* Helpful Links */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            주요 페이지 바로가기
          </h3>
          <nav
            className="flex flex-wrap justify-center gap-4"
            aria-label="주요 페이지 링크"
          >
            <button
              onClick={() => navigate('/about')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              aria-label="회사소개 페이지로 이동"
            >
              회사소개
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              aria-label="대표 프로필 페이지로 이동"
            >
              대표 프로필
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate('/contact')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              aria-label="문의하기 페이지로 이동"
            >
              문의하기
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate('/blog')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              aria-label="블로그 페이지로 이동"
            >
              블로그
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
