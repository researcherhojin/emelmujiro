import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Users,
  Award,
  Code,
  GraduationCap,
  Briefcase,
  Star,
  TrendingUp,
  Heart,
  Target,
  Brain,
  Zap,
} from 'lucide-react';
import { STATISTICS } from '../../constants';

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

interface GoalItem {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

interface WorkStyleItem {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

interface SkillGroup {
  category: string;
  items: string[];
  color: string;
}

interface Certification {
  nameKey: string;
  issuerKey?: string;
  scoreKey?: string;
}

interface StatCardProps {
  stat: StatItem;
  index: number;
}

const StatCard: React.FC<StatCardProps> = memo(({ stat, index }) => (
  <div
    key={index}
    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
  >
    <div
      className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4 mx-auto ${stat.color}`}
    >
      {stat.icon}
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
      <div className="text-sm text-gray-600">{stat.label}</div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

interface GoalCardProps {
  goal: GoalItem;
  index: number;
}

const GoalCard: React.FC<GoalCardProps> = memo(({ goal, index }) => {
  const { t } = useTranslation();
  return (
    <div
      key={index}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-gray-50 rounded-lg p-3">
          {goal.icon}
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            {t(goal.titleKey)}
          </h4>
          <p className="text-gray-600 leading-relaxed">
            {t(goal.descriptionKey)}
          </p>
        </div>
      </div>
    </div>
  );
});

GoalCard.displayName = 'GoalCard';

interface WorkStyleCardProps {
  style: WorkStyleItem;
  index: number;
}

const WorkStyleCard: React.FC<WorkStyleCardProps> = memo(({ style, index }) => {
  const { t } = useTranslation();
  return (
    <div
      key={index}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-gray-50 rounded-lg p-3">
          {style.icon}
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            {t(style.titleKey)}
          </h4>
          <p className="text-gray-600 leading-relaxed">
            {t(style.descriptionKey)}
          </p>
        </div>
      </div>
    </div>
  );
});

WorkStyleCard.displayName = 'WorkStyleCard';

interface SkillGroupCardProps {
  skillGroup: SkillGroup;
  index: number;
}

const SkillGroupCard: React.FC<SkillGroupCardProps> = memo(
  ({ skillGroup, index }) => (
    <div
      key={index}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <h4 className="text-xl font-bold text-gray-900 mb-4">
        {skillGroup.category}
      </h4>
      <div className="flex flex-wrap gap-2">
        {skillGroup.items.map((skill, skillIndex) => (
          <span
            key={skillIndex}
            className={`px-3 py-1 rounded-full text-sm font-medium ${skillGroup.color}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
);

SkillGroupCard.displayName = 'SkillGroupCard';

interface CertificationCardProps {
  cert: Certification;
  index: number;
}

const CertificationCard: React.FC<CertificationCardProps> = memo(
  ({ cert, index }) => {
    const { t } = useTranslation();
    return (
      <div
        key={index}
        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 bg-green-50 rounded-lg p-3">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              {t(cert.nameKey)}
            </h4>
            <p className="text-gray-600">
              {cert.issuerKey && <span>{t(cert.issuerKey)}</span>}
              {cert.scoreKey && (
                <span className="text-gray-700 font-semibold">
                  {' '}
                  • {t(cert.scoreKey)}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

CertificationCard.displayName = 'CertificationCard';

const AboutSection: React.FC = memo(() => {
  const { t } = useTranslation();

  const profileStats: StatItem[] = [
    {
      icon: <Award className="w-6 h-6" />,
      label: t('profile.stats.educationCareer'),
      value: `${STATISTICS.experience.yearsInEducation}년+`,
      color: 'text-gray-700',
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: t('profile.stats.students'),
      value: `${STATISTICS.education.totalStudentsText}`,
      color: 'text-green-600',
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: t('profile.stats.partners'),
      value: `${STATISTICS.experience.totalCompaniesWorkedWith}곳+`,
      color: 'text-gray-700',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: t('profile.stats.lectureProjects'),
      value: `${STATISTICS.projects.totalProjectsText}`,
      color: 'text-orange-600',
    },
  ];

  const goals: GoalItem[] = [
    {
      icon: <Target className="w-8 h-8 text-gray-700" />,
      titleKey: 'profile.goals.competitive.title',
      descriptionKey: 'profile.goals.competitive.description',
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      titleKey: 'profile.goals.sharing.title',
      descriptionKey: 'profile.goals.sharing.description',
    },
  ];

  const workStyle: WorkStyleItem[] = [
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      titleKey: 'profile.workStyle.communication.title',
      descriptionKey: 'profile.workStyle.communication.description',
    },
    {
      icon: <Brain className="w-8 h-8 text-gray-700" />,
      titleKey: 'profile.workStyle.creative.title',
      descriptionKey: 'profile.workStyle.creative.description',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-gray-700" />,
      titleKey: 'profile.workStyle.trending.title',
      descriptionKey: 'profile.workStyle.trending.description',
    },
  ];

  const skills: SkillGroup[] = [
    {
      category: 'Web Programming',
      items: [
        'Python',
        'Django',
        'Django Rest Framework',
        'HTML',
        'CSS',
        'JavaScript',
        'React',
        'TanStack Query',
        'Chakra UI',
      ],
      color: 'bg-gray-100 text-gray-800',
    },
    {
      category: 'ML / DL / Data Engineering',
      items: [
        'PyTorch',
        'TensorFlow',
        'LangChain',
        'Scikit-Learn',
        'Huggingface',
        'Spotfire',
      ],
      color: 'bg-green-100 text-green-800',
    },
    {
      category: 'Collaboration & Tools',
      items: ['Git', 'Github', 'Discord', 'Slack', 'Notion'],
      color: 'bg-gray-100 text-gray-800',
    },
  ];

  const certifications: Certification[] = [
    {
      nameKey: 'profile.certifications.adsp.name',
      issuerKey: 'profile.certifications.adsp.issuer',
    },
    {
      nameKey: 'profile.certifications.ncsStrategy.name',
      scoreKey: 'profile.certifications.ncsStrategy.score',
    },
    {
      nameKey: 'profile.certifications.ncsDev.name',
      scoreKey: 'profile.certifications.ncsDev.score',
    },
    {
      nameKey: 'profile.certifications.ncsAI.name',
      scoreKey: 'profile.certifications.ncsAI.score',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('profile.aboutMe')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('profile.intro')}{' '}
            <span className="font-semibold text-gray-900">
              {t('profile.ceoName')}
            </span>
            {t('profile.introSuffix', { defaultValue: '' })}
          </p>
        </motion.div>

        {/* Profile Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {profileStats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          {/* Goals & Values */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Star className="w-8 h-8 text-yellow-500 mr-3" />
              {t('profile.goalsTitle', { defaultValue: 'Goals & Values' })}
            </h3>
            <div className="space-y-6">
              {goals.map((goal, index) => (
                <GoalCard key={index} goal={goal} index={index} />
              ))}
            </div>
          </motion.div>

          {/* Work Style */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Zap className="w-8 h-8 text-orange-500 mr-3" />
              {t('profile.workStyleTitle', { defaultValue: 'Work Style' })}
            </h3>
            <div className="space-y-6">
              {workStyle.map((style, index) => (
                <WorkStyleCard key={index} style={style} index={index} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
            <Code className="w-8 h-8 text-gray-700 mr-3" />
            {t('profile.skillsTitle', { defaultValue: 'Technical Skills' })}
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {skills.map((skillGroup, index) => (
              <SkillGroupCard
                key={index}
                skillGroup={skillGroup}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-green-600 mr-3" />
            {t('profile.certificationsTitle', {
              defaultValue: 'Certifications & Achievements',
            })}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {certifications.map((cert, index) => (
              <CertificationCard key={index} cert={cert} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Introduction Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-gray-900 rounded-2xl p-8 md:p-12 text-white text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            {t('profile.quote')}
          </h3>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-4xl mx-auto">
            {t('profile.quoteDescription')}
          </p>
        </motion.div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;
