import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarCheck, BookOpen, Users, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Track {
  id: number;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  highlightsKey: string;
}

interface Course {
  companyKey: string;
  courseKey: string;
  periodKey: string;
  typeKey: string;
}

interface TrackCardProps {
  track: Track;
  index: number;
  t: (key: string, options?: object) => string;
}

const TrackCard: React.FC<TrackCardProps> = memo(({ track, index, t }) => {
  const highlights = t(track.highlightsKey, {
    returnObjects: true,
  }) as string[];

  return (
    <motion.div
      key={track.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md p-8 flex flex-col"
    >
      <div className="text-center">{track.icon}</div>
      <h3 className="text-2xl font-semibold mb-4 text-gray-900">
        {t(track.titleKey)}
      </h3>
      <p className="text-gray-600 mb-6 flex-grow">{t(track.descriptionKey)}</p>
      <ul className="space-y-3">
        {Array.isArray(highlights) &&
          highlights.map((point, idx) => (
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
  );
});

TrackCard.displayName = 'TrackCard';

interface CourseCardProps {
  course: Course;
  index: number;
  t: (key: string) => string;
}

const CourseCard: React.FC<CourseCardProps> = memo(({ course, index, t }) => (
  <div
    key={index}
    className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
  >
    <h4 className="font-semibold text-lg text-gray-900 mb-2">
      {t(course.companyKey)}
    </h4>
    <div className="space-y-2 text-sm text-gray-600">
      <p>{t(course.courseKey)}</p>
      <p>{t(course.periodKey)}</p>
      <p className="text-gray-700">{t(course.typeKey)}</p>
    </div>
  </div>
));

CourseCard.displayName = 'CourseCard';

const EducationSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tracks: Track[] = [
    {
      id: 1,
      icon: <Code className="w-8 h-8 text-gray-700 mb-4" />,
      titleKey: 'education.tracks.corporate.title',
      descriptionKey: 'education.tracks.corporate.description',
      highlightsKey: 'education.tracks.corporate.highlights',
    },
    {
      id: 2,
      icon: <BookOpen className="w-8 h-8 text-gray-700 mb-4" />,
      titleKey: 'education.tracks.advanced.title',
      descriptionKey: 'education.tracks.advanced.description',
      highlightsKey: 'education.tracks.advanced.highlights',
    },
    {
      id: 3,
      icon: <Users className="w-8 h-8 text-gray-700 mb-4" />,
      titleKey: 'education.tracks.genai.title',
      descriptionKey: 'education.tracks.genai.description',
      highlightsKey: 'education.tracks.genai.highlights',
    },
  ];

  const recentCourses: Course[] = [
    {
      companyKey: 'education.courses.samsung.company',
      courseKey: 'education.courses.samsung.course',
      periodKey: 'education.courses.samsung.period',
      typeKey: 'education.courses.samsung.type',
    },
    {
      companyKey: 'education.courses.hyundai.company',
      courseKey: 'education.courses.hyundai.course',
      periodKey: 'education.courses.hyundai.period',
      typeKey: 'education.courses.hyundai.type',
    },
    {
      companyKey: 'education.courses.likelion.company',
      courseKey: 'education.courses.likelion.course',
      periodKey: 'education.courses.likelion.period',
      typeKey: 'education.courses.likelion.type',
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
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            {t('education.title')}
          </h2>
          <p className="text-xl text-gray-600">{t('education.subtitle')}</p>
        </motion.div>

        {/* Education Tracks */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {tracks.map((track, index) => (
            <TrackCard key={track.id} track={track} index={index} t={t} />
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
          <h3 className="text-2xl font-bold text-center mb-12">
            {t('education.recentCourses')}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {recentCourses.map((course, index) => (
              <CourseCard key={index} course={course} index={index} t={t} />
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
              {t('common.inquireEducation')}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

EducationSection.displayName = 'EducationSection';

export default EducationSection;
