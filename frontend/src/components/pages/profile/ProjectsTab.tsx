import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { getProjects, getProjectCategories } from '../../../data/profileData';

type ProjectCategory =
  | 'all'
  | 'enterprise'
  | 'bootcamp'
  | 'education'
  | 'startup'
  | 'research';

interface ProjectsTabProps {
  projectFilter: ProjectCategory;
  onFilterChange: (filter: ProjectCategory) => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = memo(
  ({ projectFilter, onFilterChange }) => {
    const { t } = useTranslation();
    const projects = getProjects();
    const projectCategories = getProjectCategories();

    const filteredProjects =
      projectFilter === 'all'
        ? projects
        : projects.filter((project) => project.category === projectFilter);

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
            {t('profilePage.projectsLabel')}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
            {t('profilePage.majorProjects')}
          </h2>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {projectCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onFilterChange(category.id as ProjectCategory)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  projectFilter === category.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category.label}
                <span className="ml-1 text-xs">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`group bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border ${
                project.highlight
                  ? 'border-gray-300 dark:border-gray-600 ring-2 ring-gray-200 dark:ring-gray-700'
                  : 'border-gray-200 dark:border-gray-700'
              } hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    {project.title}
                  </h3>
                  {project.highlight && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-bold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                      {t('profilePage.inProgress')}
                    </span>
                  )}
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                  {project.period}
                </span>
              </div>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed break-keep">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t('profilePage.noProjectsInCategory')}
            </p>
          </div>
        )}
      </div>
    );
  }
);

ProjectsTab.displayName = 'ProjectsTab';

export default ProjectsTab;
