import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ProjectsTab from '../ProjectsTab';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('../../../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

describe('ProjectsTab', () => {
  const onFilterChange = vi.fn();

  beforeEach(() => {
    onFilterChange.mockClear();
  });

  it('renders section label and title', () => {
    render(<ProjectsTab projectFilter="all" onFilterChange={onFilterChange} />);

    expect(screen.getByText('profilePage.projectsLabel')).toBeInTheDocument();
    expect(screen.getByText('profilePage.majorProjects')).toBeInTheDocument();
  });

  it('renders filter buttons from project categories', () => {
    render(<ProjectsTab projectFilter="all" onFilterChange={onFilterChange} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls onFilterChange when a filter button is clicked', () => {
    render(<ProjectsTab projectFilter="all" onFilterChange={onFilterChange} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Click a non-"all" filter
    expect(onFilterChange).toHaveBeenCalledTimes(1);
  });

  it('renders project cards when filter is "all"', () => {
    render(<ProjectsTab projectFilter="all" onFilterChange={onFilterChange} />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.length).toBeGreaterThan(0);
  });

  it('shows empty state message when no projects match filter', () => {
    // Use a filter that won't match any projects
    render(
      <ProjectsTab projectFilter={'nonexistent' as 'enterprise'} onFilterChange={onFilterChange} />
    );

    expect(screen.getByText('profilePage.noProjectsInCategory')).toBeInTheDocument();
  });

  it('highlights active filter button', () => {
    render(<ProjectsTab projectFilter="all" onFilterChange={onFilterChange} />);

    const buttons = screen.getAllByRole('button');
    // First button ("all") should have active styling
    expect(buttons[0].className).toContain('bg-gray-900');
  });
});
