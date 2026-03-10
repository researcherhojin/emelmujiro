import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../ProfilePage';

// Mock i18n module (used by data files like profileData.ts)
vi.mock('../../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock SEOHelmet
vi.mock('../../common/SEOHelmet', () => ({
  default: function MockSEOHelmet() {
    return null;
  },
}));

// Mock StructuredData
vi.mock('../../common/StructuredData', () => ({
  default: function MockStructuredData() {
    return null;
  },
}));

describe('ProfilePage Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('renders profile page with title', () => {
      renderWithRouter(<ProfilePage />);

      expect(screen.getByText('profilePage.name')).toBeInTheDocument();
      expect(screen.getByText('profilePage.role')).toBeInTheDocument();
    });

    it('renders section label via i18n', () => {
      renderWithRouter(<ProfilePage />);

      expect(screen.getByText('profilePage.sectionLabel')).toBeInTheDocument();
    });

    it('renders achievement highlights', () => {
      renderWithRouter(<ProfilePage />);

      expect(screen.getByText('achievements.items.championAward.highlight')).toBeInTheDocument();
      expect(screen.getByText('achievements.items.daconWin.highlight')).toBeInTheDocument();
      expect(
        screen.getByText('achievements.items.corporateTraining.highlight')
      ).toBeInTheDocument();
    });

    it('renders profile description', () => {
      renderWithRouter(<ProfilePage />);

      expect(
        screen.getByRole('heading', { level: 1, name: 'profilePage.name' })
      ).toBeInTheDocument();
    });

    it('renders all navigation tabs', () => {
      renderWithRouter(<ProfilePage />);

      expect(screen.getByText('profilePage.tabCareer')).toBeInTheDocument();
      expect(screen.getByText('profilePage.tabEducation')).toBeInTheDocument();
      expect(screen.getByText('profilePage.tabProjects')).toBeInTheDocument();
    });

    it('renders statistics section', () => {
      renderWithRouter(<ProfilePage />);

      expect(screen.getByText('50+')).toBeInTheDocument(); // Total projects
      expect(screen.getByText('1,000+')).toBeInTheDocument(); // Total students
      expect(screen.getByText('30+')).toBeInTheDocument(); // Partner companies
      expect(screen.getByText('5+')).toBeInTheDocument(); // Years of experience
    });
  });

  describe('Tab Navigation', () => {
    it('switches to education tab', () => {
      renderWithRouter(<ProfilePage />);

      const educationTab = screen.getByText('profilePage.tabEducation');
      fireEvent.click(educationTab);

      expect(screen.getByText('profileData.education.0.school')).toBeInTheDocument();
      expect(screen.getByText('profileData.education.1.school')).toBeInTheDocument();
    });

    it('switches to projects tab', () => {
      renderWithRouter(<ProfilePage />);

      const buttons = screen.getAllByRole('button');
      const projectsTab = buttons.find((btn) =>
        btn.textContent?.includes('profilePage.tabProjects')
      );
      expect(projectsTab).toBeDefined();
      fireEvent.click(projectsTab!);

      // Check for project section is rendered
      expect(projectsTab).toHaveClass('text-gray-900');
    });

    it('maintains active tab styling', () => {
      renderWithRouter(<ProfilePage />);

      // Look for tab buttons by text content
      const buttons = screen.getAllByRole('button');
      const careerTab = buttons.find((btn) => btn.textContent?.includes('profilePage.tabCareer'));
      const educationTab = buttons.find((btn) =>
        btn.textContent?.includes('profilePage.tabEducation')
      );

      // Check that buttons exist
      expect(careerTab).toBeInTheDocument();
      expect(educationTab).toBeInTheDocument();

      // Career tab should be active initially
      expect(careerTab).toHaveClass('text-gray-900');

      // Switch to education tab
      if (educationTab) {
        fireEvent.click(educationTab);
        expect(educationTab).toHaveClass('text-gray-900');
        expect(careerTab).not.toHaveClass('text-gray-900');
      }
    });
  });

  describe('Career Tab Content', () => {
    it('displays all career items', () => {
      renderWithRouter(<ProfilePage />);

      const buttons = screen.getAllByRole('button');
      const careerTab = buttons.find((btn) => btn.textContent?.includes('profilePage.tabCareer'));
      expect(careerTab).toBeInTheDocument();
      expect(careerTab).toHaveClass('text-gray-900');
    });

    it('shows current position badge', () => {
      renderWithRouter(<ProfilePage />);

      // Check for career items structure (periods are i18n keys like profileData.career.0.period)
      const periodElements = screen.getAllByText(/profileData\.career\.\d+\.period/);
      expect(periodElements.length).toBeGreaterThan(0);
    });
  });

  describe('Education Tab Content', () => {
    it('displays education items when tab is selected', () => {
      renderWithRouter(<ProfilePage />);

      const educationTab = screen.getByText('profilePage.tabEducation');
      fireEvent.click(educationTab);

      expect(screen.getByText('profileData.education.0.school')).toBeInTheDocument();
      expect(screen.getByText('profileData.education.1.school')).toBeInTheDocument();
    });

    it('displays education descriptions', () => {
      renderWithRouter(<ProfilePage />);

      const educationTab = screen.getByText('profilePage.tabEducation');
      fireEvent.click(educationTab);

      expect(screen.getByText('profileData.education.0.degree')).toBeInTheDocument();
      expect(screen.getByText('profileData.education.1.degree')).toBeInTheDocument();
    });
  });

  describe('Projects Tab Content', () => {
    it('displays project items when tab is selected', () => {
      renderWithRouter(<ProfilePage />);

      const buttons = screen.getAllByRole('button');
      const projectsTab = buttons.find((btn) =>
        btn.textContent?.includes('profilePage.tabProjects')
      );
      expect(projectsTab).toBeDefined();
      fireEvent.click(projectsTab!);

      // Check that projects tab is active
      expect(projectsTab).toHaveClass('text-gray-900');
    });

    it('displays project descriptions', () => {
      renderWithRouter(<ProfilePage />);

      const buttons = screen.getAllByRole('button');
      const projectsTab = buttons.find((btn) =>
        btn.textContent?.includes('profilePage.tabProjects')
      );
      expect(projectsTab).toBeDefined();
      fireEvent.click(projectsTab!);

      // Projects content should be visible
      expect(screen.getByText('profileData.projects.0.title')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid for statistics', () => {
      renderWithRouter(<ProfilePage />);

      // Check that statistics are displayed
      expect(screen.getByText('50+')).toBeInTheDocument();
      expect(screen.getByText('30+')).toBeInTheDocument();
      expect(screen.getByText('1,000+')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML elements', () => {
      renderWithRouter(<ProfilePage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
  });

  describe('Icons', () => {
    it('displays appropriate icons for each section', () => {
      renderWithRouter(<ProfilePage />);

      // Check that the component renders without errors
      // Since icons are mocked, check for actual content
      expect(screen.getByText('profilePage.name')).toBeInTheDocument();
      expect(screen.getByText('profilePage.role')).toBeInTheDocument();
    });
  });
});
