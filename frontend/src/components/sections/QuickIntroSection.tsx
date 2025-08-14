import React, { memo } from 'react';

const QuickIntroSection: React.FC = memo(() => {
  const differentiators = [
    {
      number: '01',
      title: 'AI 컨설팅',
      description: '비즈니스 문제에 대한 실용적 AI 솔루션',
    },
    {
      number: '02',
      title: '기업 AI 교육',
      description: '실무자를 위한 체계적인 AI 역량 강화',
    },
    {
      number: '03',
      title: 'LLM 솔루션',
      description: '최신 언어 모델 기반 비즈니스 혁신',
    },
    {
      number: '04',
      title: '데이터 분석',
      description: '비즈니스 인사이트 도출을 위한 분석',
    },
  ];

  return (
    <section className="py-32 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Content */}
          <div>
            <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">
              WHAT WE DO
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12">
              주요 서비스
            </h2>

            <div className="space-y-8">
              {differentiators.map((item) => (
                <div key={item.number} className="flex gap-6 items-start">
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-600">
                    {item.number}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Empty for balance */}
          <div>{/* Spacer for layout balance */}</div>
        </div>
      </div>
    </section>
  );
});

QuickIntroSection.displayName = 'QuickIntroSection';

export default QuickIntroSection;
