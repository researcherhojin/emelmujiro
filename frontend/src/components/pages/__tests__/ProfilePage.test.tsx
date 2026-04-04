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

  it('renders filter pills for years and org types', () => {
    renderPage();

    // "All" pills (one for year, one for org type)
    const allButtons = screen.getAllByText('teachingHistory.filterAll');
    expect(allButtons).toHaveLength(2);

    // Org type pills
    expect(screen.getByText('teachingHistory.filterEnterprise')).toBeInTheDocument();
    expect(screen.getByText('teachingHistory.filterGovernment')).toBeInTheDocument();
    expect(screen.getByText('teachingHistory.filterUniversity')).toBeInTheDocument();
  });

  it('filters by year when year pill is clicked', () => {
    renderPage();

    // Click "2024" year pill
    const yearButtons = screen.getAllByText('2024');
    const yearPill = yearButtons.find((el) => el.tagName === 'BUTTON');
    expect(yearPill).toBeTruthy();
    fireEvent.click(yearPill!);

    // Should show filter count
    expect(screen.getByText(/teachingHistory\.filterResultCount/)).toBeInTheDocument();
  });

  it('filters by org type when org pill is clicked', () => {
    renderPage();

    fireEvent.click(screen.getByText('teachingHistory.filterEnterprise'));
    expect(screen.getByText(/teachingHistory\.filterResultCount/)).toBeInTheDocument();
  });

  it('shows no results message when filters match nothing', () => {
    renderPage();

    // Select a year with no university entries
    const year2026Buttons = screen.getAllByText('2026');
    const yearPill = year2026Buttons.find((el) => el.tagName === 'BUTTON');
    fireEvent.click(yearPill!);
    fireEvent.click(screen.getByText('teachingHistory.filterUniversity'));

    expect(screen.getByText('teachingHistory.noResults')).toBeInTheDocument();
  });
});
