interface SkillCategory {
  title: string;
  items: string[];
}

export const SKILLS: Record<string, SkillCategory> = {
  ai: {
    title: 'AI/ML',
    items: [
      'TensorFlow',
      'PyTorch',
      'Scikit-learn',
      'Keras',
      'OpenCV',
      'NLP',
      'Computer Vision',
    ],
  },

  languages: {
    title: 'Languages',
    items: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'R'],
  },

  frameworks: {
    title: 'Frameworks',
    items: ['React', 'Django', 'FastAPI', 'Node.js', 'Next.js'],
  },

  cloud: {
    title: 'Cloud & DevOps',
    items: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'MLflow', 'Airflow'],
  },

  databases: {
    title: 'Databases',
    items: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
  },

  tools: {
    title: 'Tools',
    items: ['Git', 'Jupyter', 'VS Code', 'Jira', 'Notion'],
  },
};
