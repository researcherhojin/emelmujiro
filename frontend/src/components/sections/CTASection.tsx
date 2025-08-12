import React, { memo } from 'react';

const CTASection: React.FC = memo(() => {
  return (
    <section className="py-32 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 md:p-20 text-center shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-6">
            GET STARTED
          </h2>
          <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-8">
            프로젝트를 시작할 준비가 되셨나요?
          </h3>

          <p className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            AI 전문가와 함께 귀사의 비즈니스 문제를 해결하세요
          </p>

          <a
            href="#/contact"
            className="inline-flex items-center justify-center px-12 py-6 text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-2xl"
            aria-label="프로젝트 문의하기"
          >
            프로젝트 문의하기 →
          </a>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              이메일로 직접 문의하실 수 있습니다:
              <a
                href="mailto:researcherhojin@gmail.com"
                className="font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ml-1 underline"
              >
                researcherhojin@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

export default CTASection;
