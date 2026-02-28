import React, { useState, memo, useCallback } from 'react';
import {
  ChevronDown,
  Calendar,
  Building,
  Award,
  BookOpen,
  LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { TFunction } from 'i18next';

interface Activity {
  title: string;
  type: string;
  status: 'completed' | 'inProgress';
}

interface MonthData {
  [month: string]: Activity[];
}

interface YearData {
  title: string;
  role: string;
  company: string;
  location: string;
  description: string;
  highlights: string[];
  type: 'current' | 'education' | 'career';
  months: MonthData;
  summary?: string;
}

interface CareerData {
  [year: string]: YearData;
}

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface ActivityItemProps {
  activity: Activity;
  index: number;
  getActivityTypeColor: (type: string) => string;
  t: TFunction;
}

const ActivityItem: React.FC<ActivityItemProps> = memo(
  ({ activity, index, getActivityTypeColor, t }) => (
    <div key={index} className="border-l-4 border-gray-200 pl-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-gray-900 text-sm mb-1">
            {activity.title}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${getActivityTypeColor(activity.type)}`}
            >
              {t('career.types.' + activity.type)}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                activity.status === 'inProgress'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {t('career.status.' + activity.status)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
);

ActivityItem.displayName = 'ActivityItem';

interface MonthButtonProps {
  month: string;
  activities: Activity[];
  isActive: boolean;
  onToggle: () => void;
  getActivityTypeColor: (type: string) => string;
  t: TFunction;
}

const MonthButton: React.FC<MonthButtonProps> = memo(
  ({ month, activities, isActive, onToggle, getActivityTypeColor, t }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isActive}
        className={`w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border ${
          isActive ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
        }`}
      >
        <div className="font-medium text-gray-900 mb-1">{month}</div>
        <div className="text-sm text-gray-600">
          {activities.length}
          {t('career.activities')}
        </div>
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <div className="space-y-3">
              {activities.map((activity, actIndex) => (
                <ActivityItem
                  key={actIndex}
                  activity={activity}
                  index={actIndex}
                  getActivityTypeColor={getActivityTypeColor}
                  t={t}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
);

MonthButton.displayName = 'MonthButton';

interface YearCardProps {
  year: string;
  yearData: YearData;
  isExpanded: boolean;
  activeMonth: string | null;
  onToggleYear: () => void;
  onToggleMonth: (month: string) => void;
  getActivityTypeColor: (type: string) => string;
  t: TFunction;
}

const YearCard: React.FC<YearCardProps> = memo(
  ({
    year,
    yearData,
    isExpanded,
    activeMonth,
    onToggleYear,
    onToggleMonth,
    getActivityTypeColor,
    t,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Year Header */}
      <button
        className="w-full p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-inset"
        onClick={onToggleYear}
        aria-expanded={isExpanded}
        aria-label={`${t('career.yearLabel', { year })} ${isExpanded ? t('career.collapseLabel') : t('career.expandLabel')}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">
                {year.slice(-2)}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {t('career.yearLabel', { year })}
              </h3>
              <p className="text-gray-600">{yearData.summary}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {Object.keys(yearData.months).length}
                {t('career.monthLabel')}
              </div>
              <div className="text-sm text-gray-500">
                {Object.values(yearData.months).reduce(
                  (acc, month) => acc + month.length,
                  0
                )}
                {t('career.projects')}
              </div>
            </div>
            <ChevronDown
              className={`w-6 h-6 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </div>
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-100"
        >
          <div className="p-6">
            <p className="text-gray-700 mb-6">{yearData.description}</p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-2 mb-6">
              {yearData.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-full border border-gray-200"
                >
                  {highlight}
                </span>
              ))}
            </div>

            {/* Monthly Timeline */}
            {yearData.months && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" aria-hidden="true" />
                  {t('career.monthlyActivities')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(yearData.months)
                    .reverse()
                    .map(([month, activities]) => (
                      <MonthButton
                        key={month}
                        month={month}
                        activities={activities}
                        isActive={activeMonth === month}
                        onToggle={() => onToggleMonth(month)}
                        getActivityTypeColor={getActivityTypeColor}
                        t={t}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
);

YearCard.displayName = 'YearCard';

interface StatCardProps {
  stat: StatItem;
  index: number;
}

const StatCard: React.FC<StatCardProps> = memo(({ stat, index }) => {
  const IconComponent = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <IconComponent
        className="w-8 h-8 text-gray-700 mx-auto mb-3"
        aria-hidden="true"
      />
      <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
      <div className="text-gray-600">{stat.label}</div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

const CareerSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<string[]>([]);

  const careerData: CareerData = {
    '2025': {
      title: '현재',
      role: '에멜무지로 설립',
      company: '에멜무지로',
      location: '서울',
      description: 'AI 솔루션 개발 및 컨설팅 서비스 제공',
      highlights: ['AI 솔루션 개발', '전문 교육', '전략 컨설팅'],
      type: 'current',
      months: {
        '1월': [
          {
            title: '멋쟁이사자처럼 산업전문인력 AI역량강화 교육',
            type: 'lecture',
            status: 'inProgress',
          },
          {
            title: 'AI 컨설팅 사업 확장',
            type: 'business',
            status: 'inProgress',
          },
        ],
      },
    },
    '2024': {
      title: '사업 확장 및 대학원 진학',
      role: 'AI 컨설턴트 & 대학원생',
      company: '에멜무지로 & 한양대학교',
      location: '서울',
      description: 'AI 컨설팅 사업과 학업 병행',
      highlights: ['대학원 진학', '사업 확장', '교육 활동'],
      type: 'education',
      months: {
        '12월': [
          {
            title: '멋쟁이사자처럼&한국과학창의재단 찾아가는 학교 컨설팅',
            type: 'consulting',
            status: 'completed',
          },
          { title: '대학원 첫 학기 완료', type: 'study', status: 'completed' },
        ],
        '11월': [
          {
            title: '테킷 스타트업 스테이션 9기 강의',
            type: 'lecture',
            status: 'completed',
          },
          {
            title: 'AI 프로젝트 컨설팅',
            type: 'consulting',
            status: 'completed',
          },
        ],
        '10월': [
          {
            title: '엘리스-삼성전자 Spotfire 교육',
            type: 'lecture',
            status: 'completed',
          },
          { title: '한양대 중간고사', type: 'study', status: 'completed' },
        ],
        '9월': [
          {
            title: '한양대학교 인공지능융합대학원 입학',
            type: 'study',
            status: 'completed',
          },
          {
            title: '테킷 스타트업 스테이션 8기 강의',
            type: 'lecture',
            status: 'completed',
          },
        ],
        '8월': [
          {
            title: '심화 기업 연계형 실전 프로젝트 중심 AI과정',
            type: 'lecture',
            status: 'completed',
          },
          {
            title: '대학원 입학 준비',
            type: 'preparation',
            status: 'completed',
          },
        ],
        '7월': [
          {
            title: 'DSC공유대학XKT 강의',
            type: 'lecture',
            status: 'completed',
          },
          {
            title: '여름 집중 교육 프로그램',
            type: 'lecture',
            status: 'completed',
          },
        ],
      },
    },
    '2023': {
      title: '교육 활동 전성기',
      role: '전문 강사 & AI 교육자',
      company: '다수 기업 및 기관',
      location: '서울',
      description: '대기업 및 정부기관 대상 AI 교육 활발히 진행',
      highlights: ['삼성전자', 'LG전자', '현대건설', '멋쟁이사자처럼'],
      type: 'career',
      months: {
        '12월': [
          {
            title: '연말 교육 프로그램 총정리',
            type: 'education',
            status: 'completed',
          },
          {
            title: '내년도 교육 계획 수립',
            type: 'planning',
            status: 'completed',
          },
        ],
        '11월': [
          {
            title: '한글과컴퓨터 - 성대, 인하대, 경기대 헬스케어 프로젝트',
            type: 'lecture',
            status: 'completed',
          },
          {
            title: '기상-AI 청년 부스트캠프 멘토',
            type: 'mentoring',
            status: 'completed',
          },
        ],
        '10월': [
          {
            title: '테킷 스타트업 스테이션 7기',
            type: 'lecture',
            status: 'completed',
          },
          {
            title: 'AI 교육 콘텐츠 개발',
            type: 'development',
            status: 'completed',
          },
        ],
        '9월': [
          {
            title: '한글과컴퓨터 - 논문 기반 영상 처리 딥러닝 모델 설계',
            type: 'lecture',
            status: 'completed',
          },
          {
            title: '고급 AI 교육과정 설계',
            type: 'planning',
            status: 'completed',
          },
        ],
        '8월': [
          {
            title: '카카오 - SKT 컴퓨터비전 (with OpenCV)',
            type: 'lecture',
            status: 'completed',
          },
          { title: '여름 집중 부트캠프', type: 'lecture', status: 'completed' },
        ],
        '7월': [
          {
            title: '엘리스 - 제주더큰내일센터',
            type: 'lecture',
            status: 'completed',
          },
          { title: '취업 교육 프로그램', type: 'lecture', status: 'completed' },
        ],
      },
    },
    '2022': {
      title: 'AI 교육 전문가로 성장',
      role: '책임 연구원 & 전문 강사',
      company: 'Cobslab & 모두의연구소',
      location: '서울',
      description: 'AI 교육 콘텐츠 개발 및 기업 교육 전문가로 활동',
      highlights: ['교육 콘텐츠 개발', '기업 교육', '연구 활동'],
      type: 'career',
      months: {
        '12월': [
          { title: '연말 교육 성과 정리', type: 'review', status: 'completed' },
          {
            title: '2023년 교육 계획 수립',
            type: 'planning',
            status: 'completed',
          },
        ],
        '11월': [
          {
            title: '네이버 커넥트재단 HTML/CSS 코칭스터디 리드',
            type: 'mentoring',
            status: 'completed',
          },
          { title: '교육 방법론 연구', type: 'research', status: 'completed' },
        ],
        '10월': [
          {
            title: 'Cobslab 책임연구원 역할 시작',
            type: 'employment',
            status: 'completed',
          },
          {
            title: '모두의연구소 강의 마무리',
            type: 'lecture',
            status: 'completed',
          },
        ],
        '9월': [
          {
            title: 'KURLY HACK FESTA 2022 참가',
            type: 'competition',
            status: 'completed',
          },
          {
            title: '오픈소스 컨트리뷰션 아카데미',
            type: 'activity',
            status: 'completed',
          },
        ],
        '8월': [
          {
            title: '서울시립대 캠퍼스타운형 취업사관학교',
            type: 'lecture',
            status: 'completed',
          },
          {
            title: '서울대 사범대 파이썬 특강',
            type: 'lecture',
            status: 'completed',
          },
        ],
        '7월': [
          {
            title: '서울특별시 교육청 교원 직무연수',
            type: 'lecture',
            status: 'completed',
          },
          { title: '교원 대상 AI 교육', type: 'lecture', status: 'completed' },
        ],
      },
    },
  };

  const stats: StatItem[] = [
    { label: t('career.stats.lectures'), value: '50+', icon: BookOpen },
    { label: t('career.stats.partners'), value: '15+', icon: Building },
    {
      label: t('career.stats.educationPeriod'),
      value: t('career.stats.educationYears'),
      icon: Award,
    },
  ];

  const toggleYear = useCallback((year: string) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
    setActiveMonth(null);
  }, []);

  const toggleMonth = useCallback((month: string) => {
    setActiveMonth((prev) => (prev === month ? null : month));
  }, []);

  const getActivityTypeColor = useCallback((type: string): string => {
    const colors: { [key: string]: string } = {
      lecture: 'bg-gray-100 text-gray-800',
      consulting: 'bg-green-100 text-green-800',
      business: 'bg-gray-100 text-gray-800',
      study: 'bg-indigo-100 text-indigo-800',
      mentoring: 'bg-yellow-100 text-yellow-800',
      competition: 'bg-red-100 text-red-800',
      research: 'bg-gray-100 text-gray-800',
      development: 'bg-cyan-100 text-cyan-800',
      planning: 'bg-pink-100 text-pink-800',
      education: 'bg-gray-100 text-gray-800',
      preparation: 'bg-orange-100 text-orange-800',
      review: 'bg-purple-100 text-purple-800',
      employment: 'bg-blue-100 text-blue-800',
      activity: 'bg-teal-100 text-teal-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }, []);

  return (
    <section
      id="career"
      aria-label={t('accessibility.careerSection')}
      className="py-24 bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            {t('career.title')}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            <Trans
              i18nKey="career.subtitle"
              components={{ strong: <strong /> }}
            />
          </p>
        </div>

        {/* Timeline */}
        <div
          className="space-y-8"
          role="region"
          aria-label={t('accessibility.careerTimeline')}
        >
          {Object.entries(careerData)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .map(([year, yearData]) => (
              <YearCard
                key={year}
                year={year}
                yearData={yearData}
                isExpanded={expandedYears.includes(year)}
                activeMonth={activeMonth}
                onToggleYear={() => toggleYear(year)}
                onToggleMonth={toggleMonth}
                getActivityTypeColor={getActivityTypeColor}
                t={t}
              />
            ))}
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          role="region"
          aria-label={t('accessibility.careerStats')}
        >
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

CareerSection.displayName = 'CareerSection';

export default CareerSection;
