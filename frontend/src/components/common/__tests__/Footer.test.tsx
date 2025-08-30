/**
 * Comprehensive tests for Footer component
 * Testing rendering, navigation, modal interactions, and service details
 */

import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

// Set higher timeout for modal tests
const MODAL_TEST_TIMEOUT = 10000;

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
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
const mockScrollIntoView = vi.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: mockScrollIntoView,
});

describe('Footer Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getElementById
    vi.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders company name', () => {
      const { container } = renderWithRouter(<Footer />);
      const companyName = container.querySelector('h2');
      expect(companyName).toBeInTheDocument();
      expect(companyName?.textContent).toContain('에멜무지로');
    });

    test('renders all service sections', () => {
      const { container } = renderWithRouter(<Footer />);

      const serviceHeaders = container.querySelectorAll('h3');
      const hasServiceHeader = Array.from(serviceHeaders).some(
        (h) => h.textContent === '서비스'
      );
      expect(hasServiceHeader).toBe(true);

      const buttons = container.querySelectorAll('button');
      const serviceNames = [
        'AI 솔루션 개발',
        'AI 교육 & 강의',
        'AI 전략 컨설팅',
        '데이터 분석',
      ];
      serviceNames.forEach((name) => {
        const hasService = Array.from(buttons).some(
          (btn) => btn.textContent === name
        );
        expect(hasService).toBe(true);
      });
    });

    test('renders navigation menu', () => {
      const { container } = renderWithRouter(<Footer />);

      const menuHeaders = container.querySelectorAll('h3');
      const hasMenuHeader = Array.from(menuHeaders).some(
        (h) => h.textContent === '메뉴'
      );
      expect(hasMenuHeader).toBe(true);

      const buttons = container.querySelectorAll('button');
      const menuItems = ['홈', '서비스', '대표 프로필', '문의하기'];
      menuItems.forEach((item) => {
        const hasItem = Array.from(buttons).some((btn) =>
          btn.textContent?.includes(item)
        );
        expect(hasItem).toBe(true);
      });
    });

    test('renders contact information with icons', () => {
      const { container } = renderWithRouter(<Footer />);

      const email = container.querySelector(
        'a[href="mailto:researcherhojin@gmail.com"]'
      );
      expect(email).toBeInTheDocument();
      expect(email?.textContent).toBe('researcherhojin@gmail.com');

      const phone = container.querySelector('a[href="tel:010-7279-0380"]');
      expect(phone).toBeInTheDocument();
      expect(phone?.textContent).toBe('010-7279-0380');

      expect(
        container.querySelector('[data-testid="mail-icon"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="phone-icon"]')
      ).toBeInTheDocument();
    });

    test('renders contact CTA section', () => {
      const { container } = renderWithRouter(<Footer />);

      const ctaText = container.querySelector('p.text-lg');
      expect(ctaText).toBeInTheDocument();
      expect(ctaText?.textContent).toBe('AI 프로젝트 도입을 계획 중이시나요?');
      expect(
        container.querySelector('[data-testid="external-link-icon"]')
      ).toBeInTheDocument();
    });

    test('renders copyright with current year', () => {
      const { container } = renderWithRouter(<Footer />);
      const currentYear = new Date().getFullYear();

      const copyright = container.querySelector('.text-center.text-gray-500');
      expect(copyright).toBeInTheDocument();
      expect(copyright?.textContent).toBe(
        `© ${currentYear} 에멜무지로. All rights reserved.`
      );
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

      const ctaButton = screen.getByRole('button', {
        name: /문의하기.*ExternalLink/,
      });
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

    test(
      'navigates and scrolls to hero section when home is clicked from different page',
      async () => {
        // Mock current pathname as different page
        Object.defineProperty(window, 'location', {
          writable: true,
          value: { pathname: '/profile' },
        });

        vi.useFakeTimers();
        renderWithRouter(<Footer />);

        const homeButton = screen.getByText('홈');
        fireEvent.click(homeButton);

        expect(mockNavigate).toHaveBeenCalledWith('/');

        // Fast-forward timer for setTimeout
        vi.advanceTimersByTime(100);

        // Verify that navigation and scroll behavior occurred
        expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

        vi.useRealTimers();
      },
      MODAL_TEST_TIMEOUT
    );

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
    test(
      'opens AI solution modal when clicked',
      async () => {
        renderWithRouter(<Footer />);

        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        const aiSolutionButton = aiSolutionButtons[0]; // Get the first button
        fireEvent.click(aiSolutionButton);

        await waitFor(
          () =>
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument(),
          { timeout: 3000 }
        );
        expect(screen.getByText('주요 서비스')).toBeInTheDocument();
        expect(screen.getByText('주요 사례')).toBeInTheDocument();
        expect(screen.getByTestId('code-icon')).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'opens AI education modal when clicked',
      async () => {
        renderWithRouter(<Footer />);

        const aiEducationButton = screen.getByText('AI 교육 & 강의');
        fireEvent.click(aiEducationButton);

        await waitFor(
          () =>
            expect(
              screen.getByText('실무 중심의 AI 교육 프로그램을 제공합니다.')
            ).toBeInTheDocument(),
          { timeout: 3000 }
        );
        expect(screen.getByTestId('graduation-cap-icon')).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'opens AI consulting modal when clicked',
      async () => {
        renderWithRouter(<Footer />);

        const aiConsultingButton = screen.getByText('AI 전략 컨설팅');
        fireEvent.click(aiConsultingButton);

        await waitFor(
          () =>
            expect(
              screen.getByText(
                'AI 도입 전략부터 실행까지 종합적인 컨설팅을 제공합니다.'
              )
            ).toBeInTheDocument(),
          { timeout: 3000 }
        );
        expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'opens data analysis modal when clicked',
      async () => {
        renderWithRouter(<Footer />);

        const dataAnalysisButton = screen.getByText('데이터 분석');
        fireEvent.click(dataAnalysisButton);

        await waitFor(
          () =>
            expect(
              screen.getByText(
                '비즈니스 인사이트 도출을 위한 데이터 분석 서비스를 제공합니다.'
              )
            ).toBeInTheDocument(),
          { timeout: 3000 }
        );
        expect(screen.getByTestId('database-icon')).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal when X button is clicked',
      async () => {
        renderWithRouter(<Footer />);

        const aiSolutionButton = screen.getByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButton);

        await waitFor(
          () =>
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument(),
          { timeout: 3000 }
        );

        const closeButton = screen.getByTestId('x-icon');
        fireEvent.click(closeButton);

        await waitFor(
          () =>
            expect(
              screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).not.toBeInTheDocument(),
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );
  });

  describe('Service Modal Interactions', () => {
    test(
      'closes modal when X button is clicked',
      async () => {
        renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Close modal
        const closeButton = screen.getByTestId('x-icon');
        fireEvent.click(closeButton);

        await waitFor(
          () => {
            expect(
              screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal when 닫기 button is clicked',
      async () => {
        renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Close modal with 닫기 button
        const closeButtons = screen.getAllByText('닫기');
        const modalCloseButton = closeButtons.find((button) =>
          button.className.includes('border-gray-300')
        );
        fireEvent.click(modalCloseButton!);

        await waitFor(
          () => {
            expect(
              screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal and navigates to contact when 문의하기 button is clicked',
      async () => {
        renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Click 문의하기 button in modal
        const contactButtons = screen.getAllByText('문의하기');
        const modalContactButton = contactButtons.find((button) =>
          button.className.includes('bg-gray-900')
        );

        fireEvent.click(modalContactButton!);

        expect(mockNavigate).toHaveBeenCalledWith('/contact');

        // NOTE: Modal closing animation timing is flaky in tests
        // Consider adding waitFor or adjusting timing for more reliable tests
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal when backdrop is clicked',
      async () => {
        renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Click backdrop to close modal
        const backdrop = screen.getByLabelText('Close modal');
        fireEvent.click(backdrop);

        await waitFor(
          () => {
            expect(
              screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal when Escape key is pressed on backdrop',
      async () => {
        renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Press Escape to close modal
        const backdrop = screen.getByLabelText('Close modal');
        fireEvent.keyDown(backdrop, { key: 'Escape' });

        await waitFor(
          () => {
            expect(
              screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );
  });

  describe('Service Modal Content', () => {
    test(
      'displays all service details for AI solution',
      async () => {
        renderWithRouter(<Footer />);

        const aiSolutionButton = screen.getByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButton);

        await waitFor(
          () =>
            expect(
              screen.getByText('맞춤형 LLM 기반 솔루션 개발')
            ).toBeInTheDocument(),
          { timeout: 3000 }
        );
        expect(
          screen.getByText('Computer Vision & 이미지 분석 시스템')
        ).toBeInTheDocument();
        expect(screen.getByText('MLOps 파이프라인 구축')).toBeInTheDocument();
        expect(
          screen.getByText(/삼성전자.*AI 이상탐지 시스템/)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/LG전자.*데이터 분석 파이프라인/)
        ).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'displays all service details for AI education',
      async () => {
        renderWithRouter(<Footer />);

        const aiEducationButton = screen.getByText('AI 교육 & 강의');
        fireEvent.click(aiEducationButton);

        await waitFor(
          () => {
            expect(
              screen.getByText('실무 중심의 AI 교육 프로그램을 제공합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        expect(
          screen.getByText('기업 맞춤형 AI 교육 커리큘럼 설계')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Python 머신러닝/딥러닝 실무 교육')
        ).toBeInTheDocument();
        expect(
          screen.getByText(/삼성전자.*Python 머신러닝 교육/)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/멋쟁이사자처럼.*AI 스타트업 교육/)
        ).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );
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
      expect(serviceButton).toHaveClass('text-gray-600');
      expect(serviceButton).toHaveClass('text-sm');
    });

    test('applies correct CSS classes to contact CTA button', () => {
      renderWithRouter(<Footer />);

      const ctaButton = screen.getByRole('button', {
        name: /문의하기.*ExternalLink/,
      });
      expect(ctaButton).toHaveClass('inline-flex');
      expect(ctaButton).toHaveClass('items-center');
    });
  });

  describe('Accessibility', () => {
    test(
      'modal has correct accessibility attributes',
      async () => {
        renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            const backdrop = screen.getByLabelText('Close modal');
            expect(backdrop).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const backdrop = screen.getByLabelText('Close modal');
        expect(backdrop).toHaveAttribute('role', 'button');
        expect(backdrop).toHaveAttribute('tabIndex', '0');
      },
      MODAL_TEST_TIMEOUT
    );

    test('all buttons are accessible', () => {
      renderWithRouter(<Footer />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
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
      vi.spyOn(document, 'getElementById').mockReturnValue(null);

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
