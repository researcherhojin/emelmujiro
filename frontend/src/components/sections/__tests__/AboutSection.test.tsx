import { render, screen } from '@testing-library/react';
import AboutSection from '../AboutSection';
import { STATISTICS } from '../../../constants';
import React from 'react';

// Define type for motion component props
type MotionComponentProps = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      whileInView: _whileInView,
      initial: _initial,
      viewport: _viewport,
      transition: _transition,
      animate: _animate,
      ...props
    }: MotionComponentProps) => <div {...props}>{children}</div>,
    h2: ({
      children,
      whileInView: _whileInView,
      initial: _initial,
      viewport: _viewport,
      transition: _transition,
      animate: _animate,
      ...props
    }: MotionComponentProps) => <h2 {...props}>{children}</h2>,
    h3: ({
      children,
      whileInView: _whileInView,
      initial: _initial,
      viewport: _viewport,
      transition: _transition,
      animate: _animate,
      ...props
    }: MotionComponentProps) => <h3 {...props}>{children}</h3>,
    p: ({
      children,
      whileInView: _whileInView,
      initial: _initial,
      viewport: _viewport,
      transition: _transition,
      animate: _animate,
      ...props
    }: MotionComponentProps) => <p {...props}>{children}</p>,
    span: ({
      children,
      whileInView: _whileInView,
      initial: _initial,
      viewport: _viewport,
      transition: _transition,
      animate: _animate,
      ...props
    }: MotionComponentProps) => <span {...props}>{children}</span>,
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
  it('renders section with correct content', () => {
    render(<AboutSection />);
    // Check for the main heading
    expect(screen.getByText('About Me')).toBeInTheDocument();
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

  it('renders all main content sections', () => {
    render(<AboutSection />);
    // Verify main sections are present through their content
    expect(screen.getByText('Goals & Values')).toBeInTheDocument();
    expect(screen.getByText('Work Style')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
  });

  it('renders stats with correct content', () => {
    render(<AboutSection />);
    // Check for specific stat values instead of iterating
    // Since STATISTICS is a complex nested object, check for specific content
    expect(screen.getByText('1,000+')).toBeInTheDocument(); // totalStudentsText
    expect(screen.getByText('50+')).toBeInTheDocument(); // totalProjectsText
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
    render(<AboutSection />);
    const headings = screen.getAllByRole('heading');
    const headingTexts = headings.map(h => h.textContent);

    // Find main section headings (h2 and h3 with icons)
    const mainHeadings = headingTexts.filter(
      text =>
        text?.includes('About Me') ||
        text?.includes('Goals & Values') ||
        text?.includes('Work Style') ||
        text?.includes('Technical Skills') ||
        text?.includes('Certifications & Achievements')
    );

    expect(mainHeadings[0]).toContain('About Me');
    expect(mainHeadings[1]).toContain('Goals & Values');
    expect(mainHeadings[2]).toContain('Work Style');
    expect(mainHeadings[3]).toContain('Technical Skills');
    expect(mainHeadings[4]).toContain('Certifications & Achievements');
  });
});
