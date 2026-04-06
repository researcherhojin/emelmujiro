import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../../common/SEOHelmet', () => ({
  default: function MockSEOHelmet() {
    return null;
  },
}));

vi.mock('../../common/StructuredData', () => ({
  default: function MockStructuredData() {
    return null;
  },
}));

const mockGetTeachingHistory = vi.fn();
vi.mock('../../../data/profileData', async () => {
  const actual = await import('../../../data/profileData');
  return {
    ...actual,
    getTeachingHistory: (...args: unknown[]) => mockGetTeachingHistory(...args),
  };
});

import ProfilePage from '../ProfilePage';

describe('ProfilePage — edge cases', () => {
  const renderPage = () =>
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

  it('shows noResults message when filter yields empty results', () => {
    mockGetTeachingHistory.mockReturnValue([
      { organization: 'Corp', title: 'Training', year: 2025, orgType: 'enterprise' as const },
    ]);

    renderPage();
    fireEvent.click(screen.getByText('teachingHistory.filterMoel'));

    expect(screen.getByText('teachingHistory.noResults')).toBeInTheDocument();
  });

  it('renders upcoming badge when item has upcoming flag', () => {
    mockGetTeachingHistory.mockReturnValue([
      {
        organization: 'Future Corp',
        title: 'Upcoming Course',
        year: 2026,
        orgType: 'enterprise' as const,
        upcoming: true,
      },
    ]);

    renderPage();
    expect(screen.getByText('teachingHistory.upcoming')).toBeInTheDocument();
  });
});
