import i18n from '../i18n';

export interface CareerItem {
  period: string;
  company: string;
  position: string;
  description: string;
  current?: boolean;
}

export interface EducationItem {
  period: string;
  school: string;
  degree: string;
  description: string;
}

export interface ProjectStats {
  totalProjects: string;
  totalStudents: string;
  partnerCompanies: string;
  yearsOfExperience: string;
}

export interface Project {
  id: string;
  title: string;
  period: string;
  description: string;
  category: 'enterprise' | 'bootcamp' | 'education' | 'startup' | 'research';
  tags: string[];
  highlight?: boolean;
}

export const getCareerData = (): CareerItem[] => [
  {
    period: i18n.t('profileData.career.0.period'),
    company: i18n.t('profileData.career.0.company'),
    position: i18n.t('profileData.career.0.position'),
    description: i18n.t('profileData.career.0.description'),
    current: true,
  },
  {
    period: i18n.t('profileData.career.1.period'),
    company: i18n.t('profileData.career.1.company'),
    position: i18n.t('profileData.career.1.position'),
    description: i18n.t('profileData.career.1.description'),
    current: true,
  },
  {
    period: i18n.t('profileData.career.2.period'),
    company: i18n.t('profileData.career.2.company'),
    position: i18n.t('profileData.career.2.position'),
    description: i18n.t('profileData.career.2.description'),
  },
  {
    period: i18n.t('profileData.career.3.period'),
    company: i18n.t('profileData.career.3.company'),
    position: i18n.t('profileData.career.3.position'),
    description: i18n.t('profileData.career.3.description'),
  },
  {
    period: i18n.t('profileData.career.4.period'),
    company: i18n.t('profileData.career.4.company'),
    position: i18n.t('profileData.career.4.position'),
    description: i18n.t('profileData.career.4.description'),
  },
  {
    period: i18n.t('profileData.career.5.period'),
    company: i18n.t('profileData.career.5.company'),
    position: i18n.t('profileData.career.5.position'),
    description: i18n.t('profileData.career.5.description'),
  },
  {
    period: i18n.t('profileData.career.6.period'),
    company: i18n.t('profileData.career.6.company'),
    position: i18n.t('profileData.career.6.position'),
    description: i18n.t('profileData.career.6.description'),
  },
];

export const getEducationData = (): EducationItem[] => [
  {
    period: i18n.t('profileData.education.0.period'),
    school: i18n.t('profileData.education.0.school'),
    degree: i18n.t('profileData.education.0.degree'),
    description: i18n.t('profileData.education.0.description'),
  },
  {
    period: i18n.t('profileData.education.1.period'),
    school: i18n.t('profileData.education.1.school'),
    degree: i18n.t('profileData.education.1.degree'),
    description: i18n.t('profileData.education.1.description'),
  },
];

export const getProjects = (): Project[] => [
  {
    id: 'ai-cv-bootcamp',
    title: i18n.t('profileData.projects.0.title'),
    period: '2024 ~ 2026',
    description: i18n.t('profileData.projects.0.description'),
    category: 'bootcamp',
    tags: [
      'Computer Vision',
      'Image Generation',
      'Object Detection',
      'PyTorch',
      'Segmentation',
    ].sort(),
    highlight: true,
  },
  {
    id: 'enterprise-ai-education',
    title: i18n.t('profileData.projects.1.title'),
    period: '2022 ~ 2026',
    description: i18n.t('profileData.projects.1.description'),
    category: 'enterprise',
    tags: [
      'Computer Vision',
      'Data Science',
      'ML/DL',
      i18n.t('profileData.projects.1.tags.3'),
    ].sort(),
  },
  {
    id: 'ict-piuda',
    title: i18n.t('profileData.projects.2.title'),
    period: '2025',
    description: i18n.t('profileData.projects.2.description'),
    category: 'research',
    tags: ['FastAPI', 'LLM', 'React', i18n.t('profileData.projects.2.tags.3')].sort(),
  },
  {
    id: 'teacher-training',
    title: i18n.t('profileData.projects.3.title'),
    period: '2024 ~ 2025',
    description: i18n.t('profileData.projects.3.description'),
    category: 'education',
    tags: [
      i18n.t('profileData.projects.3.tags.0'),
      'ChatGPT',
      i18n.t('profileData.projects.3.tags.2'),
      i18n.t('profileData.projects.3.tags.3'),
    ].sort(),
  },
  {
    id: 'startup-station',
    title: i18n.t('profileData.projects.4.title'),
    period: '2023 ~ 2025',
    description: i18n.t('profileData.projects.4.description'),
    category: 'startup',
    tags: [
      i18n.t('profileData.projects.4.tags.0'),
      i18n.t('profileData.projects.4.tags.1'),
      i18n.t('profileData.projects.4.tags.2'),
      i18n.t('profileData.projects.4.tags.3'),
    ].sort(),
  },
  {
    id: 'nano-ai',
    title: i18n.t('profileData.projects.5.title'),
    period: '2022 ~ 2025',
    description: i18n.t('profileData.projects.5.description'),
    category: 'enterprise',
    tags: [
      i18n.t('profileData.projects.5.tags.0'),
      i18n.t('profileData.projects.5.tags.1'),
      i18n.t('profileData.projects.5.tags.2'),
      i18n.t('profileData.projects.5.tags.3'),
    ].sort(),
  },
  {
    id: 'open-source',
    title: i18n.t('profileData.projects.6.title'),
    period: '2022',
    description: i18n.t('profileData.projects.6.description'),
    category: 'research',
    tags: [
      'ML',
      'Python',
      i18n.t('profileData.projects.6.tags.2'),
      i18n.t('profileData.projects.6.tags.3'),
    ].sort(),
  },
];

export const projectStats: ProjectStats = {
  totalProjects: '50+',
  totalStudents: '1,000+',
  partnerCompanies: '30+',
  yearsOfExperience: '5+',
};

export const getProjectCategories = () => {
  const projects = getProjects();
  return [
    {
      id: 'all',
      label: i18n.t('profileData.categories.0.label'),
      count: projects.length,
    },
    {
      id: 'enterprise',
      label: i18n.t('profileData.categories.1.label'),
      count: projects.filter((p) => p.category === 'enterprise').length,
    },
    {
      id: 'bootcamp',
      label: i18n.t('profileData.categories.2.label'),
      count: projects.filter((p) => p.category === 'bootcamp').length,
    },
    {
      id: 'education',
      label: i18n.t('profileData.categories.3.label'),
      count: projects.filter((p) => p.category === 'education').length,
    },
    {
      id: 'startup',
      label: i18n.t('profileData.categories.4.label'),
      count: projects.filter((p) => p.category === 'startup').length,
    },
    {
      id: 'research',
      label: i18n.t('profileData.categories.5.label'),
      count: projects.filter((p) => p.category === 'research').length,
    },
  ];
};
