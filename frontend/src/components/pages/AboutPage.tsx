import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHelmet from '../common/SEOHelmet';
import { Target, Users, Lightbulb, TrendingUp } from 'lucide-react';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface CompanyValue {
  title: string;
  description: string;
  icon: React.ElementType;
}

const AboutPage: React.FC = memo(() => {
  const navigate = useNavigate();

  const timeline: TimelineItem[] = [
    {
      year: '2022',
      title: 'AI 교육 시작',
      description:
        '모두의연구소, 한글과컴퓨터에서 서울대, 서울시립대, LG전자 등 대학/기업 AI 교육 시작',
    },
    {
      year: '2023',
      title: '교육 확대',
      description:
        '삼성전자, 현대건설, LG전자, 카카오 등 대기업 AI/ML 교육 프로젝트 수행',
    },
    {
      year: '2024',
      title: '전문화 및 창업',
      description:
        '멋쟁이사자처럼 AI 과정 전문 강사 활동, 12월 에멜무지로 설립',
    },
    {
      year: '2025',
      title: '지속적 성장',
      description: '산업전문인력 AI역량강화 교육 및 기업 맞춤형 교육 확대',
    },
  ];

  const companyValues: CompanyValue[] = [
    {
      title: '실무 중심 교육',
      description:
        '이론과 실습을 균형있게 구성하여 현업에서 바로 활용 가능한 실무 적용 교육',
      icon: Target,
    },
    {
      title: '맞춤형 커리큘럼',
      description:
        '고객사의 수준과 목표에 맞춰 설계된 단계별 맞춤 교육 프로그램',
      icon: Users,
    },
    {
      title: '최신 기술 활용',
      description: 'ChatGPT, Claude 등 최신 AI 도구 활용법 실습 교육',
      icon: Lightbulb,
    },
    {
      title: '지속적인 성장',
      description: '교육 후에도 지속적인 학습과 피드백 제공',
      icon: TrendingUp,
    },
  ];

  return (
    <>
      <SEOHelmet
        title="회사 소개 | 에멜무지로"
        description="AI 교육과 컨설팅 전문 기업 에멜무지로를 소개합니다. 실무 중심의 AI 솔루션을 제공합니다."
        url="https://researcherhojin.github.io/emelmujiro/about"
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
                ABOUT US
              </span>
              <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
                에멜무지로
              </h1>
              <p className="mt-6 text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                AI 교육과 솔루션 개발 전문 스타트업
              </p>
            </div>

            {/* Mission Statement */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-12 md:p-16 text-center mb-20">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6">
                우리의 미션
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                에멜무지로는 2024년 12월에 설립된 AI 교육 및 컨설팅 전문
                기업입니다.
                <br />
                실무 중심의 AI 교육과 맞춤형 솔루션 개발을 통해
                <br />
                고객사의 디지털 혁신을 지원하고 함께 성장하는 파트너가
                되겠습니다.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
                OUR JOURNEY
              </span>
              <h2 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
                우리의 여정
              </h2>
              <p className="mt-6 text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                AI 교육 전문가로 성장해온 발자취
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[50px] md:left-[120px] top-0 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-700"></div>

              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-8 md:gap-12 items-start group relative"
                  >
                    {/* Year */}
                    <div className="flex-shrink-0 w-[100px] md:w-[100px] text-right">
                      <div className="text-2xl md:text-3xl font-black text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {item.year}
                      </div>
                    </div>

                    {/* Timeline Dot */}
                    <div className="absolute left-[44px] md:left-[114px] top-2 w-3 h-3 bg-gray-400 dark:bg-gray-600 group-hover:bg-gray-900 dark:group-hover:bg-white rounded-full ring-4 ring-white dark:ring-gray-950 shadow-lg z-10 transition-colors"></div>

                    {/* Content Card */}
                    <div className="flex-grow bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-gray-900 dark:group-hover:border-white transition-all">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {item.title}
                      </h3>
                      <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
                CORE VALUES
              </span>
              <h2 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
                핵심 가치
              </h2>
              <p className="mt-6 text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                에멜무지로가 추구하는 4가지 핵심 가치입니다
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => {
                const Icon = value.icon;
                const displayNumber = String(index + 1).padStart(2, '0');
                return (
                  <div
                    key={index}
                    className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                      <span className="text-4xl font-black text-gray-200 dark:text-gray-700 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                        {displayNumber}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {value.title}
                    </h3>

                    <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Achievement Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-12 text-center">
              주요 성과
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  1,000+
                </div>
                <p className="text-gray-600 dark:text-gray-400">누적 수강생</p>
              </div>
              <div>
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  50+
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  완료 프로젝트
                </p>
              </div>
              <div>
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  30+
                </div>
                <p className="text-gray-600 dark:text-gray-400">협력사 기업</p>
              </div>
              <div>
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  98%
                </div>
                <p className="text-gray-600 dark:text-gray-400">고객 만족도</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6">
              함께 성장할 준비가 되셨나요?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              AI 혁신의 파트너, 에멜무지로와 함께하세요
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center px-10 py-5 text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-2xl"
            >
              프로젝트 문의하기 →
            </button>
          </div>
        </section>
      </div>
    </>
  );
});

AboutPage.displayName = 'AboutPage';

export default AboutPage;
