import { render, screen } from '@testing-library/react';
import React from 'react';
import CareerTab from '../CareerTab';

vi.mock('../../../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

describe('CareerTab', () => {
  it('renders section label and title', () => {
    render(<CareerTab />);

    expect(screen.getByText('profilePage.careerLabel')).toBeInTheDocument();
    expect(screen.getByText('profilePage.careerHistory')).toBeInTheDocument();
  });

  it('renders career items from data', () => {
    render(<CareerTab />);

    // getCareerData returns items with i18n keys as values
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.length).toBeGreaterThan(0);
  });

  it('shows "currently employed" badge for current positions', () => {
    render(<CareerTab />);

    const badges = screen.queryAllByText('profilePage.currentlyEmployed');
    // At least one career item should have current=true
    expect(badges.length).toBeGreaterThan(0);
  });
});
