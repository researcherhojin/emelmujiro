import { describe, it, expect, vi } from 'vitest';
import {
  getCareerData,
  getEducationData,
  getProjects,
  projectStats,
  getProjectCategories,
} from '../profileData';
import type {
  CareerItem,
  EducationItem,
  Project,
  ProjectStats,
} from '../profileData';

vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

describe('profileData', () => {
  describe('getCareerData', () => {
    it('should return a non-empty array', () => {
      const careerData = getCareerData();
      expect(careerData).toBeDefined();
      expect(Array.isArray(careerData)).toBe(true);
      expect(careerData.length).toBeGreaterThan(0);
    });

    it('should have valid structure for each career item', () => {
      const careerData = getCareerData();
      careerData.forEach((item: CareerItem) => {
        expect(item.period).toBeDefined();
        expect(typeof item.period).toBe('string');
        expect(item.period.trim()).not.toBe('');

        expect(item.company).toBeDefined();
        expect(typeof item.company).toBe('string');
        expect(item.company.trim()).not.toBe('');

        expect(item.position).toBeDefined();
        expect(typeof item.position).toBe('string');
        expect(item.position.trim()).not.toBe('');

        expect(item.description).toBeDefined();
        expect(typeof item.description).toBe('string');
        expect(item.description.trim()).not.toBe('');
      });
    });

    it('should have optional current flag as boolean when present', () => {
      const careerData = getCareerData();
      careerData.forEach((item: CareerItem) => {
        if (item.current !== undefined) {
          expect(typeof item.current).toBe('boolean');
        }
      });
    });

    it('should have at least one current position', () => {
      const careerData = getCareerData();
      const currentPositions = careerData.filter(
        (item) => item.current === true
      );
      expect(currentPositions.length).toBeGreaterThan(0);
    });

    it('should be ordered chronologically (most recent first)', () => {
      const careerData = getCareerData();
      // The first item should have a current flag or more recent period
      expect(careerData[0].current).toBe(true);
    });
  });

  describe('getEducationData', () => {
    it('should return a non-empty array', () => {
      const educationData = getEducationData();
      expect(educationData).toBeDefined();
      expect(Array.isArray(educationData)).toBe(true);
      expect(educationData.length).toBeGreaterThan(0);
    });

    it('should have valid structure for each education item', () => {
      const educationData = getEducationData();
      educationData.forEach((item: EducationItem) => {
        expect(item.period).toBeDefined();
        expect(typeof item.period).toBe('string');
        expect(item.period.trim()).not.toBe('');

        expect(item.school).toBeDefined();
        expect(typeof item.school).toBe('string');
        expect(item.school.trim()).not.toBe('');

        expect(item.degree).toBeDefined();
        expect(typeof item.degree).toBe('string');
        expect(item.degree.trim()).not.toBe('');

        expect(item.description).toBeDefined();
        expect(typeof item.description).toBe('string');
        expect(item.description.trim()).not.toBe('');
      });
    });

    it('should have unique schools or degrees', () => {
      const educationData = getEducationData();
      const schoolDegrees = educationData.map(
        (item) => `${item.school}-${item.degree}`
      );
      const unique = new Set(schoolDegrees);
      expect(unique.size).toBe(schoolDegrees.length);
    });
  });

  describe('getProjects', () => {
    const validCategories = [
      'enterprise',
      'bootcamp',
      'education',
      'startup',
      'research',
    ];

    it('should return a non-empty array', () => {
      const projects = getProjects();
      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
    });

    it('should have valid structure for each project', () => {
      const projects = getProjects();
      projects.forEach((project: Project) => {
        expect(project.id).toBeDefined();
        expect(typeof project.id).toBe('string');
        expect(project.id.trim()).not.toBe('');

        expect(project.title).toBeDefined();
        expect(typeof project.title).toBe('string');
        expect(project.title.trim()).not.toBe('');

        expect(project.period).toBeDefined();
        expect(typeof project.period).toBe('string');
        expect(project.period.trim()).not.toBe('');

        expect(project.description).toBeDefined();
        expect(typeof project.description).toBe('string');
        expect(project.description.trim()).not.toBe('');

        expect(project.category).toBeDefined();
        expect(validCategories).toContain(project.category);

        expect(project.tags).toBeDefined();
        expect(Array.isArray(project.tags)).toBe(true);
        expect(project.tags.length).toBeGreaterThan(0);
        project.tags.forEach((tag) => {
          expect(typeof tag).toBe('string');
          expect(tag.trim()).not.toBe('');
        });
      });
    });

    it('should have unique project IDs', () => {
      const projects = getProjects();
      const ids = projects.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have optional highlight flag as boolean when present', () => {
      const projects = getProjects();
      projects.forEach((project: Project) => {
        if (project.highlight !== undefined) {
          expect(typeof project.highlight).toBe('boolean');
        }
      });
    });

    it('should have at least one highlighted project', () => {
      const projects = getProjects();
      const highlighted = projects.filter((p) => p.highlight === true);
      expect(highlighted.length).toBeGreaterThan(0);
    });

    it('should have tags sorted alphabetically', () => {
      const projects = getProjects();
      projects.forEach((project) => {
        const sorted = [...project.tags].sort();
        expect(project.tags).toEqual(sorted);
      });
    });
  });

  describe('projectStats', () => {
    it('should be defined', () => {
      expect(projectStats).toBeDefined();
    });

    it('should have all required stat fields', () => {
      const stats: ProjectStats = projectStats;
      expect(stats.totalProjects).toBeDefined();
      expect(stats.totalStudents).toBeDefined();
      expect(stats.partnerCompanies).toBeDefined();
      expect(stats.yearsOfExperience).toBeDefined();
    });

    it('should have string values for all stats', () => {
      expect(typeof projectStats.totalProjects).toBe('string');
      expect(typeof projectStats.totalStudents).toBe('string');
      expect(typeof projectStats.partnerCompanies).toBe('string');
      expect(typeof projectStats.yearsOfExperience).toBe('string');
    });

    it('should have numeric values with + suffix', () => {
      Object.values(projectStats).forEach((value) => {
        // Each stat should contain a number (possibly with commas) and end with +
        expect(value).toMatch(/^[\d,]+\+$/);
      });
    });
  });

  describe('getProjectCategories', () => {
    it('should return a non-empty array', () => {
      const projectCategories = getProjectCategories();
      expect(projectCategories).toBeDefined();
      expect(Array.isArray(projectCategories)).toBe(true);
      expect(projectCategories.length).toBeGreaterThan(0);
    });

    it('should have an "all" category as the first entry', () => {
      const projectCategories = getProjectCategories();
      expect(projectCategories[0].id).toBe('all');
    });

    it('should have valid structure for each category', () => {
      const projectCategories = getProjectCategories();
      projectCategories.forEach((category) => {
        expect(category.id).toBeDefined();
        expect(typeof category.id).toBe('string');

        expect(category.label).toBeDefined();
        expect(typeof category.label).toBe('string');

        expect(category.count).toBeDefined();
        expect(typeof category.count).toBe('number');
        expect(category.count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have "all" count equal to total number of projects', () => {
      const projects = getProjects();
      const projectCategories = getProjectCategories();
      const allCategory = projectCategories.find((c) => c.id === 'all');
      expect(allCategory).toBeDefined();
      expect(allCategory!.count).toBe(projects.length);
    });

    it('should have individual category counts that sum to total projects', () => {
      const projects = getProjects();
      const projectCategories = getProjectCategories();
      const nonAllCategories = projectCategories.filter((c) => c.id !== 'all');
      const sumOfCounts = nonAllCategories.reduce((sum, c) => sum + c.count, 0);
      expect(sumOfCounts).toBe(projects.length);
    });

    it('should have correct counts for each category', () => {
      const projects = getProjects();
      const projectCategories = getProjectCategories();
      const categoryIds = [
        'enterprise',
        'bootcamp',
        'education',
        'startup',
        'research',
      ];

      categoryIds.forEach((catId) => {
        const categoryEntry = projectCategories.find((c) => c.id === catId);
        expect(categoryEntry).toBeDefined();

        const actualCount = projects.filter((p) => p.category === catId).length;
        expect(categoryEntry!.count).toBe(actualCount);
      });
    });

    it('should include all category types that exist in projects', () => {
      const projects = getProjects();
      const projectCategories = getProjectCategories();
      const projectCategoryTypes = new Set(projects.map((p) => p.category));
      const categoryIds = new Set(projectCategories.map((c) => c.id));

      projectCategoryTypes.forEach((type) => {
        expect(categoryIds.has(type)).toBe(true);
      });
    });

    it('should have unique category IDs', () => {
      const projectCategories = getProjectCategories();
      const ids = projectCategories.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
