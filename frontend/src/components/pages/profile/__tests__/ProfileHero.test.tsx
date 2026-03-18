import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ProfileHero from '../ProfileHero';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

describe('ProfileHero', () => {
  const onBackClick = vi.fn();

  beforeEach(() => {
    onBackClick.mockClear();
  });

  it('renders section label, name, and role', () => {
    render(<ProfileHero onBackClick={onBackClick} />);

    expect(screen.getByText('profilePage.sectionLabel')).toBeInTheDocument();
    expect(screen.getByText('profilePage.name')).toBeInTheDocument();
    expect(screen.getByText('profilePage.role')).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<ProfileHero onBackClick={onBackClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('profilePage.backToMain');
  });

  it('calls onBackClick when back button is clicked', () => {
    render(<ProfileHero onBackClick={onBackClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onBackClick).toHaveBeenCalledTimes(1);
  });
});
