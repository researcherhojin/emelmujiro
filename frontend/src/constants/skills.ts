interface SkillCategory {
  title: string;
  items: string[];
}

interface SkillCategoryInfo {
  key: string;
  title: string;
  items: string[];
}

export const SKILLS: Record<string, SkillCategory> = {
  ai: {
    title: 'AI/ML',
    items: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'OpenCV', 'NLP', 'Computer Vision']
  },
  
  languages: {
    title: 'Languages',
    items: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'R']
  },
  
  frameworks: {
    title: 'Frameworks',
    items: ['React', 'Django', 'FastAPI', 'Node.js', 'Next.js']
  },
  
  cloud: {
    title: 'Cloud & DevOps',
    items: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'MLflow', 'Airflow']
  },
  
  databases: {
    title: 'Databases',
    items: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch']
  },
  
  tools: {
    title: 'Tools',
    items: ['Git', 'Jupyter', 'VS Code', 'Jira', 'Notion']
  }
};

// 모든 스킬을 플랫 배열로 가져오기
export const getAllSkills = (): string[] => {
  return Object.values(SKILLS).flatMap(category => category.items);
};

// 카테고리별 스킬 가져오기
export const getSkillsByCategory = (categoryKey: string): string[] => {
  return SKILLS[categoryKey]?.items || [];
};

// 스킬 카테고리 목록 가져오기
export const getSkillCategories = (): SkillCategoryInfo[] => {
  return Object.entries(SKILLS).map(([key, value]) => ({
    key,
    title: value.title,
    items: value.items
  }));
};