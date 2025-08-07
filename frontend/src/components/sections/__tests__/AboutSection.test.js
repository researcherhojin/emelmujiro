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
    expect(screen.getByText('About Me')).toBeInTheDocument();
  });

  it('displays all profile statistics', () => {
    render(<AboutSection />);

    // Check statistics display - using English text from component
    expect(screen.getByText('Teaching Experience')).toBeInTheDocument();
    expect(
      screen.getByText(`${STATISTICS.experience.yearsInEducation}+ Years`)
    ).toBeInTheDocument();

    expect(screen.getByText('Students Taught')).toBeInTheDocument();
    expect(screen.getByText(`${STATISTICS.stats.totalStudents}+ Students`)).toBeInTheDocument();

    expect(screen.getByText('Industry Experience')).toBeInTheDocument();
    expect(screen.getByText(`${STATISTICS.experience.yearsInIndustry}+ Years`)).toBeInTheDocument();

    expect(screen.getByText('Projects Completed')).toBeInTheDocument();
    expect(screen.getByText(`${STATISTICS.stats.completedProjects}+ Projects`)).toBeInTheDocument();
  });

  it('displays profile statistics icons', () => {
    render(<AboutSection />);

    // Some icons appear multiple times, so check they exist
    expect(screen.getAllByTestId('award-icon').length).toBeGreaterThan(0);
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bookopen-icon')).toBeInTheDocument();
  });

  it('displays profile introduction', () => {
    render(<AboutSection />);

    // Check for the English introduction text
    expect(screen.getByText(/passionate educator and developer/i)).toBeInTheDocument();
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
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('AI/ML')).toBeInTheDocument();
  });

  it('displays certifications section', () => {
    render(<AboutSection />);

    expect(screen.getByText('Certifications & Achievements')).toBeInTheDocument();
    expect(screen.getByTestId('graduationcap-icon')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    const { container } = render(<AboutSection />);
    const section = container.querySelector('#about');
    expect(section).toHaveClass('py-16', 'md:py-24', 'bg-gradient-to-b');
  });

  it('renders stats with correct colors', () => {
    const { container } = render(<AboutSection />);
    // Check for colored elements - emerald is used in the component
    const coloredElement = container.querySelector('.text-emerald-600');
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
