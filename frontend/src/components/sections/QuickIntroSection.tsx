import React, { memo, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STATISTICS } from '../../constants';

interface StatisticItemProps {
  value: string | number;
  label: string;
}

const StatisticItem: React.FC<StatisticItemProps> = memo(({ value, label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </motion.div>
));

StatisticItem.displayName = 'StatisticItem';

const QuickIntroSection: React.FC = memo(() => {
  const navigate = useNavigate();

  const handleNavigateToAbout = useCallback(() => {
    navigate('/about');
  }, [navigate]);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">
            실무 경험을 바탕으로한 <br />
            체계적인 AI 교육과 컨설팅
          </h2>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            2022년부터 축적한 AI 교육 노하우와 실무 프로젝트 경험을 바탕으로,
            <br />각 기업의 특성에 맞는 맞춤형 AI 솔루션을 제공합니다.
          </p>

          <div className="grid grid-cols-3 gap-8 mb-12">
            <StatisticItem
              value={STATISTICS.education.totalStudentsText}
              label="누적 교육 수료생"
            />
            <StatisticItem value={STATISTICS.projects.totalProjectsText} label="완료된 프로젝트" />
            <StatisticItem
              value={`${STATISTICS.experience.totalCompaniesWorkedWith}+`}
              label="협력 기업"
            />
          </div>

          <button
            onClick={handleNavigateToAbout}
            className="inline-flex items-center text-gray-900 font-medium hover:text-gray-600 transition-colors group"
            aria-label="회사 소개 페이지로 이동"
          >
            자세히 알아보기
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
});

QuickIntroSection.displayName = 'QuickIntroSection';

export default QuickIntroSection;
