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
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const { container } = render(<AboutSection />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const section = container.querySelector('#about');
    expect(section).toBeInTheDocument();
  });

  it('displays the main title', () => {
    render(<AboutSection />);
    expect(screen.getByText('About Me')).toBeInTheDocument();
  });

  it('displays all profile statistics', () => {
    render(<AboutSection />);

    // Check statistics display - using Korean text from component
    expect(screen.getByText('교육 경력')).toBeInTheDocument();
    expect(screen.getByText(`${STATISTICS.experience.yearsInEducation}년+`)).toBeInTheDocument();

    expect(screen.getByText('교육 수료생')).toBeInTheDocument();
    expect(screen.getByText(`${STATISTICS.education.totalStudentsText}`)).toBeInTheDocument();

    expect(screen.getByText('협력 기업')).toBeInTheDocument();
    expect(
      screen.getByText(`${STATISTICS.experience.totalCompaniesWorkedWith}곳+`)
    ).toBeInTheDocument();

    expect(screen.getByText('강의 프로젝트')).toBeInTheDocument();
    expect(screen.getByText(`${STATISTICS.projects.totalProjectsText}`)).toBeInTheDocument();
  });

  it('displays profile statistics icons', () => {
    render(<AboutSection />);

    // Some icons appear multiple times, so check they exist
    expect(screen.getAllByTestId('award-icon').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('users-icon').length).toBeGreaterThan(0);
    expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bookopen-icon')).toBeInTheDocument();
  });

  it('displays profile introduction', () => {
    render(<AboutSection />);

    // Check for the Korean introduction text
    expect(screen.getByText(/에멜무지로 대표 이호진/)).toBeInTheDocument();
  });

  it('displays goals section', () => {
    render(<AboutSection />);

    expect(screen.getByText('Goals & Values')).toBeInTheDocument();
    expect(screen.getByTestId('target-icon')).toBeInTheDocument();
  });

  it('displays work style section', () => {
    render(<AboutSection />);

    expect(screen.getByText('Work Style')).toBeInTheDocument();
    expect(screen.getByTestId('brain-icon')).toBeInTheDocument();
  });

  it('displays skills section', () => {
    render(<AboutSection />);

    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByTestId('code-icon')).toBeInTheDocument();
  });

  it('displays skill categories', () => {
    render(<AboutSection />);

    // Check for skill categories
    expect(screen.getByText('Web Programming')).toBeInTheDocument();
    expect(screen.getByText('ML / DL / Data Engineering')).toBeInTheDocument();
    expect(screen.getByText('Collaboration & Tools')).toBeInTheDocument();
  });

  it('displays certifications section', () => {
    render(<AboutSection />);

    expect(screen.getByText('Certifications & Achievements')).toBeInTheDocument();
    expect(screen.getByTestId('graduationcap-icon')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    const { container } = render(<AboutSection />);
    const section = container.querySelector('#about');
    expect(section).toHaveClass('py-20', 'bg-white');
  });

  it('renders stats with correct colors', () => {
    const { container } = render(<AboutSection />);
    // Check for colored elements - gray is used in the component
    const coloredElement = container.querySelector('.text-gray-700');
    expect(coloredElement).toBeInTheDocument();
  });

  it('uses proper semantic HTML', () => {
    render(<AboutSection />);

    // Check for main heading
    expect(screen.getByRole('heading', { name: 'About Me' })).toBeInTheDocument();

    // Check for section headings
    expect(screen.getByRole('heading', { name: /Goals & Values/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Work Style/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Technical Skills/ })).toBeInTheDocument();
  });

  it('displays motivational quote', () => {
    render(<AboutSection />);

    // Check for the quote at the bottom of the section
    expect(screen.getByText(/비전공자도 쉽게 입문할 수 있는/)).toBeInTheDocument();
  });

  it('displays Star and Zap icons in section headers', () => {
    render(<AboutSection />);

    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
  });

  it('renders all sections in correct order', () => {
    const { container } = render(<AboutSection />);
    const headings = container.querySelectorAll('h2, h3');
    const headingTexts = Array.from(headings).map(h => h.textContent);

    expect(headingTexts[0]).toContain('About Me');
    expect(headingTexts[1]).toContain('Goals & Values');
    expect(headingTexts[2]).toContain('Work Style');
    expect(headingTexts[3]).toContain('Technical Skills');
    expect(headingTexts[4]).toContain('Certifications & Achievements');
  });
});
