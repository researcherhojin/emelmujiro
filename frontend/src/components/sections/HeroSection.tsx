import React, { memo } from 'react';

const HeroSection: React.FC = memo(() => {
  return (
    <section className="relative min-h-screen flex items-center bg-white dark:bg-gray-900">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="text-left">
            {/* Simple badge */}
            <div className="mb-10">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
                AI EDUCATION & CONSULTING
              </span>
            </div>

            {/* Main Headline - Typography focused */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-10 leading-[1.05] tracking-tight">
              <span className="block text-gray-900 dark:text-white">실무에 강한</span>
              <span className="block text-gray-900 dark:text-white mt-3">AI 전문가 그룹</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-xl font-medium">
              대기업 AI 교육부터 스타트업 기술 컨설팅까지,
              <br />
              맞춤형 솔루션으로 비즈니스 성장을 가속화합니다.
            </p>

            {/* CTA Button - Single */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#/contact"
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-2xl"
              >
                프로젝트 문의하기 →
              </a>
            </div>
          </div>

          {/* Right content - Simple Stats */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3">
                  1,000+
                </div>
                <div className="text-base font-semibold text-gray-600 dark:text-gray-400">
                  누적 수강생
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3">
                  50+
                </div>
                <div className="text-base font-semibold text-gray-600 dark:text-gray-400">
                  완료 프로젝트
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3">
                  30+
                </div>
                <div className="text-base font-semibold text-gray-600 dark:text-gray-400">
                  협력사 기업
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3">
                  98%
                </div>
                <div className="text-base font-semibold text-gray-600 dark:text-gray-400">
                  고객 만족도
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-center">
              <span className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-full">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Since 2022 • 4년의 검증된 전문성
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
