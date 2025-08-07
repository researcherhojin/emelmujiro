import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, BookOpen, Users, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Track {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
}

interface Course {
  company: string;
  course: string;
  period: string;
  type: string;
}

interface TrackCardProps {
  track: Track;
  index: number;
}

const TrackCard: React.FC<TrackCardProps> = memo(({ track, index }) => (
  <motion.div
    key={track.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-white rounded-xl shadow-sm hover:shadow-md p-8 flex flex-col"
  >
    <div className="text-center">{track.icon}</div>
    <h3 className="text-2xl font-semibold mb-4 text-gray-900">{track.title}</h3>
    <p className="text-gray-600 mb-6 flex-grow">{track.description}</p>
    <ul className="space-y-3">
      {track.highlights.map((point, idx) => (
        <li key={idx} className="flex items-start space-x-2">
          <span
            className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm text-gray-600">{point}</span>
        </li>
      ))}
    </ul>
  </motion.div>
));

TrackCard.displayName = 'TrackCard';

interface CourseCardProps {
  course: Course;
  index: number;
}

const CourseCard: React.FC<CourseCardProps> = memo(({ course, index }) => (
  <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
    <h4 className="font-semibold text-lg text-gray-900 mb-2">{course.company}</h4>
    <div className="space-y-2 text-sm text-gray-600">
      <p>{course.course}</p>
      <p>{course.period}</p>
      <p className="text-gray-700">{course.type}</p>
    </div>
  </div>
));

CourseCard.displayName = 'CourseCard';

const EducationSection: React.FC = memo(() => {
  const navigate = useNavigate();

  const tracks: Track[] = [
    {
      id: 1,
      icon: <Code className="w-8 h-8 text-gray-700 mb-4" />,
      title: '기업 실무자 과정',
      description: '실제 기업 환경에서 활용 가능한 AI/ML 실무 교육',
      highlights: [
        'Spotfire 데이터 분석 및 시각화',
        'Python 기반 머신러닝 기초',
        '실무 데이터 활용 프로젝트',
      ],
    },
    {
      id: 2,
      icon: <BookOpen className="w-8 h-8 text-gray-700 mb-4" />,
      title: 'AI 기술 심화 과정',
      description: 'Computer Vision과 딥러닝 중심의 전문가 양성 과정',
      highlights: ['YOLO 기반 객체 인식 실습', 'Vision AI 알고리즘 구현', 'AI 프로젝트 실전 구축'],
    },
    {
      id: 3,
      icon: <Users className="w-8 h-8 text-gray-700 mb-4" />,
      title: '생성형 AI 활용 과정',
      description: '최신 생성형 AI 기술의 비즈니스 적용 교육',
      highlights: ['LLM 기반 서비스 설계', '업무 자동화 프로세스', 'AI 도입 전략 수립'],
    },
  ];

  const recentCourses: Course[] = [
    {
      company: '삼성전자',
      course: 'Spotfire 데이터 분석',
      period: '2023.05 ~ 현재',
      type: '임직원 대상 실습 중심 교육',
    },
    {
      company: '현대건설',
      course: 'ML/DL 교육',
      period: '2023.05 ~ 2023.09',
      type: '12차수 진행 완료',
    },
    {
      company: '멋쟁이사자처럼',
      course: '테킷 스타트업 스테이션',
      period: '2023.11 ~ 2024.02',
      type: '실전 프로젝트 중심 교육',
    },
  ];

  const handleConsultationClick = useCallback(() => {
    navigate('/contact');
  }, [navigate]);

  return (
    <section id="education" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold mb-6 text-gray-900">실전 AI 교육</h2>
          <p className="text-xl text-gray-600">
            현장에서 바로 활용할 수 있는 실무 중심 교육을 제공합니다
          </p>
        </motion.div>

        {/* Education Tracks */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {tracks.map((track, index) => (
            <TrackCard key={track.id} track={track} index={index} />
          ))}
        </div>

        {/* Recent Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-center mb-12">최근 진행 과정</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {recentCourses.map((course, index) => (
              <CourseCard key={index} course={course} index={index} />
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <button
              onClick={handleConsultationClick}
              className="bg-gray-900 text-white px-8 py-4 rounded-lg flex items-center 
                                     hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg"
            >
              <CalendarCheck className="w-5 h-5 mr-2" />
              교육 문의하기
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

EducationSection.displayName = 'EducationSection';

export default EducationSection;
