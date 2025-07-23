export const STATISTICS = {
  // 교육 관련 통계
  education: {
    totalStudents: 10000,
    totalStudentsText: '10,000+',
    completionRate: 95,
    satisfactionRate: 98
  },
  
  // 프로젝트 관련 통계
  projects: {
    totalProjects: 50,
    totalProjectsText: '50+',
    successfulProjects: 48,
    ongoingProjects: 5
  },
  
  // 경력 관련 통계
  experience: {
    yearsInAI: 8,
    yearsInEducation: 6,
    totalCompaniesWorkedWith: 30,
    totalLectures: 200
  },
  
  // 성과 관련 통계
  achievements: {
    awardsReceived: 5,
    publicationsCount: 15,
    conferencesPresentations: 20
  }
};

// 헬퍼 함수들
export const formatNumber = (num) => {
  if (num >= 10000) {
    return `${(num / 1000).toFixed(0)}K+`;
  } else if (num >= 1000) {
    return `${num.toLocaleString()}+`;
  }
  return `${num}+`;
};

export const getStatistic = (category, key) => {
  return STATISTICS[category]?.[key] || 0;
};