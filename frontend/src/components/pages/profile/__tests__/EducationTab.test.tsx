import { render, screen } from '@testing-library/react';
import React from 'react';
import EducationTab from '../EducationTab';

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

describe('EducationTab', () => {
  it('renders section label and title', () => {
    render(<EducationTab />);

    expect(screen.getByText('profilePage.educationLabel')).toBeInTheDocument();
    expect(screen.getByText('profilePage.educationHistory')).toBeInTheDocument();
  });

  it('renders education items from data', () => {
    render(<EducationTab />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders certifications section', () => {
    render(<EducationTab />);

    expect(screen.getByText('profilePage.certificationsTitle')).toBeInTheDocument();
    expect(screen.getByText('profilePage.adspTitle')).toBeInTheDocument();
    expect(screen.getByText('profilePage.ncsTitle')).toBeInTheDocument();
  });

  it('renders certification icons', () => {
    render(<EducationTab />);

    expect(screen.getByTestId('icon-Award')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Building')).toBeInTheDocument();
  });

  it('renders NCS score items', () => {
    render(<EducationTab />);

    expect(screen.getByText('profilePage.ncsStrategy')).toBeInTheDocument();
    expect(screen.getByText('profilePage.ncsDevelopment')).toBeInTheDocument();
    expect(screen.getByText('profilePage.ncsAI')).toBeInTheDocument();
  });
});
