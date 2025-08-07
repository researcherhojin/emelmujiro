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
      
      expect(screen.getByRole('button', { name: /경력/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /학력/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /프로젝트/ })).toBeInTheDocument();
    });

    it('renders back button', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText('돌아가기')).toBeInTheDocument();
    });

    it('renders statistics section', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText('50+')).toBeInTheDocument();
      expect(screen.getByText('프로젝트')).toBeInTheDocument();
      expect(screen.getByText('1,000+')).toBeInTheDocument();
      expect(screen.getByText('교육생')).toBeInTheDocument();
      expect(screen.getByText('15+')).toBeInTheDocument();
      expect(screen.getByText('협력 기업')).toBeInTheDocument();
      expect(screen.getByText('3+')).toBeInTheDocument();
      expect(screen.getByText('교육 경력')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('shows career tab by default', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText('에멜무지로')).toBeInTheDocument();
      expect(screen.getByText('대표')).toBeInTheDocument();
    });

    it('switches to education tab', () => {
      renderWithRouter(<ProfilePage />);
      
      const educationTab = screen.getByRole('button', { name: /학력/ });
      fireEvent.click(educationTab);
      
      expect(screen.getByText('한양대학교 ERICA')).toBeInTheDocument();
      expect(screen.getByText('신소재공학과 학사')).toBeInTheDocument();
    });

    it('switches to projects tab', () => {
      renderWithRouter(<ProfilePage />);
      
      const projectsTab = screen.getByRole('button', { name: /프로젝트/ });
      fireEvent.click(projectsTab);
      
      expect(screen.getByText(/삼성전자 DS 부문 AI 교육/)).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    it('maintains active tab styling', () => {
      renderWithRouter(<ProfilePage />);
      
      const careerTab = screen.getByRole('button', { name: /경력/ });
      const educationTab = screen.getByRole('button', { name: /학력/ });
      
      // Career tab should be active initially
      expect(careerTab).toHaveClass('border-b-2', 'border-gray-900', 'text-gray-900');
      expect(educationTab).not.toHaveClass('border-b-2', 'border-gray-900');
      
      // Switch to education tab
      fireEvent.click(educationTab);
      
      expect(educationTab).toHaveClass('border-b-2', 'border-gray-900', 'text-gray-900');
      expect(careerTab).not.toHaveClass('border-gray-900');
    });
  });

  describe('Career Tab Content', () => {
    it('displays all career items', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText('에멜무지로')).toBeInTheDocument();
      expect(screen.getByText('Cobslab')).toBeInTheDocument();
      expect(screen.getByText('한양대학교 창업지원단')).toBeInTheDocument();
      expect(screen.getByText('Avikus')).toBeInTheDocument();
    });

    it('shows current position badge', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText('현재')).toBeInTheDocument();
      expect(screen.getByText('현재')).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('displays career periods correctly', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText('2024.12 ~ 현재')).toBeInTheDocument();
      expect(screen.getByText('2022.10 ~ 2024.09')).toBeInTheDocument();
    });
  });

  describe('Education Tab Content', () => {
    it('displays education items when tab is selected', () => {
      renderWithRouter(<ProfilePage />);
      
      const educationTab = screen.getByRole('button', { name: /학력/ });
      fireEvent.click(educationTab);
      
      expect(screen.getByText('한양대학교 ERICA')).toBeInTheDocument();
      expect(screen.getByText('신소재공학과 학사')).toBeInTheDocument();
      expect(screen.getByText('2012.03 ~ 2019.02')).toBeInTheDocument();
    });

    it('displays education descriptions', () => {
      renderWithRouter(<ProfilePage />);
      
      const educationTab = screen.getByRole('button', { name: /학력/ });
      fireEvent.click(educationTab);
      
      expect(screen.getByText(/재료공학 전공, 데이터 분석 및 AI 융합 연구/)).toBeInTheDocument();
    });
  });

  describe('Projects Tab Content', () => {
    it('displays project items when tab is selected', () => {
      renderWithRouter(<ProfilePage />);
      
      const projectsTab = screen.getByRole('button', { name: /프로젝트/ });
      fireEvent.click(projectsTab);
      
      expect(screen.getByText(/삼성전자 DS 부문 AI 교육/)).toBeInTheDocument();
      expect(screen.getByText(/DB생명 AI 실무 교육/)).toBeInTheDocument();
      expect(screen.getByText(/현대자동차 AI 이노베이션/)).toBeInTheDocument();
    });

    it('displays project years', () => {
      renderWithRouter(<ProfilePage />);
      
      const projectsTab = screen.getByRole('button', { name: /프로젝트/ });
      fireEvent.click(projectsTab);
      
      const yearElements = screen.getAllByText('2024');
      expect(yearElements.length).toBeGreaterThan(0);
      
      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    it('displays project descriptions', () => {
      renderWithRouter(<ProfilePage />);
      
      const projectsTab = screen.getByRole('button', { name: /프로젝트/ });
      fireEvent.click(projectsTab);
      
      expect(screen.getByText(/딥러닝 기초부터 실무 프로젝트까지/)).toBeInTheDocument();
      expect(screen.getByText(/GPT API 활용 실무 교육/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back to home when back button is clicked', () => {
      renderWithRouter(<ProfilePage />);
      
      const backButton = screen.getByText('돌아가기').closest('button');
      fireEvent.click(backButton!);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Responsive Design', () => {
    it('renders with proper responsive classes', () => {
      const { container } = renderWithRouter(<ProfilePage />);
      
      const mainContainer = container.querySelector('.max-w-6xl');
      expect(mainContainer).toBeInTheDocument();
      
      const paddingClasses = container.querySelector('.px-4.sm\\:px-6.lg\\:px-8');
      expect(paddingClasses).toBeInTheDocument();
    });

    it('applies responsive grid for statistics', () => {
      const { container } = renderWithRouter(<ProfilePage />);
      
      const statsGrid = container.querySelector('.grid.grid-cols-2.md\\:grid-cols-4');
      expect(statsGrid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithRouter(<ProfilePage />);
      
      const h1 = screen.getByRole('heading', { level: 1, name: '이호진' });
      expect(h1).toBeInTheDocument();
      
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('has accessible button labels', () => {
      renderWithRouter(<ProfilePage />);
      
      const backButton = screen.getByText('돌아가기').closest('button');
      expect(backButton).toBeDefined();
    });

    it('uses semantic HTML elements', () => {
      const { container } = renderWithRouter(<ProfilePage />);
      
      expect(container.querySelector('article')).toBeInTheDocument();
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('displays appropriate icons for each section', () => {
      renderWithRouter(<ProfilePage />);
      
      // Check for Building icon in career section
      expect(screen.getByText('경력').closest('button')?.querySelector('svg')).toBeInTheDocument();
      
      // Switch to education tab and check for School icon
      const educationTab = screen.getByRole('button', { name: /학력/ });
      fireEvent.click(educationTab);
      expect(screen.getByText('학력').closest('button')?.querySelector('svg')).toBeInTheDocument();
    });
  });
});