import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../ProfilePage';

vi.mock('../../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options?.returnObjects) return [key];
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
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

describe('ProfilePage — Teaching History', () => {
  const renderPage = () =>
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders page title and stats', () => {
    renderPage();

    expect(screen.getByText('teachingHistory.pageTitle')).toBeInTheDocument();
    expect(screen.getByText('teachingHistory.statsYears')).toBeInTheDocument();
    expect(screen.getByText('teachingHistory.statsCount')).toBeInTheDocument();
  });

  it('renders year headings', () => {
    renderPage();

    // Year text appears in both filter pills and section headings
    const headings = screen.getAllByRole('heading', { level: 2 });
    const yearHeadings = headings.filter((h) => /^20\d{2}$/.test(h.textContent || ''));
    expect(yearHeadings.length).toBe(5);
  });

  it('renders teaching history items', () => {
    renderPage();

    expect(screen.getByText('teachingHistory.0.org')).toBeInTheDocument();
    expect(screen.getByText('teachingHistory.0.title')).toBeInTheDocument();
  });

  it('renders upcoming badges for 2026 items', () => {
    renderPage();

    const badges = screen.getAllByText('teachingHistory.upcoming');
    expect(badges.length).toBe(2);
  });

  it('navigates home on back button click', () => {
    renderPage();

    const backButton = screen.getByText(/profilePage.backToMain/);
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders CTA section', () => {
    renderPage();

    expect(screen.getByText('cta.title')).toBeInTheDocument();
    expect(screen.getByText('common.contact')).toBeInTheDocument();
  });

  it('navigates to contact page on CTA button click', () => {
    renderPage();

    const ctaButton = screen.getByText('common.contact');
    fireEvent.click(ctaButton);

    expect(mockNavigate).toHaveBeenCalledWith('/contact');
  });

  it('has correct heading hierarchy', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0);
  });

  it('renders org type filter pills', () => {
    renderPage();

    expect(screen.getByText('teachingHistory.filterAll')).toBeInTheDocument();
    expect(screen.getByText('teachingHistory.filterEnterprise')).toBeInTheDocument();
    expect(screen.getByText('teachingHistory.filterMoel')).toBeInTheDocument();
    expect(screen.getByText('teachingHistory.filterGovernment')).toBeInTheDocument();
    expect(screen.getByText('teachingHistory.filterUniversity')).toBeInTheDocument();
  });

  it('filters by org type when pill is clicked', () => {
    renderPage();

    fireEvent.click(screen.getByText('teachingHistory.filterEnterprise'));
    expect(screen.getByText(/teachingHistory\.filterResultCount/)).toBeInTheDocument();
  });

  it('toggles filter off when same pill is clicked again', () => {
    renderPage();

    fireEvent.click(screen.getByText('teachingHistory.filterEnterprise'));
    expect(screen.getByText(/teachingHistory\.filterResultCount/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('teachingHistory.filterEnterprise'));
    expect(screen.queryByText(/teachingHistory\.filterResultCount/)).not.toBeInTheDocument();
  });
});
