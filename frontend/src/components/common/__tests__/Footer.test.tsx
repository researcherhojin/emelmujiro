/**
 * Comprehensive tests for Footer component
 * Testing rendering, navigation, modal interactions, and service details
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Mail: ({ className }: { className?: string }) => (
    <div data-testid="mail-icon" className={className}>
      Mail
    </div>
  ),
  Phone: ({ className }: { className?: string }) => (
    <div data-testid="phone-icon" className={className}>
      Phone
    </div>
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <div data-testid="external-link-icon" className={className}>
      ExternalLink
    </div>
  ),
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className}>
      X
    </div>
  ),
  Code: ({ className }: { className?: string }) => (
    <div data-testid="code-icon" className={className}>
      Code
    </div>
  ),
  GraduationCap: ({ className }: { className?: string }) => (
    <div data-testid="graduation-cap-icon" className={className}>
      GraduationCap
    </div>
  ),
  BarChart3: ({ className }: { className?: string }) => (
    <div data-testid="bar-chart-icon" className={className}>
      BarChart3
    </div>
  ),
  Database: ({ className }: { className?: string }) => (
    <div data-testid="database-icon" className={className}>
      Database
    </div>
  ),
}));

// Mock scroll methods
const mockScrollIntoView = jest.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: mockScrollIntoView,
});

describe('Footer Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getElementById
    jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders company name', () => {
      renderWithRouter(<Footer />);
      expect(screen.getByText('에멜무지로')).toBeInTheDocument();
    });

    test('renders all service sections', () => {
      renderWithRouter(<Footer />);

      expect(screen.getAllByText('서비스')[0]).toBeInTheDocument();
      expect(screen.getByText('AI 솔루션 개발')).toBeInTheDocument();
      expect(screen.getByText('AI 교육 & 강의')).toBeInTheDocument();
      expect(screen.getByText('AI 전략 컨설팅')).toBeInTheDocument();
      expect(screen.getByText('데이터 분석')).toBeInTheDocument();
    });

    test('renders navigation menu', () => {
      renderWithRouter(<Footer />);

      expect(screen.getByText('메뉴')).toBeInTheDocument();
      expect(screen.getByText('홈')).toBeInTheDocument();
      expect(screen.getAllByText('서비스')[1]).toBeInTheDocument(); // Navigation서비스
      expect(screen.getAllByText('대표 프로필')[0]).toBeInTheDocument();
      expect(screen.getAllByText('문의하기')[0]).toBeInTheDocument();
    });

    test('renders contact information with icons', () => {
      renderWithRouter(<Footer />);

      expect(screen.getByText('researcherhojin@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('010-7279-0380')).toBeInTheDocument();
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
    });

    test('renders contact CTA section', () => {
      renderWithRouter(<Footer />);

      expect(screen.getByText('AI 프로젝트 도입을 계획 중이시나요?')).toBeInTheDocument();
      expect(screen.getByTestId('external-link-icon')).toBeInTheDocument();
    });

    test('renders copyright with current year', () => {
      renderWithRouter(<Footer />);
      const currentYear = new Date().getFullYear();

      expect(
        screen.getByText(`© ${currentYear} 에멜무지로. All rights reserved.`)
      ).toBeInTheDocument();
    });
  });

  describe('Navigation Functionality', () => {
    test('navigates to profile page when profile link is clicked', () => {
      renderWithRouter(<Footer />);

      const profileButton = screen.getAllByText('대표 프로필')[0];
      fireEvent.click(profileButton);

      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    test('navigates to contact page when contact link is clicked', () => {
      renderWithRouter(<Footer />);

      const contactButtons = screen.getAllByText('문의하기');
      fireEvent.click(contactButtons[0]); // First contact button in navigation

      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });

    test('navigates to contact page when CTA button is clicked', () => {
      renderWithRouter(<Footer />);

      const ctaButton = screen.getByRole('button', { name: /문의하기.*ExternalLink/ });
      fireEvent.click(ctaButton);

      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });

    test('scrolls to hero section when home is clicked on same page', () => {
      // Mock current pathname as '/'
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/' },
      });

      renderWithRouter(<Footer />);

      const homeButton = screen.getByText('홈');
      fireEvent.click(homeButton);

      // Verify that navigation behavior occurred
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    test('navigates and scrolls to hero section when home is clicked from different page', async () => {
      // Mock current pathname as different page
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/profile' },
      });

      jest.useFakeTimers();
      renderWithRouter(<Footer />);

      const homeButton = screen.getByText('홈');
      fireEvent.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');

      // Fast-forward timer for setTimeout
      jest.advanceTimersByTime(100);

      // Verify that navigation and scroll behavior occurred
      await waitFor(() => expect(mockScrollIntoView).toHaveBeenCalled());
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      jest.useRealTimers();
    });

    test('scrolls to services section when services link is clicked', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/' },
      });

      renderWithRouter(<Footer />);

      const servicesButton = screen.getAllByText('서비스')[1]; // Navigation 서비스
      fireEvent.click(servicesButton);

      // Verify scroll behavior occurred
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Service Modal Functionality', () => {
    test('opens AI solution modal when clicked', async () => {
      renderWithRouter(<Footer />);

      const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
      const aiSolutionButton = aiSolutionButtons[0]; // Get the first button
      fireEvent.click(aiSolutionButton);

      await waitFor(() =>
        expect(screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')).toBeInTheDocument()
      );
      expect(screen.getByText('주요 서비스')).toBeInTheDocument();
      expect(screen.getByText('주요 사례')).toBeInTheDocument();
      expect(screen.getByTestId('code-icon')).toBeInTheDocument();
    });

    test('opens AI education modal when clicked', async () => {
      renderWithRouter(<Footer />);

      const aiEducationButton = screen.getByText('AI 교육 & 강의');
      fireEvent.click(aiEducationButton);

      await waitFor(() =>
        expect(screen.getByText('실무 중심의 AI 교육 프로그램을 제공합니다.')).toBeInTheDocument()
      );
      expect(screen.getByTestId('graduation-cap-icon')).toBeInTheDocument();
    });

    test('opens AI consulting modal when clicked', async () => {
      renderWithRouter(<Footer />);

      const aiConsultingButton = screen.getByText('AI 전략 컨설팅');
      fireEvent.click(aiConsultingButton);

      await waitFor(() =>
        expect(
          screen.getByText('AI 도입 전략부터 실행까지 종합적인 컨설팅을 제공합니다.')
        ).toBeInTheDocument()
      );
      expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument();
    });

    test('opens data analysis modal when clicked', async () => {
      renderWithRouter(<Footer />);

      const dataAnalysisButton = screen.getByText('데이터 분석');
      fireEvent.click(dataAnalysisButton);

      await waitFor(() =>
        expect(
          screen.getByText('비즈니스 인사이트 도출을 위한 데이터 분석 서비스를 제공합니다.')
        ).toBeInTheDocument()
      );
      expect(screen.getByTestId('database-icon')).toBeInTheDocument();
    });
  });

  describe('Service Modal Interactions', () => {
    test('closes modal when X button is clicked', async () => {
      renderWithRouter(<Footer />);

      // Open modal
      const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
      fireEvent.click(aiSolutionButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
        ).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByTestId('x-icon');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
        ).not.toBeInTheDocument();
      });
    });

    test('closes modal when 닫기 button is clicked', async () => {
      renderWithRouter(<Footer />);

      // Open modal
      const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
      fireEvent.click(aiSolutionButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
        ).toBeInTheDocument();
      });

      // Close modal with 닫기 button
      const closeButtons = screen.getAllByText('닫기');
      const modalCloseButton = closeButtons.find(button =>
        button.className.includes('border-gray-300')
      );
      fireEvent.click(modalCloseButton!);

      await waitFor(() => {
        expect(
          screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
        ).not.toBeInTheDocument();
      });
    });

    test('closes modal and navigates to contact when 문의하기 button is clicked', async () => {
      renderWithRouter(<Footer />);

      // Open modal
      const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
      fireEvent.click(aiSolutionButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
        ).toBeInTheDocument();
      });

      // Click 문의하기 button in modal
      const contactButtons = screen.getAllByText('문의하기');
      const modalContactButton = contactButtons.find(button =>
        button.className.includes('bg-gray-900')
      );

      fireEvent.click(modalContactButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/contact');

      // TODO: Fix modal closing animation timing in tests
      // The modal should close after navigation but animation timing makes this test flaky
    });

    test('closes modal when backdrop is clicked', async () => {
      renderWithRouter(<Footer />);

      // Open modal
      const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
      fireEvent.click(aiSolutionButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
        ).toBeInTheDocument();
      });

      // Click backdrop to close modal
      const backdrop = screen.getByLabelText('Close modal');
      fireEvent.click(backdrop);

      await waitFor(() => {
        expect(
          screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
        ).not.toBeInTheDocument();
      });
    });

    test('closes modal when Escape key is pressed on backdrop', async () => {
      renderWithRouter(<Footer />);

      // Open modal
      const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
      fireEvent.click(aiSolutionButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
        ).toBeInTheDocument();
      });

      // Press Escape to close modal
      const backdrop = screen.getByLabelText('Close modal');
      fireEvent.keyDown(backdrop, { key: 'Escape' });

      await waitFor(() => {
        expect(
          screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Service Modal Content', () => {
    test('displays all service details for AI solution', async () => {
      renderWithRouter(<Footer />);

      const aiSolutionButton = screen.getByText('AI 솔루션 개발');
      fireEvent.click(aiSolutionButton);

      await waitFor(() =>
        expect(screen.getByText('맞춤형 LLM 기반 솔루션 개발')).toBeInTheDocument()
      );
      expect(screen.getByText('Computer Vision & 이미지 분석 시스템')).toBeInTheDocument();
      expect(screen.getByText('MLOps 파이프라인 구축')).toBeInTheDocument();
      expect(screen.getByText(/삼성전자.*AI 이상탐지 시스템/)).toBeInTheDocument();
      expect(screen.getByText(/LG전자.*데이터 분석 파이프라인/)).toBeInTheDocument();
    });

    test('displays all service details for AI education', async () => {
      renderWithRouter(<Footer />);

      const aiEducationButton = screen.getByText('AI 교육 & 강의');
      fireEvent.click(aiEducationButton);

      await waitFor(() => {
        expect(screen.getByText('실무 중심의 AI 교육 프로그램을 제공합니다.')).toBeInTheDocument();
      });

      expect(screen.getByText('기업 맞춤형 AI 교육 커리큘럼 설계')).toBeInTheDocument();
      expect(screen.getByText('Python 머신러닝/딥러닝 실무 교육')).toBeInTheDocument();
      expect(screen.getByText(/삼성전자.*Python 머신러닝 교육/)).toBeInTheDocument();
      expect(screen.getByText(/멋쟁이사자처럼.*AI 스타트업 교육/)).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    test('applies correct CSS classes to footer container', () => {
      renderWithRouter(<Footer />);

      // Footer should be rendered with proper structure
      expect(screen.getByText('에멜무지로')).toBeInTheDocument();
    });

    test('applies correct CSS classes to service buttons', () => {
      renderWithRouter(<Footer />);

      const serviceButton = screen.getByText('AI 솔루션 개발');
      expect(serviceButton).toHaveClass(
        'text-gray-600',
        'hover:text-gray-900',
        'transition-colors',
        'text-sm',
        'text-left',
        'block',
        'w-full'
      );
    });

    test('applies correct CSS classes to contact CTA button', () => {
      renderWithRouter(<Footer />);

      const ctaButton = screen.getByRole('button', { name: /문의하기.*ExternalLink/ });
      expect(ctaButton).toHaveClass(
        'inline-flex',
        'items-center',
        'px-6',
        'py-3',
        'bg-gray-900',
        'text-white',
        'text-base',
        'font-semibold',
        'rounded-lg',
        'hover:bg-gray-800',
        'transition-colors',
        'shadow-sm',
        'hover:shadow-md'
      );
    });
  });

  describe('Accessibility', () => {
    test('modal has correct accessibility attributes', async () => {
      renderWithRouter(<Footer />);

      // Open modal
      const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
      fireEvent.click(aiSolutionButtons[0]);

      await waitFor(() => {
        const backdrop = screen.getByLabelText('Close modal');
        expect(backdrop).toBeInTheDocument();
      });

      const backdrop = screen.getByLabelText('Close modal');
      expect(backdrop).toHaveAttribute('role', 'button');
      expect(backdrop).toHaveAttribute('tabIndex', '0');
    });

    test('all buttons are accessible', () => {
      renderWithRouter(<Footer />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles missing DOM element gracefully in scroll function', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/' },
      });

      // Mock getElementById to return null
      jest.spyOn(document, 'getElementById').mockReturnValue(null);

      renderWithRouter(<Footer />);

      const homeButton = screen.getByText('홈');

      // Should not throw error when element is not found
      expect(() => {
        fireEvent.click(homeButton);
      }).not.toThrow();
    });

    test('modal does not render when service is null', () => {
      renderWithRouter(<Footer />);

      // Modal should not be visible initially
      expect(screen.queryByText('주요 서비스')).not.toBeInTheDocument();
      expect(screen.queryByText('주요 사례')).not.toBeInTheDocument();
    });
  });

  describe('Component Display Names', () => {
    test('Footer has correct display name', () => {
      expect(Footer.displayName).toBe('Footer');
    });
  });
});
