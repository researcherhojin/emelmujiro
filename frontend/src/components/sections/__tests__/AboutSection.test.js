import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutSection from '../AboutSection';
import { STATISTICS } from '../../../constants';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
    },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Award: () => <div data-testid="award-icon">Award</div>,
    Users: () => <div data-testid="users-icon">Users</div>,
    Briefcase: () => <div data-testid="briefcase-icon">Briefcase</div>,
    BookOpen: () => <div data-testid="bookopen-icon">BookOpen</div>,
    Target: () => <div data-testid="target-icon">Target</div>,
    Heart: () => <div data-testid="heart-icon">Heart</div>,
    Brain: () => <div data-testid="brain-icon">Brain</div>,
    TrendingUp: () => <div data-testid="trendingup-icon">TrendingUp</div>,
    Code: () => <div data-testid="code-icon">Code</div>,
    GraduationCap: () => <div data-testid="graduationcap-icon">GraduationCap</div>,
    Star: () => <div data-testid="star-icon">Star</div>,
    Zap: () => <div data-testid="zap-icon">Zap</div>,
}));

describe('AboutSection Component', () => {
    it('renders section with correct ID', () => {
        const { container } = render(<AboutSection />);
        const section = container.querySelector('#about');
        expect(section).toBeInTheDocument();
    });

    it('displays the main title', () => {
        render(<AboutSection />);
        expect(screen.getByText('주요 협력 사례')).toBeInTheDocument();
    });

    it('displays all profile statistics', () => {
        render(<AboutSection />);
        
        // Check statistics display
        expect(screen.getByText('교육 경력')).toBeInTheDocument();
        expect(screen.getByText(`${STATISTICS.experience.yearsInEducation}년+`)).toBeInTheDocument();
        
        expect(screen.getByText('교육 수료생')).toBeInTheDocument();
        expect(screen.getByText(STATISTICS.education.totalStudentsText)).toBeInTheDocument();
        
        expect(screen.getByText('협력 기업')).toBeInTheDocument();
        expect(screen.getByText(`${STATISTICS.experience.totalCompaniesWorkedWith}곳+`)).toBeInTheDocument();
        
        expect(screen.getByText('강의 프로젝트')).toBeInTheDocument();
        expect(screen.getByText(STATISTICS.projects.totalProjectsText)).toBeInTheDocument();
    });

    it('displays profile statistics icons', () => {
        render(<AboutSection />);
        
        expect(screen.getByTestId('award-icon')).toBeInTheDocument();
        expect(screen.getAllByTestId('users-icon')).toHaveLength(2); // Used in stats and work style
        expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
        expect(screen.getByTestId('bookopen-icon')).toBeInTheDocument();
    });

    it('displays profile introduction', () => {
        render(<AboutSection />);
        
        expect(screen.getByText(/7년 이상의 교육 경력/)).toBeInTheDocument();
        expect(screen.getByText(/빅테크 기업/)).toBeInTheDocument();
        expect(screen.getByText(/스타트업/)).toBeInTheDocument();
        expect(screen.getByText(/공공기관/)).toBeInTheDocument();
    });

    it('displays goals section', () => {
        render(<AboutSection />);
        
        expect(screen.getByText('목표')).toBeInTheDocument();
        expect(screen.getByText('대체 불가능한 경쟁력 구축')).toBeInTheDocument();
        expect(screen.getByText(/AI Researcher로써/)).toBeInTheDocument();
        expect(screen.getByText('지식 공유를 통한 가치 창출')).toBeInTheDocument();
        expect(screen.getByText(/교육과 멘토링을 통해/)).toBeInTheDocument();
    });

    it('displays goal icons', () => {
        render(<AboutSection />);
        
        expect(screen.getByTestId('target-icon')).toBeInTheDocument();
        expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    it('displays work style section', () => {
        render(<AboutSection />);
        
        expect(screen.getByText('일하는 방식')).toBeInTheDocument();
        expect(screen.getByText('소통과 협업')).toBeInTheDocument();
        expect(screen.getByText('창의적 문제 해결')).toBeInTheDocument();
        expect(screen.getByText('트렌드 선도')).toBeInTheDocument();
    });

    it('displays work style descriptions', () => {
        render(<AboutSection />);
        
        expect(screen.getByText(/다양한 사람들과의 원활한 소통/)).toBeInTheDocument();
        expect(screen.getByText(/창의적인 아이디어로 문제를 해결/)).toBeInTheDocument();
        expect(screen.getByText(/인공지능 트렌드를 빠르게 캐치/)).toBeInTheDocument();
    });

    it('displays skills section', () => {
        render(<AboutSection />);
        
        expect(screen.getByText('기술 스택')).toBeInTheDocument();
        
        // Check skill categories
        expect(screen.getByText('Web Programming')).toBeInTheDocument();
        expect(screen.getByText('Data Analysis & Processing')).toBeInTheDocument();
        expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
        expect(screen.getByText('Backend')).toBeInTheDocument();
        expect(screen.getByText('Deployment')).toBeInTheDocument();
    });

    it('displays skill items', () => {
        render(<AboutSection />);
        
        // Web Programming skills
        expect(screen.getByText(/HTML\/CSS/)).toBeInTheDocument();
        expect(screen.getByText(/JavaScript/)).toBeInTheDocument();
        expect(screen.getByText(/React\.js/)).toBeInTheDocument();
        expect(screen.getByText(/Tailwind CSS/)).toBeInTheDocument();
        
        // Data Analysis skills
        expect(screen.getByText(/Python/)).toBeInTheDocument();
        expect(screen.getByText(/SQL/)).toBeInTheDocument();
        
        // AI skills
        expect(screen.getByText(/TensorFlow/)).toBeInTheDocument();
        expect(screen.getByText(/PyTorch/)).toBeInTheDocument();
        expect(screen.getByText(/Langchain/)).toBeInTheDocument();
        
        // Backend skills
        expect(screen.getByText(/Django/)).toBeInTheDocument();
        expect(screen.getByText(/FastAPI/)).toBeInTheDocument();
        
        // Deployment skills
        expect(screen.getByText(/Docker/)).toBeInTheDocument();
        expect(screen.getByText(/AWS/)).toBeInTheDocument();
    });

    it('applies correct CSS classes for styling', () => {
        const { container } = render(<AboutSection />);
        
        // Check section styling
        const section = container.querySelector('#about');
        expect(section).toHaveClass('py-20', 'bg-gray-50');
        
        // Check container styling
        const mainContainer = container.querySelector('.container');
        expect(mainContainer).toHaveClass('mx-auto', 'px-6');
    });

    it('renders stats with correct colors', () => {
        render(<AboutSection />);
        
        // Check colored stat values
        const greenStat = screen.getByText(STATISTICS.education.totalStudentsText);
        expect(greenStat).toHaveClass('text-green-600');
        
        const orangeStat = screen.getByText(STATISTICS.projects.totalProjectsText);
        expect(orangeStat).toHaveClass('text-orange-600');
    });

    it('renders skill categories with correct layout', () => {
        const { container } = render(<AboutSection />);
        
        // Check grid layout for skills
        const skillsGrid = container.querySelector('.grid.gap-8');
        expect(skillsGrid).toBeInTheDocument();
    });

    it('uses proper semantic HTML', () => {
        render(<AboutSection />);
        
        // Check heading hierarchy
        const mainHeading = screen.getByRole('heading', { level: 2, name: '주요 협력 사례' });
        expect(mainHeading).toBeInTheDocument();
        
        const subHeadings = screen.getAllByRole('heading', { level: 3 });
        expect(subHeadings.length).toBeGreaterThan(0);
    });
});