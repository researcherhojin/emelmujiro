import React, { memo } from 'react';
import { motion } from 'framer-motion';
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
  title: string;
  description: string;
}

interface WorkStyleItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface SkillGroup {
  category: string;
  items: string[];
  color: string;
}

interface Certification {
  name: string;
  issuer?: string;
  score?: string;
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

const GoalCard: React.FC<GoalCardProps> = memo(({ goal, index }) => (
  <div
    key={index}
    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 bg-gray-50 rounded-lg p-3">{goal.icon}</div>
      <div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">{goal.title}</h4>
        <p className="text-gray-600 leading-relaxed">{goal.description}</p>
      </div>
    </div>
  </div>
));

GoalCard.displayName = 'GoalCard';

interface WorkStyleCardProps {
  style: WorkStyleItem;
  index: number;
}

const WorkStyleCard: React.FC<WorkStyleCardProps> = memo(({ style, index }) => (
  <div
    key={index}
    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 bg-gray-50 rounded-lg p-3">
        {style.icon}
      </div>
      <div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">{style.title}</h4>
        <p className="text-gray-600 leading-relaxed">{style.description}</p>
      </div>
    </div>
  </div>
));

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
  ({ cert, index }) => (
    <div
      key={index}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-green-50 rounded-lg p-3">
          <Award className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-1">{cert.name}</h4>
          <p className="text-gray-600">
            {cert.issuer && <span>{cert.issuer}</span>}
            {cert.score && (
              <span className="text-gray-700 font-semibold">
                {' '}
                • {cert.score}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
);

CertificationCard.displayName = 'CertificationCard';

const AboutSection: React.FC = memo(() => {
  const profileStats: StatItem[] = [
    {
      icon: <Award className="w-6 h-6" />,
      label: '교육 경력',
      value: `${STATISTICS.experience.yearsInEducation}년+`,
      color: 'text-gray-700',
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: '교육 수료생',
      value: `${STATISTICS.education.totalStudentsText}`,
      color: 'text-green-600',
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: '협력 기업',
      value: `${STATISTICS.experience.totalCompaniesWorkedWith}곳+`,
      color: 'text-gray-700',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: '강의 프로젝트',
      value: `${STATISTICS.projects.totalProjectsText}`,
      color: 'text-orange-600',
    },
  ];

  const goals: GoalItem[] = [
    {
      icon: <Target className="w-8 h-8 text-gray-700" />,
      title: '대체 불가능한 경쟁력 구축',
      description:
        'AI Researcher로써 지속적인 연구와 혁신을 통해 독보적인 전문성을 쌓고 있습니다.',
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: '지식 공유를 통한 가치 창출',
      description:
        '교육과 멘토링을 통해 더 많은 사람들이 AI 기술을 활용할 수 있도록 돕고 있습니다.',
    },
  ];

  const workStyle: WorkStyleItem[] = [
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: '소통과 협업',
      description:
        '다양한 사람들과의 원활한 소통을 통해 시너지를 만들어내는 것을 즐깁니다.',
    },
    {
      icon: <Brain className="w-8 h-8 text-gray-700" />,
      title: '창의적 문제 해결',
      description:
        '창의적인 아이디어로 문제를 해결하며 성장하는 과정에서 보람을 느낍니다.',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-gray-700" />,
      title: '트렌드 선도',
      description:
        '인공지능 트렌드를 빠르게 캐치하고 새로운 지식을 적극적으로 공유합니다.',
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
    { name: 'ADsP (데이터분석 준전문가)', issuer: '한국데이터산업진흥원' },
    { name: 'NCS 정보기술전략&계획', score: '57점' },
    { name: 'NCS 정보기술개발', score: '57점' },
    { name: 'NCS 인공지능', score: '57점' },
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
            About Me
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            삼성전자, SK, LG 등 다수의 대기업 및 공공기관에서 Deep Learning과
            LLM 교육과 연구를 수행하는
            <span className="font-semibold text-gray-900">
              {' '}
              에멜무지로 대표 이호진
            </span>
            입니다.
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
              Goals & Values
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
              Work Style
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
            Technical Skills
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
            Certifications & Achievements
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
            "비전공자도 쉽게 입문할 수 있는 실무 중심의 AI 교육을 추구합니다"
          </h3>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-4xl mx-auto">
            복잡한 AI 기술을 누구나 이해할 수 있도록 쉽게 풀어내고, 실제 업무에
            바로 적용할 수 있는 실용적인 교육을 제공하는 것이 저의 목표입니다.
            함께 AI의 무한한 가능성을 탐험해보세요.
          </p>
        </motion.div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;
