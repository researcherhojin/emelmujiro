import { render, screen } from '@testing-library/react';
import React from 'react';
import StatsSection from '../StatsSection';

vi.mock('../../../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

describe('StatsSection', () => {
  it('renders section label and title', () => {
    render(<StatsSection />);

    expect(screen.getByText('achievements.sectionLabel')).toBeInTheDocument();
    expect(screen.getByText('achievements.title')).toBeInTheDocument();
  });

  it('renders four stat cards', () => {
    render(<StatsSection />);

    expect(screen.getByText('profilePage.completedProjects')).toBeInTheDocument();
    expect(screen.getByText('profilePage.totalStudents')).toBeInTheDocument();
    expect(screen.getByText('profilePage.partnerCompanies')).toBeInTheDocument();
    expect(screen.getByText('profilePage.educationCareer')).toBeInTheDocument();
  });

  it('renders achievement highlights', () => {
    render(<StatsSection />);

    expect(screen.getByText('achievements.items.championAward.highlight')).toBeInTheDocument();
    expect(screen.getByText('achievements.items.daconWin.highlight')).toBeInTheDocument();
    expect(screen.getByText('achievements.items.corporateTraining.highlight')).toBeInTheDocument();
  });

  it('renders stat icons', () => {
    render(<StatsSection />);

    expect(screen.getByTestId('icon-Briefcase')).toBeInTheDocument();
    expect(screen.getByTestId('icon-GraduationCap')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Building')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Clock')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Trophy')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Medal')).toBeInTheDocument();
  });
});
