export interface EducationStats {
  totalStudents: number;
  totalStudentsText: string;
  completionRate: number;
  satisfactionRate: number;
}

export interface ProjectStats {
  totalProjects: number;
  totalProjectsText: string;
  successfulProjects: number;
  ongoingProjects: number;
}

export interface ExperienceStats {
  yearsInAI: number;
  yearsInEducation: number;
  totalCompaniesWorkedWith: number;
  totalLectures: number;
}

export interface AchievementStats {
  awardsReceived: number;
  publicationsCount: number;
  conferencesPresentations: number;
}

export interface Statistics {
  education: EducationStats;
  projects: ProjectStats;
  experience: ExperienceStats;
  achievements: AchievementStats;
}

export const STATISTICS: Statistics = {
  // 교육 관련 통계
  education: {
    totalStudents: 1000,
    totalStudentsText: '1,000+',
    completionRate: 95,
    satisfactionRate: 98,
  },

  // 프로젝트 관련 통계
  projects: {
    totalProjects: 50,
    totalProjectsText: '50+',
    successfulProjects: 48,
    ongoingProjects: 5,
  },

  // 경력 관련 통계
  experience: {
    yearsInAI: 8,
    yearsInEducation: 6,
    totalCompaniesWorkedWith: 30,
    totalLectures: 200,
  },

  // 성과 관련 통계
  achievements: {
    awardsReceived: 5,
    publicationsCount: 15,
    conferencesPresentations: 20,
  },
};

// 헬퍼 함수들
export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 1000).toFixed(0)}K+`;
  } else if (num >= 1000) {
    return `${num.toLocaleString()}+`;
  }
  return `${num}+`;
};

export const getStatistic = <K extends keyof Statistics>(
  category: K,
  key: keyof Statistics[K]
): number => {
  const value = STATISTICS[category]?.[key];
  return typeof value === 'number' ? value : 0;
};
