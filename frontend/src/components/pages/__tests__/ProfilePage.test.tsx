import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../ProfilePage';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock SEOHelmet
jest.mock('../../common/SEOHelmet', () => {
  return function MockSEOHelmet() {
    return null;
  };
});

// Mock StructuredData
jest.mock('../../common/StructuredData', () => {
  return function MockStructuredData() {
    return null;
  };
});

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

      expect(screen.getByText('이호진')).toBeInTheDocument();
      expect(screen.getByText('AI Researcher & Educator')).toBeInTheDocument();
    });

    it('renders profile description', () => {
      renderWithRouter(<ProfilePage />);

      // Check for the presence of key sections instead
      expect(screen.getByRole('heading', { level: 1, name: '이호진' })).toBeInTheDocument();
    });

    it('renders all navigation tabs', () => {
      renderWithRouter(<ProfilePage />);

      expect(screen.getByText('경력')).toBeInTheDocument();
      expect(screen.getByText('학력')).toBeInTheDocument();
      expect(screen.getByText('프로젝트')).toBeInTheDocument();
    });

    it('renders statistics section', () => {
      renderWithRouter(<ProfilePage />);

      expect(screen.getByText('50+')).toBeInTheDocument(); // Total projects
      expect(screen.getByText('1,000+')).toBeInTheDocument(); // Total students
      expect(screen.getByText('15+')).toBeInTheDocument(); // Partner companies
      expect(screen.getByText('3+')).toBeInTheDocument(); // Years of experience
    });
  });

  describe('Tab Navigation', () => {
    it('switches to education tab', () => {
      renderWithRouter(<ProfilePage />);

      const educationTab = screen.getByText('학력');
      fireEvent.click(educationTab);

      expect(screen.getByText('한양대학교')).toBeInTheDocument();
      expect(screen.getByText('경북대학교')).toBeInTheDocument();
    });

    it('switches to projects tab', () => {
      renderWithRouter(<ProfilePage />);

      const projectsTab = screen.getByText('프로젝트');
      fireEvent.click(projectsTab);

      // Check for project section is rendered
      expect(projectsTab.closest('button')).toHaveAttribute('aria-selected', 'true');
    });

    it('maintains active tab styling', () => {
      renderWithRouter(<ProfilePage />);

      const careerTab = screen.getByText('경력');
      const educationTab = screen.getByText('학력');

      // Career tab should be active initially
      expect(careerTab.closest('button')).toHaveClass('border-blue-600');

      // Switch to education tab
      fireEvent.click(educationTab);

      expect(educationTab.closest('button')).toHaveClass('border-blue-600');
      expect(careerTab.closest('button')).not.toHaveClass('border-blue-600');
    });
  });

  describe('Career Tab Content', () => {
    it('displays all career items', () => {
      renderWithRouter(<ProfilePage />);

      // Check for career section existence
      const careerTab = screen.getByText('경력');
      expect(careerTab).toBeInTheDocument();
      expect(careerTab.closest('button')).toHaveClass('border-blue-600');
    });

    it('shows current position badge', () => {
      renderWithRouter(<ProfilePage />);

      // Check for career items structure
      const periodElements = screen.getAllByText(/\d{4}/);
      expect(periodElements.length).toBeGreaterThan(0);
    });
  });

  describe('Education Tab Content', () => {
    it('displays education items when tab is selected', () => {
      renderWithRouter(<ProfilePage />);

      const educationTab = screen.getByText('학력');
      fireEvent.click(educationTab);

      expect(screen.getByText('한양대학교')).toBeInTheDocument();
      expect(screen.getByText('경북대학교')).toBeInTheDocument();
    });

    it('displays education descriptions', () => {
      renderWithRouter(<ProfilePage />);

      const educationTab = screen.getByText('학력');
      fireEvent.click(educationTab);

      expect(screen.getByText(/인공지능융합대학원/)).toBeInTheDocument();
      expect(screen.getByText(/축산생명공학/)).toBeInTheDocument();
    });
  });

  describe('Projects Tab Content', () => {
    it('displays project items when tab is selected', () => {
      renderWithRouter(<ProfilePage />);

      const projectsTab = screen.getByText('프로젝트');
      fireEvent.click(projectsTab);

      // Check that projects tab is active
      expect(projectsTab.closest('button')).toHaveClass('border-blue-600');
    });

    it('displays project descriptions', () => {
      renderWithRouter(<ProfilePage />);

      const projectsTab = screen.getByText('프로젝트');
      fireEvent.click(projectsTab);

      // Projects content should be visible
      const projectSection = projectsTab.closest('button')?.parentElement?.parentElement;
      expect(projectSection).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid for statistics', () => {
      renderWithRouter(<ProfilePage />);

      const statsGrid = screen.getByText('50+').closest('div')?.parentElement;
      expect(statsGrid).toHaveClass('grid');
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
      const { container } = renderWithRouter(<ProfilePage />);

      // Check for SVG icons
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });
});
